/*jshint esversion: 6, node: true */
'use strict';
function parseChapterFromLine(line) {
    if (line.startsWith('\\c ')) {
        return parseInt(line.substring(3, line.length));
    }
    else {
        return undefined;
    }
}
function parseSubjectFromLine(line) {
    if (line.startsWith('\\s ') || line.startsWith('\\s2 ')) {
        return line.substring(3, line.length);
    }
    else {
        return undefined;
    }
}
function parseChapterGroupFromLine(line) {
    if (line.startsWith('\\ms ')) {
        return line.substring(4, line.length);
    }
    else {
        return undefined;
    }
}
function parseVerseRangeFromLine(line) {
    if (line.startsWith('\\v ')) {
        var nextSpaceIndex = line.indexOf(' ', 3);
        if (nextSpaceIndex < 0) {
            return undefined;
        }
        var verseRange = line.substring(3, nextSpaceIndex).split('-');
        if (verseRange.length === 1) {
            var verse = parseInt(verseRange[0]);
            return { startVerse: verse, endVerse: verse };
        }
        else {
            var startVerse = parseInt(verseRange[0]);
            var endVerse = parseInt(verseRange[1]);
            return { startVerse: startVerse, endVerse: endVerse };
        }
    }
    else {
        return undefined;
    }
}
function parseParagraphTextFromLine(line) {
    if (!line.startsWith('\\p ')) {
        return undefined;
    }
    var text = line.substring(3).trim();
    if (text.length == 0) {
        return undefined;
    }
    return text;
}
function parseBookDataFromLine(line) {
    if (!line) {
        return undefined;
    }
    var bookData = require('bible-book-data')('en');
    var matches = line.match(/\\id .*/);
    if (matches && matches.length > 0) {
        var match = matches[0];
        return bookData.find(function (data) {
            return match.substring(4).startsWith(data.id);
        });
    }
    else {
        return undefined;
    }
}
function findMarkersFromLine(line) {
    var re = /(\\.+?[ |*]|\\.+?$)/g;
    return line.match(re);
}
function parseLine(line, opts) {
    opts = opts || {};
    var onStartLine = opts.onStartLine || function () { };
    var onText = opts.onText || function () { };
    var onEndLine = opts.onEndLine || function () { };
    var onStartMarker = opts.onStartMarker || function () { };
    var onEndMarker = opts.onEndMarker || function () { };
    var chapter = parseChapterFromLine(line);
    var verseRange = parseVerseRangeFromLine(line) || {};
    onStartLine(line, chapter, verseRange.startVerse, verseRange.endVerse);
    var TEXT = 0;
    var TAG = 1;
    var currentMarker = '';
    var currentText = '';
    var state = TEXT;
    for (var i = 0; i < line.length; i++) {
        var c = line[i];
        if (state === TEXT) {
            if (c == '\\') {
                state = TAG;
                if (currentText.length > 0) {
                    onText(currentText);
                }
                currentText = '';
            }
            else {
                currentText += c;
            }
        }
        else if (state === TAG) {
            if (c == ' ') {
                onStartMarker(currentMarker);
                currentMarker = '';
                state = TEXT;
            }
            else if (c == '*') {
                onEndMarker(currentMarker);
                currentMarker = '';
                state = TEXT;
            }
            else {
                currentMarker += c;
            }
        }
        else {
            // should not occur
        }
    }
    if (state === TEXT && currentText.length > 0) {
        onText(currentText);
    }
    else if (state === TAG && currentMarker.length > 0) {
        onStartMarker(currentMarker);
    }
    onEndLine(line);
}
module.exports = {
    parseBookData: parseBookDataFromLine,
    parseChapter: parseChapterFromLine,
    parseChapterGroup: parseChapterGroupFromLine,
    parseSubject: parseSubjectFromLine,
    parseVerseRange: parseVerseRangeFromLine,
    parseMarkers: findMarkersFromLine,
    parseParagraphText: parseParagraphTextFromLine,
    parseLine: parseLine
};
