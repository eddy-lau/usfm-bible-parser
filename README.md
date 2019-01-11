# usfm-bible-parser

### Instantiate the parser
```javascript
var Parser = require('usfm-bible-parser');

var inputDir = '/path/of/the/usfm/files';
var lang = 'zh-hant';
var parser = Parser(inputDir, lang);
```
### Methods

- `getBooks()` - returns a list of [`Book`](#book-object) objects.
- `getBook(bookShortName)` - return a book with the short name.

### <a name="book-object"></a>Book Object

*Properties:*
- index
- id
- name
- localizedName
- localizedAltNames
- localizedAbbreviation
- description
- shortName
- fileName
- filePath
- localizedData

*Methods:*
- getTexts([fromLineNumber, toLineNumber]) - *Deprecated* Returns the text of the book.
- getTexts(options) - Returns the text of the book with [Get Texts Options](#get-texts-options).
- parse(options) - Parse the book with the [Parse Options](#parse-options) object.
- getChapterCount()

### <a name="get-texts-options"></a>Get Texts Options
```javascript
// Case 1: Look up by line number
{
  fromLine:number,
  toLine:number,
}

// Case 2: Look up by chapter and verse
{
  fromChapter:number,
  fromVerse:number,
  toChapter:number,
  toVerse:number  
}
```

### <a name="parse-options"></a>Parse Options
```javascript
{
  fromChapter, // optional
  fromVerse, // optional
  toChapter, // optional
  toVerse, // optional
  onStartBook:function(){}, // optional
  onEndBook:function(){},// optional
  onStartLine:function(text, [chapter, [verse]]){}, // optional
  onText:function(text){}, // optional
  onEndLine:function(text){}, // optional
  onStartMarker:function(marker){}, // optional
  onEndMarker:function(marker){} // optional  
}
```
