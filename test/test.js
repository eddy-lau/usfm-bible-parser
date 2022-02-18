/* jshint esversion: 6 */
const Parser = require('../src/parser');

function parseArguments(argv) {

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

  return {
    bookName,
    fromChapter,
    fromVerse,
    toChapter,
    toVerse,
    secondHalfOfFirstVerse,
    firstHalfOfLastVerse
  }
}

async function run(argv, bible) {

  let options = parseArguments(argv);
  var parser = Parser(bible.pathOfFiles, bible.language);
  book = await parser.getBook(options.bookName);
  chapterCount = await book.getChapterCount();

  console.log(`*******************************`);
  console.log(options);
  console.log(`*******************************`);

  let texts = await book.getTexts(options);
  return texts.forEach( text => console.log(text ));

}

async function main(argv) {

  const bibles = [
    {name: 'RCUV', bible: require('rcuv-usfm')},
    {name: 'CUNP', bible: require('cunp-usfm')}
  ];

  for (let i = 0; i<bibles.length; i++) {
    let bible = bibles[i]

    console.log(`*******************************`);
    console.log(`*     ${bible.name}`);
    console.log(`*******************************`);
    await run(argv, bible.bible)
  }

}

main(process.argv)

