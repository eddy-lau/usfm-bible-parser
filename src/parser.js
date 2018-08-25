/*jshint esversion: 6 */

const fs = require('fs');
const path = require('path');
const LineParser = require('./line-parser');

var usfmFilesDir;
var books;

function getBookData(fileName) {

  let fullPath = path.join(usfmFilesDir, fileName);
  return readFile(fullPath).then( contents => {
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

function createBook(fileName) {

  return getBookData(fileName).then( bookData => {

    return {
      index: bookData.index,
      id: bookData.id,
      name: bookData.name,
      description: bookData.description,
      shortName: bookData.id.toLowerCase(),
      fileName: fileName,
      getTexts: function(fromLine, toLine) {
        return loadText(this, fromLine, toLine);
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

function loadBooks() {

  return new Promise( (resolve, reject) => {

    fs.readdir(usfmFilesDir, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });

  }).then( fileNames => {

    return Promise.all(
      fileNames.map( fileName => {
        return createBook(fileName);
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
    return loadBooks().then( result => {
      books = result;
      return books;
    });
  }

}

function loadText(book, fromLine, toLine) {

  let fullPath = path.join(usfmFilesDir, book.fileName);
  return readFile(fullPath).then( contents => {
    return contents.split('\n');
  }).then( lines => {

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

  return loadText(book).then( lines => {

    onStartBook();
    lines.forEach( line => {
      LineParser.parseLine(line, opts);
    });
    onEndBook();

  });

}

function getBook(shortName) {

  return getBooks().then( books => {

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

module.exports = function(homeDir) {
  usfmFilesDir = homeDir;
  return {
    getBooks: getBooks,
    getBook: getBook
  };
};
