/* jshint esversion: 6 */

var Parser = require('../src/parser');
//var bible = require('rcuv-usfm');
//var bible = require('cunp-usfm');

var bibles = [
  {name: 'RCUV', bible: require('rcuv-usfm')},
  {name: 'CUNP', bible: require('cunp-usfm')}
];

function run(argv, bible) {

  var bookName;
  var fromChapter;
  var fromVerse;
  var toChapter;
  var toVerse;
  let secondHalfOfFirstVerse = false;
  let firstHalfOfLastVerse = false;

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
  var fromVerseStr = fromParts.length > 1 ? fromParts[1] : undefined;
  if (fromVerseStr) {
    fromVerse = parseInt(fromVerseStr);
    if (fromVerseStr.endsWith('b')) {
      secondHalfOfFirstVerse = true;
    }
  }


  if (toParts) {
    toChapter = toParts.length > 1 ? parseInt(toParts[0]):fromChapter;
    var toVerseStr = toParts.length > 1 ? toParts[1] : toParts[0];
    toVerse = parseInt(toVerseStr);

    if (toVerseStr.endsWith('a')) {
      // To handle the following
      // e.g. ACT 9:1-19a
      // Just need the first half of the to verse text.
      firstHalfOfLastVerse = true;
    }

  }


  var parser = Parser(bible.pathOfFiles, bible.language);
  return parser.getBook(bookName).then( _book => {

    book = _book;
    return book.getChapterCount();

  }).then( _chapterCount => {

    return book.getTexts({
      fromChapter,
      fromVerse,
      toChapter,
      toVerse,
      secondHalfOfFirstVerse,
      firstHalfOfLastVerse
    });

  }).then( texts => {

    texts.forEach( text => console.log(text ));

  });

}

bibles.map( bible => {

  return () => {

    console.log(`*******************************`);
    console.log(`*     ${bible.name}`);
    console.log(`*******************************`);

    return run(process.argv, bible.bible).catch( err => {
      console.log("Error: ", err);
    })
  }

}).reduce( (promise, fn ) => {

  return promise.then( ()=> fn() )
}, Promise.resolve())


