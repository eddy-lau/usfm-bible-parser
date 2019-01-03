/*jshint esversion: 6 */

function parseChapterFromLine(line) {
  if (line.startsWith('\\c ')) {
    return parseInt(line.substring(3, line.length));
  } else {
    return undefined;
  }

}

function parseVerseFromLine(line) {
  if (line.startsWith('\\v ')) {
    let nextSpaceIndex = line.indexOf(' ', 3);
    if (nextSpaceIndex < 0) {
      return undefined;
    }
    return parseInt(line.substring(3, nextSpaceIndex));
  } else {
    return undefined;
  }
}

function parseVerseRangeFromLine(line) {
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

function parseBookDataFromLine(line) {

  if (!line) {
    return undefined;
  }

  var bookData = require('bible-book-data')('en');

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

function findMarkersFromLine(line) {

  let re = /(\\.+?[ |*]|\\.+?$)/g;
  return line.match(re);

}

function parseLine(line, opts) {

  opts = opts || {};
  var onStartLine = opts.onStartLine || function(){};
  var onText = opts.onText || function(){};
  var onEndLine = opts.onEndLine || function(){};
  var onStartMarker = opts.onStartMarker || function(){};
  var onEndMarker = opts.onEndMarker || function(){};

  var chapter = parseChapterFromLine(line);
  var verse = parseVerseFromLine(line);
  onStartLine(line, chapter, verse);

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

module.exports = {
  parseBookData: parseBookDataFromLine,
  parseChapter: parseChapterFromLine,
  parseVerse: parseVerseFromLine,
  parseVerseRange: parseVerseRangeFromLine,
  parseMarkers: findMarkersFromLine,
  parseLine: parseLine
};
