/*jshint esversion: 6, node: true */
'use strict';
import BibleBookData from 'bible-book-data';

function parseChapterFromLine(line:string): number | undefined {
  if (line.startsWith('\\c ')) {
    return parseInt(line.substring(3, line.length));
  } else {
    return undefined;
  }

}

function parseSubjectFromLine(line:string): string|undefined {
  if (line.startsWith('\\s ') || line.startsWith('\\s2 ')) {
    return line.substring(3, line.length);
  } else {
    return undefined;
  }
}

function parseChapterGroupFromLine(line:string): string|undefined {
  if (line.startsWith('\\ms ')) {
    return line.substring(4, line.length);
  } else {
    return undefined;
  }
}

type VerseRange = {
  startVerse:number, 
  endVerse:number  
}

function parseVerseRangeFromLine(line:string): VerseRange | undefined {
  if (line.startsWith('\\v ')) {
    let nextSpaceIndex = line.indexOf(' ', 3);
    if (nextSpaceIndex < 0) {
      return undefined;
    }
    var verseRange = line.substring(3, nextSpaceIndex).split('-');
    if (verseRange.length === 1) {
      var verse = parseInt(verseRange[0]);
      return {startVerse:verse, endVerse:verse};
    } else {
      var startVerse = parseInt(verseRange[0]);
      var endVerse = parseInt(verseRange[1]);
      return {startVerse:startVerse, endVerse: endVerse};
    }
  } else {
    return undefined;
  }
}

function parseParagraphTextFromLine(line:string):string|undefined {
  if (!line.startsWith('\\p ')) {
    return undefined;
  }
  let text = line.substring(3).trim();
  if (text.length == 0) {
    return undefined;
  }
  return text;
}

function parseBookDataFromLine(line:string) {

  if (!line) {
    return undefined;
  }

  var bookData = BibleBookData('en');

  var matches = line.match( /\\id .*/ );
  if (matches && matches.length > 0) {

    var match = matches[0];
    return bookData.find( data => {
      return match.substring(4).startsWith( data.id );
    });

  } else {
    return undefined;
  }

}

function findMarkersFromLine(line:string) {

  let re = /(\\.+?[ |*]|\\.+?$)/g;
  return line.match(re);

}

export type ParseLineOptions = {
  onStartLine?: (line:string, chapter:number|undefined, startVerse?:number, endVerse?:number) => {}
  onText?: (line:string) => {}
  onEndLine?: (line:string) => {}
  onStartMarker?: (marker:string) => {}
  onEndMarker?: (marker:string) => {}
}

function parseLine(line:string, opts:ParseLineOptions) {

  opts = opts || {};
  var onStartLine = opts.onStartLine || function(){};
  var onText = opts.onText || function(){};
  var onEndLine = opts.onEndLine || function(){};
  var onStartMarker = opts.onStartMarker || function(){};
  var onEndMarker = opts.onEndMarker || function(){};

  let chapter:number|undefined = parseChapterFromLine(line);
  var verseRange = parseVerseRangeFromLine(line);
  onStartLine(line, chapter, verseRange?.startVerse, verseRange?.endVerse);

  const TEXT = 0;
  const TAG = 1;

  var currentMarker = '';
  var currentText = '';

  var state = TEXT;
  for (var i = 0; i<line.length; i++) {

    let c = line[i];
    if (state === TEXT) {
      if (c == '\\') {
        state = TAG;
        if (currentText.length > 0) {
          onText(currentText);
        }
        currentText = '';
      } else {
        currentText += c;
      }
    } else if (state === TAG) {

      if (c == ' ') {
        onStartMarker(currentMarker);
        currentMarker = '';
        state = TEXT;
      } else if (c == '*') {
        onEndMarker(currentMarker);
        currentMarker = '';
        state = TEXT;
      } else {
        currentMarker += c;
      }

    } else {

      // should not occur


    }

  }

  if (state === TEXT && currentText.length > 0) {
    onText(currentText);
  } else if (state === TAG && currentMarker.length > 0) {
    onStartMarker(currentMarker);
  }

  onEndLine(line);

}

export default {
  parseBookData: parseBookDataFromLine,
  parseChapter: parseChapterFromLine,
  parseChapterGroup: parseChapterGroupFromLine,
  parseSubject: parseSubjectFromLine,
  parseVerseRange: parseVerseRangeFromLine,
  parseMarkers: findMarkersFromLine,
  parseParagraphText: parseParagraphTextFromLine,
  parseLine: parseLine
};