/*jshint esversion: 6 */

const fs = require('fs');
const path = require('path');
const LineParser = require('./line-parser');
const bookData = require('bible-book-data');

var books;

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
      return Promise.reject('Book data not found for file: ' + fileName);
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
      fileNames.map( fileName => {
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

  if (books) {
    return Promise.resolve(books);
  } else {
    return loadBooks(this.dir, this.lang).then( result => {
      books = result;
      return books;
    });
  }

}

function loadText(book, arg1, arg2) {

  var fromLine;
  var toLine;
  var fromChapter;
  var toChapter;
  var fromVerse;
  var toVerse;

  if (typeof(arg1)==='object') {
    fromLine = arg1.fromLine;
    toLine = arg1.toLine;
    fromChapter = arg1.fromChapter;
    fromVerse = arg1.fromVerse;
    toChapter = arg1.toChapter;
    toVerse = arg1.toVerse;
  } else if (typeof(arg1)==='number') {
    fromLine = arg1;
    toLine = arg2;
  }

  return readFile(book.filePath).then( contents => {
    return contents.split('\n');
  }).then( lines => {

    if (fromChapter) {
      fromLine = lines.findIndex( line => {
        return LineParser.parseChapter(line) === fromChapter;
      });
      if (fromLine < 0) {
        throw 'Invalid fromChapter paramter';
      }

      if (fromVerse > 1) {
        var foundPreviousVerse = true;
        var verseLine = lines.slice(fromLine).findIndex( line => {
          var range = LineParser.parseVerseRange(line);
          if (range) {
            if (range.endVerse === fromVerse - 1) {
              return true;
            } else if(range.startVerse <= fromVerse &&
                      fromVerse <= range.endVerse) {
              foundPreviousVerse = false;
              return true;
            }
          }
          return false;
        });
        if (verseLine < 0) {
          throw 'Invalid fromVerse parameter';
        }
        fromLine = fromLine + verseLine;
        if (foundPreviousVerse) {
          fromLine++;
        }
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

      var currentChapter = fromChapter || 1;
      fromLine = fromLine || 0;
      toLine = lines.slice(fromLine).findIndex( line => {

        if (currentChapter == toChapter) {
          var range = LineParser.parseVerseRange(line);
          return range && range.startVerse <= toVerse && toVerse <= range.endVerse;
        } else {
          currentChapter = LineParser.parseChapter(line) || currentChapter;
          return false;
        }

      });

      if (toLine < 0) {
        throw 'Invalid toVerse parameter';
      }

      toLine = toLine + fromLine + 1;
    }

    if (fromLine) {
      return lines.slice(fromLine, toLine);
    } else {
      return lines;
    }

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
      return book.shortName === shortName;
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
