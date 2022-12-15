/*jshint esversion: 6, node: true */
const fs = require('fs');
const path = require('path');
const LineParser = require('./line-parser');

function getBookData(filePath) {

  return readFile(filePath).then( contents => {
    return contents.split('\n');
  }).then( lines => {

    return lines.find( line => {
      return LineParser.parseBookData(line) !== undefined;
    });

  }).then( line => {

    if (line) {
      return LineParser.parseBookData(line);
    } else {
      return Promise.reject('Book data not found for file: ' + filePath);
    }

  });

}

function replaceText(lines, fromText, toText) {
  return lines.map( line => {
    if (line == fromText) {
      return toText;
    } else {
      return line;
    }
  });
}

function createBook(filePath, lang) {

  return getBookData(filePath).then( bookData => {

    var localizedData = require('bible-book-data')(lang, [bookData.id]);

    return {
      index: bookData.index,
      id: bookData.id,
      name: bookData.name,
      localizedName: localizedData[0].name,
      localizedAbbreviation: localizedData[0].abbreviation,
      localizedAltNames: localizedData[0]['alternate-names'] || [],
      description: bookData.description,
      shortName: bookData.id.toLowerCase(),
      fileName: path.basename(filePath),
      filePath: filePath,
      localizedData: localizedData[0],
      getTexts: function(arg1, arg2) {
        return loadText(this, arg1, arg2);
      },
      parse: function(opts) {
        return parseBook(this, opts);
      },
      getChapterCount: function() {
        return getChapterCount(this);
      }
    };

  });

}

function loadBooks(dir, lang) {

  return new Promise( (resolve, reject) => {

    fs.readdir(dir, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });

  }).then( fileNames => {

    return Promise.all(
      fileNames
      .filter(fileName => {
        return fileName.endsWith('.USFM') ||
          fileName.endsWith('.usfm') ||
          fileName.endsWith('.txt');
      }).map( fileName => {
        var filePath = path.join(dir, fileName);
        return createBook(filePath, lang);
      })
    );

  }).then( books => {

    return books.sort( (lhs, rhs) => {
      return parseInt(lhs.index) - parseInt(rhs.index);
    });

  });
}

function readFile(path) {

  return new Promise( (resolve, reject) => {

    fs.readFile(path, 'utf8', (err, contents) => {
      if (err) {
        reject(err);
      } else {
        resolve(contents);
      }
    });

  });
}

function getBooks() {

  if (this.books) {
    return Promise.resolve(this.books);
  } else {
    return loadBooks(this.dir, this.lang).then( result => {
      this.books = result;
      return this.books;
    });
  }

}

function findVerse(verseNumber, lines) {

  var lineNumber = lines.findIndex( line => {
    var range = LineParser.parseVerseRange(line);
    if (range) {
      if (range.endVerse === verseNumber) {
        return true;
      } else if(range.startVerse <= verseNumber &&
                verseNumber <= range.endVerse) {
        return true;
      }
    }
    return false;
  });

  if (lineNumber > 0) {
    const PARAGRAPH_BREAKS = [
      '\\b', '\\m', '\\nb', '\\p', '\\ps', '\\q', '\\q1', '\\q2', '\\q3'
    ];
    if (PARAGRAPH_BREAKS.includes(lines[lineNumber-1].trim())) {
      return lineNumber - 1;
    }
  }


  return lineNumber;
}

function findSubjectLine(lines) {

  return lines.findIndex( line => {
    return LineParser.parseSubject(line) !== undefined;
  });
}

function findSubjectFromVerse(verseNumber, lines) {

  var verseLine = findVerse(verseNumber, lines);
  if (verseLine < 0) {
    return -1;
  }

  var subjectLine = findSubjectLine(lines.slice(verseLine));
  if (subjectLine < 0) {
    return -1;
  }

  return verseLine + subjectLine;

}

function insertBreakAfterSubject(lines) {

  var result = [];

  lines.forEach( (line, index) => {

    result.push(line);
    if (LineParser.parseSubject(line) !== undefined) {
      if (index < lines.length - 1) {
        var nextLine = lines[index+1];
        if (!nextLine.startsWith('\\r')) {
          result.push('\\b');
        }
      }

    }

  });

  return result;

}

function findLastParagraphText(lines, toVerse, toChapter) {

  var lastIndex;

  for (var index = 0; index < lines.length; index++) {

    let line = lines[index];
    var range = LineParser.parseVerseRange(line);
    var chapter = LineParser.parseChapter(line);
    var paragraphText = LineParser.parseParagraphText(line);
    var chapterGroup = LineParser.parseChapterGroup(line);

    if (chapter && chapter != toChapter) {
      // found next chapter
      break;
    }
    if (range && (toVerse < range.startVerse)) {
      // found next verse
      break;
    }
    if (chapterGroup) {
      break;
    }

    if (paragraphText) {
      lastIndex = index;
    }

  }

  return lastIndex;
}

