/* jshint esversion: 6 */

var Parser = require('../src/parser');
var bible = require('rcuv-usfm');
//var bible = require('cunp-usfm');


function run(argv) {

  var bookName;
  var fromChapter;
  var fromVerse;
  var toChapter;
  var toVerse;

  var parts;
  if (argv.length == 4) {
    parts = [argv[2], argv[3]];
  } else if (argv.length == 3) {
    var parts = argv[2].split(' ');
    if (parts.length < 2) {
      throw 'Invalid paramter';
    }
  } else {
    throw 'Invalid number of parameter';
  }

  bookName = parts[0];
  parts = parts[1].split('-');
  var fromParts = parts[0].split(':');
  var toParts = parts.length > 1 ? parts[1].split(':'):undefined;
  fromChapter = parseInt(fromParts[0]);
  fromVerse = fromParts.length > 1 ? parseInt(fromParts[1]):undefined;
  if (toParts) {
    toChapter = toParts.length > 1 ? parseInt(toParts[0]):fromChapter;
    toVerse = toParts.length > 1 ? parseInt(toParts[1]):parseInt(toParts[0]);
  }


  var parser = Parser(bible.pathOfFiles, bible.language);
  return parser.getBook(bookName).then( _book => {

    book = _book;
    return book.getChapterCount();

  }).then( _chapterCount => {

    return book.getTexts({
      fromChapter: fromChapter,
      fromVerse: fromVerse,
      toChapter: toChapter,
      toVerse: toVerse
    });

  }).then( texts => {

    texts.forEach( text => console.log(text ));

  });

}

run(process.argv).catch( err => {
  console.log("Error: ", err);
});
