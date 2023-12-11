/*jshint esversion: 6, node: true */
import * as fs from 'fs';
import * as path from 'path';
import LineParser from './line-parser';
import BibleBookData, { Language } from 'bible-book-data';
import { Book, LoadTextOptions, Scriptures } from './Book';
import { patch } from './patch';

async function getBookData(filePath:string) {

  const contents = await readFile(filePath);
  const lines = contents.split('\n');
  const bookLine = lines.find(line => {
    return LineParser.parseBookData(line) !== undefined;
  });
  if (bookLine) {
    return LineParser.parseBookData(bookLine);
  } else {
    return Promise.reject('Book data not found for file: ' + filePath);
  }

}

function createBook(filePath:string, lang:Language):Promise<Book> {

  return getBookData(filePath).then( bookData => {

    if (!bookData) {
      throw `Book data not found for file: ${filePath}`
    }

    var localizedData = BibleBookData(lang, [bookData.id]);

    const result:Book = {
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
      getTexts: function(arg1:number, arg2:number) {
        return loadText(this, arg1, arg2);
      },
      parse: function(opts:LoadTextOptions) {
        return parseBook(this, opts);
      },
      getChapterCount: function() {
        return getChapterCount(this);
      }
    };

    return result;

  });

}

function loadBooks(dir:string, lang:Language) {

  return new Promise<string[]>( (resolve, reject) => {

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

function readFile(path:string):Promise<string> {

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

function findVerse(verseNumber:number, lines:string[], chapter?:number) {

  var lineNumber = lines.findIndex( line => {
    let chap = LineParser.parseChapter(line);
    if (chapter !== undefined && chap !== undefined && chapter !== chap) {
      // Handle the case of CUNP JHN 7:53-8:11
      // Because CUNP doesn't have JHN 7:53.
      return true;
    }
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

function findSubjectFromVerse(verseNumber:number, lines:string[]) {

  const toVerseLine = findVerse(verseNumber, lines);
  if (toVerseLine < 0) {
    return -1;
  }

  for (let i = lines.length-1; i>toVerseLine; i-- ) {
    if (LineParser.parseSubject(lines[i]) !== undefined) {
      return i;
    }
    if (LineParser.parseParagraphText(lines[i]) !== undefined) {
      return -1;
    }
  }

  return -1;
}

function findSubjectInsideThisVerse(verseNumber:number, lines:string[]) {

  const verseLine = findVerse(verseNumber, lines);
  if (verseLine < 0) {
    return -1;
  }

  for (let i = verseLine+1; i<lines.length; i++) {
    if (LineParser.parseSubject(lines[i]) !== undefined) {
      return i;
    }
    if (LineParser.parseParagraphText(lines[i]) !== undefined) {
      return i;
    }
    const verseRange = LineParser.parseVerseRange(lines[i]);
    if (verseRange && verseRange.startVerse != verseNumber) {
      return -1;
    }
    if (LineParser.parseChapter(lines[i]) !== undefined) {
      return -1;
    }
  }

  return -1;
}

function insertBreakAfterSubject(lines:string[]) {

  var result:string[] = [];

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

function findLastParagraphText(lines:string[], toVerse:number, toChapter:number) {

  var lastIndex;

  for (var index = 0; index < lines.length; index++) {

    let line = lines[index];
    let range = LineParser.parseVerseRange(line);
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
function loadText(book:Book, arg1?:LoadTextOptions|Scriptures|number, arg2?:number):Promise<string[]> {

  var fromLine: number | undefined;
  var toLine: number | undefined;
  var fromChapter: number | undefined;
  var toChapter: number | undefined;
  var fromVerse: number | undefined;
  var toVerse: number | undefined;
  var secondHalfOfFirstVerse: boolean | undefined;
  var firstHalfOfLastVerse: boolean | undefined;

  if (arg1 && Array.isArray((arg1 as Scriptures).scriptures)) {

    const scriptures = (arg1 as Scriptures).scriptures!
    if (scriptures.length == 0) {
      return Promise.resolve([]);
    }

    return loadText(book, scriptures[0])
    .then( result => {

      (arg1 as Scriptures).scriptures = scriptures.slice(1);
      return loadText(book, arg1)
      .then( result2 => {
        return result.concat(result2);
      });

    });

  } else if (typeof(arg1)==='object') {
    const _arg1 = arg1 as LoadTextOptions
    fromLine = _arg1.fromLine;
    toLine = _arg1.toLine;
    fromChapter = _arg1.fromChapter;
    fromVerse = _arg1.fromVerse;
    toChapter = _arg1.toChapter;
    toVerse = _arg1.toVerse;
    secondHalfOfFirstVerse = _arg1.secondHalfOfFirstVerse;
    firstHalfOfLastVerse = _arg1.firstHalfOfLastVerse;
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

      if (fromVerse !== undefined && fromVerse > 1) {
        // fromLine is at beginning of chapter now.
        // search the from verse here

        var chapterLines = lines.slice(fromLine);
        var verseLine = findVerse(fromVerse, chapterLines, fromChapter);
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

      // Handle second half of first verse.
      // e.g. JHN 16:4b-16
      if (secondHalfOfFirstVerse && fromVerse !== undefined) {
        const subjectLine = findSubjectInsideThisVerse(fromVerse, lines.slice(fromLine));
        if (subjectLine >= 0) {
          fromLine += subjectLine;
        }
      }
    }

    if (toChapter && !toVerse) {

      const _toChapter = toChapter
      fromLine = fromLine || 0;
      toLine = lines.slice(fromLine).findIndex( line => {
        return LineParser.parseChapter(line) === (_toChapter+1);
      });
      toLine = toLine >= 0 ? toLine + fromLine : undefined;

    } else if (toChapter && toVerse) {

      const _toVerse = toVerse;
      var foundToVerse = false;
      var currentChapter = fromChapter || 1;
      fromLine = fromLine || 0;
      toLine = lines.slice(fromLine).findIndex( (line, index, array) => {

        if (currentChapter == toChapter) {
          var range = LineParser.parseVerseRange(line);
          var chapter = LineParser.parseChapter(line);
          var subject = LineParser.parseSubject(line);
          var chapterGroup = LineParser.parseChapterGroup(line);
          var paragraphText = LineParser.parseParagraphText(line);
          var lastVerseIndex;

          if (lastVerseIndex !== undefined) {
            return index == lastVerseIndex;
          }
          if (chapter && chapter != toChapter) {
            // found next chapter
            return true;
          }
          if (range && (_toVerse < range.startVerse)) {
            // found next verse
            return true;
          }
          if (chapterGroup) {
            // found "\ms" marker
            return true;
          }
          if (range && (range.startVerse <= _toVerse && _toVerse <= range.endVerse)) {
            foundToVerse = true;
          }
          if (subject && foundToVerse) {

            if (firstHalfOfLastVerse) {
              // e.g. ACT 9:1-19a
              return true;
            }

            // if subject is found, 
            // check if any text after the subject belongs to the 'to verse'.
            // if no, the subject is belongs to next verse.
            let lastIndex = findLastParagraphText(array.slice(index), _toVerse, toChapter);
            if (lastIndex !== undefined && lastIndex >= 0) {
              lastVerseIndex = index + lastIndex;
              return index == lastVerseIndex;
            }

            return true;
          }

          if (paragraphText && foundToVerse && firstHalfOfLastVerse) {
            return true;
          }

          return false;
        } else {
          currentChapter = LineParser.parseChapter(line) || currentChapter;
          return false;
        }

      });


      // FIXME 
      // (20231211: All the following should be fixed. Need to verify.)
      // 2PE 2:1-10a      2PE 2:10b-22
      // JHN 15:18-16:4a  JHN 16:4b-15
      // LUK 9:18-43a     LUK 9:43b-62
      // ACT 9:1-19a      ACT 9:19b-31
      // ISA 24:1-16a     ISA 24:16b-23

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

    const options = {fromChapter, fromVerse, toChapter, toVerse, firstHalfOfLastVerse, secondHalfOfFirstVerse};
    return patch(book, options, lines);

  });

}

function parseBook(book:Book, opts:LoadTextOptions) {

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

function getChapterCount(book:Book) {

  return loadText(book).then( lines => {

    var chapter:number = 0;
    lines.forEach( line => {
      var c = LineParser.parseChapter(line);
      if (c) {
        chapter += c;
      }
    });
    return chapter;

  });
}

export interface Bible {
  books?: Book[];
  lang: Language;
  dir: string;
  getBooks(): Promise<Book[]>
  getBook(shortName:string): Promise<Book>
}

function parseUsfm(dir:string, lang:Language) {
  return {
    lang: lang,
    dir: dir,
    getBooks: async function() {
      if (this.books) {
        return this.books;
      } else {
        this.books = await loadBooks(this.dir, this.lang);
        return this.books;
      }
    },
    getBook: async function(shortName:string) {
      const books = await this.getBooks();
      const book = books.find(book => {
        return book.shortName.toLowerCase() === shortName.toLowerCase();
      });
      if (!book) {
        return Promise.reject(new Error('Book not found'));
      }
      return book;
    }
  } as Bible;
}

export default parseUsfm;
export type { LoadTextOptions }