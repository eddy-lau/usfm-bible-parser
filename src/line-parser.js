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

function parseBookDataFromLine(line) {

  if (!line) {
    return undefined;
  }

  var bookData = require('./bookData.js');

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

function findTagsFromLine(line) {

  let re = /(\\.+?[ |*]|\\.+?$)/g;
  return line.match(re);

}

function parseLine(line, opts) {

  opts = opts || {};
  var onStartLine = opts.onStartLine || function(){};
  var onText = opts.onText || function(){};
  var onStartTag = opts.onStartTag || function(){};
  var onEndTag = opts.onEndTag || function(){};
  var onEndLine = opts.onEndLine || function(){};
  var onStartMarker = opts.onStartMarker || function(){};
  var onEndMarker = opts.onEndMarker || function(){};

  var chapter = parseChapterFromLine(line);
  var verse = parseVerseFromLine(line);
  onStartLine(line, chapter, verse);

  const TEXT = 0;
  const TAG = 1;

  var currentTag = '';
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
        onStartTag(currentTag);
        onStartMarker(currentTag);
        currentTag = '';
        state = TEXT;
      } else if (c == '*') {
        onEndTag(currentTag);
        onEndMarker(currentTag);
        currentTag = '';
        state = TEXT;
      } else {
        currentTag += c;
      }

    } else {

      // should not occur


    }

  }

  if (state === TEXT && currentText.length > 0) {
    onText(currentText);
  } else if (state === TAG && currentTag.length > 0) {
    onStartTag(currentTag);
  }

  onEndLine(line);

}

module.exports = {
  parseBookData: parseBookDataFromLine,
  parseChapter: parseChapterFromLine,
  parseVerse: parseVerseFromLine,
  parseTags: findTagsFromLine,
  parseLine: parseLine
};
