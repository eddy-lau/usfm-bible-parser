import { exit } from "process";
import * as RCUV from "rcuv-usfm";
import * as CUNP from "cunp-usfm";

/* jshint esversion: 6 */
import Parser, { LoadTextOptions } from '../src/main';

function parseArguments(argv:string[]): LoadTextOptions & { bookName:string } {

  var bookName:string;
  var fromChapter:number;
  var fromVerse:number|undefined;
  var toChapter:number|undefined;
  var toVerse:number|undefined;
  let secondHalfOfFirstVerse = false;
  let firstHalfOfLastVerse = false;

  var parts:string[];
  if (argv.length == 4) {
    parts = [argv[2], argv[3]];
  } else if (argv.length == 3) {
    parts = argv[2].split(' ');
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

async function run(argv:string[], bible:any) {

  let options = parseArguments(argv);
  var parser = Parser(bible.pathOfFiles, bible.language);
  let book = await parser.getBook(options.bookName);
  let chapterCount = await book.getChapterCount();

  console.log(`*******************************`);
  console.log(options);
  console.log(`*******************************`);

  let texts = await book.getTexts(options);
  return texts.forEach( text => console.log(text ));

}

async function main(argv:string[]) {

  if (argv.length <= 2) {
    console.log('Usage ts-node test.js GEN 1:1-2:1')
    exit()
  }

  const bibles = [
    {name: 'RCUV', bible: RCUV},
    {name: 'CUNP', bible: CUNP}
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