function loadText(book, arg1, arg2) {

  var fromLine;
  var toLine;
  var fromChapter;
  var toChapter;
  var fromVerse;
  var toVerse;
  var secondHalfOfFirstVerse;
  var firstHalfOfLastVerse;

  if (arg1 && Array.isArray(arg1.scriptures)) {

    if (arg1.scriptures.length == 0) {
      return Promise.resolve([]);
    }

    return loadText(book, arg1.scriptures[0])
    .then( result => {

      arg1.scriptures = arg1.scriptures.slice(1);
      return loadText(book, arg1)
      .then( result2 => {
        return result.concat(result2);
      });

    });

  } else if (typeof(arg1)==='object') {
    fromLine = arg1.fromLine;
    toLine = arg1.toLine;
    fromChapter = arg1.fromChapter;
    fromVerse = arg1.fromVerse;
    toChapter = arg1.toChapter;
    toVerse = arg1.toVerse;
    secondHalfOfFirstVerse = arg1.secondHalfOfFirstVerse;
    firstHalfOfLastVerse = arg1.firstHalfOfLastVerse;
  } else if (typeof(arg1)==='number') {
    fromLine = arg1;
    toLine = arg2;
  }

  return readFile(book.filePath).then( contents => {
    return contents.split('\n');
  }).then( lines => {

    lines = insertBreakAfterSubject(lines);

    if (fromChapter) {
      fromLine = lines.findIndex( line => {
        return LineParser.parseChapter(line) === fromChapter;
      });
      if (fromLine < 0) {
        throw 'Invalid fromChapter paramter';
      }

      if (fromVerse > 1) {
        // fromLine is at beginning of chapter now.
        // search the from verse here

        var chapterLines = lines.slice(fromLine);
        var verseLine = findVerse(fromVerse, chapterLines);
        if (verseLine < 0) {
          throw 'Invalid fromVerse parameter';
        }

        // Find if there is a subject before ths line
        var subjectLine = findSubjectFromVerse(fromVerse - 1, chapterLines.slice(0, verseLine));
        if (subjectLine >= 0) {
          verseLine = subjectLine;
        }

        fromLine = fromLine + verseLine;

      } else {
        // Skip the first chapter line
        fromLine = fromLine + 1;
      }
    }

    if (toChapter && !toVerse) {

      fromLine = fromLine || 0;
      toLine = lines.slice(fromLine).findIndex( line => {
        return LineParser.parseChapter(line) === (toChapter+1);
      });
      toLine = toLine >= 0 ? toLine + fromLine : undefined;

    } else if (toChapter && toVerse) {

      var foundToVerse = false;
      var currentChapter = fromChapter || 1;
      fromLine = fromLine || 0;
      toLine = lines.slice(fromLine).findIndex( (line, index, array) => {

        if (currentChapter == toChapter) {
          var range = LineParser.parseVerseRange(line);
          var chapter = LineParser.parseChapter(line);
          var subject = LineParser.parseSubject(line);
          var chapterGroup = LineParser.parseChapterGroup(line);
          var lastVerseIndex;

          if (lastVerseIndex !== undefined) {
            return index == lastVerseIndex;
          }
          if (chapter && chapter != toChapter) {
            // found next chapter
            return true;
          }
          if (range && (toVerse < range.startVerse)) {
            // found next verse
            return true;
          }
          if (chapterGroup) {
            return true;
          }
          if (range && (range.startVerse <= toVerse && toVerse <= range.endVerse)) {
            foundToVerse = true;
          }
          if (subject && foundToVerse) {

            if (firstHalfOfLastVerse) {
              // e.g. ACT 9:1-19a
              return true;
            }
            // FIXME

            // 2PE 2:1-10a      2PE 2:10b-22
            // JHN 15:18-16:4a  JHN 16:4b-15
            // LUK 9:18-43a     LUK 9:43b-62
            // ACT 9:1-19a      ACT 9:19b-31
            // ISA 24:1-16a     ISA 24:16b-23


            // if subject is found, 
            // check if any text after the subject belongs to the 'to verse'.
            // if no, the subject is belongs to next verse.
            let lastIndex = findLastParagraphText(array.slice(index), toVerse, toChapter);
            if (lastIndex >= 0) {
              lastVerseIndex = index + lastIndex;
              return index == lastVerseIndex;
            }

            return true;
          }

          return false;
        } else {
          currentChapter = LineParser.parseChapter(line) || currentChapter;
          return false;
        }

      });

      if (toLine < 0) {
        //if (foundToVerse) {
          toLine = undefined;
        // } else {
        //   var pos = book.name + ' ' + fromChapter + ':' + fromVerse + '-' +
        //             toChapter + ':' + toVerse;
        //   throw 'Invalid toVerse parameter: ' + pos;
        // }
      } else {
        toLine = toLine + fromLine;
      }
    }

    if (fromLine) {
      return lines.slice(fromLine, toLine);
    } else {
      return lines;
    }

  }).then (lines => {

    // 1SA 2:11a
    if (book.id == '1SA' && toChapter == 2 && toVerse == 11 && firstHalfOfLastVerse) {

      lines = replaceText(lines, 
        '\\v 11 \\pn 以利加拿\\pn*往\\pn 拉瑪\\pn*回自己的家去了。那孩子在\\pn 以利\\pn*祭司面前事奉耶和華。',
        '\\v 11 \\pn 以利加拿\\pn*往\\pn 拉瑪\\pn*回自己的家去了。'
      );

      lines = replaceText(lines,
        '\\v 11 \\pn 以利加拿\\pn*往\\pn 拉瑪\\pn*回家去了。那孩子在祭司\\pn 以利\\pn*面前事奉耶和華。',
        '\\v 11 \\pn 以利加拿\\pn*往\\pn 拉瑪\\pn*回家去了。'
      );

    }

    // 1SA 2:11b
    if (book.id == '1SA' && fromChapter == 2 && fromVerse == 11 && secondHalfOfFirstVerse) {

      lines = replaceText(lines, 
        '\\v 11 \\pn 以利加拿\\pn*往\\pn 拉瑪\\pn*回家去了。那孩子在祭司\\pn 以利\\pn*面前事奉耶和華。',
        '\\p 那孩子在祭司\\pn 以利\\pn*面前事奉耶和華。',
      );

      lines = replaceText(lines,
        '\\v 11 \\pn 以利加拿\\pn*往\\pn 拉瑪\\pn*回自己的家去了。那孩子在\\pn 以利\\pn*祭司面前事奉耶和華。',
        '\\p 那孩子在\\pn 以利\\pn*祭司面前事奉耶和華。',
      );

    }

    // 1SA 4:1b
    if (book.id == '1SA' && fromChapter == 4 && fromVerse == 1 && secondHalfOfFirstVerse) {

      lines = replaceText(lines,
        '\\v 1 \\pn 撒母耳\\pn*的話傳遍了全\\pn 以色列\\pn*。',
        '\\p',
      );
    }

    // 2SA 12:15b
    if (book.id == '2SA' && fromChapter == 12 && fromVerse == 15 && secondHalfOfFirstVerse) {

      lines = replaceText(lines,
        '\\v 15 \\pn 拿單\\pn*就回家去了。',
        '\\p',
      );
    }

    // PSA 73:1-14
    if (book.id == 'PSA' && fromChapter == 73 && fromVerse == 1) {

      if (!lines.find(line => line == '\\d 亞薩的詩。')) {
        lines = ['\\d 亞薩的詩。', ...lines];
      }

    }

    // 2KI 5:1-19a
    if (book.id == '2KI' && toChapter == 5 && toVerse == 19 && firstHalfOfLastVerse) {

      lines = replaceText(lines,
        '\\p \\pn 乃縵\\pn*就離開他去了；走了不遠，',
        '\\p',
      );

      lines = replaceText(lines,
        '\\p \\pn 乃縵\\pn*離開他去了。走了一小段路，',
        '\\p',
      );
    }

    // 2KI 5:19b-27
    if (book.id == '2KI' && fromChapter == 5 && fromVerse == 19 && secondHalfOfFirstVerse) {

      lines = replaceText(lines,
        '\\v 19 \\pn 以利沙\\pn*對他說：「你可以平平安安地回去！」',
        '\\p',
      );

      lines = replaceText(lines,
        '\\v 19 \\pn 以利沙\\pn*對他說：「你平安地回去吧！」',
        '\\p',
      );

    }

    return lines;

  });

}

function parseBook(book, opts) {

  opts = opts || {};
  var onStartBook = opts.onStartBook || function(){};
  var onEndBook = opts.onEndBook || function(){};

  return loadText(book, opts).then( lines => {

    onStartBook();
    lines.forEach( line => {
      LineParser.parseLine(line, opts);
    });
    onEndBook();

  });

}

function getBook(shortName) {

  return this.getBooks().then( books => {

    return books.find( book => {
      return book.shortName.toLowerCase() === shortName.toLowerCase();
    });

  }).then( book => {
    if (!book) {
      return Promise.reject(new Error('Book not found'));
    }
    return book;
  });
}

function getChapterCount(book) {

  return loadText(book).then( lines => {

    var chapter;
    lines.forEach( line => {
      var c = LineParser.parseChapter(line);
      if (c) {
        chapter = c;
      }
    });
    return chapter;

  });
}

module.exports = function(dir, lang) {
  return {
    lang: lang,
    dir: dir,
    getBooks: getBooks,
    getBook: getBook
  };
};
