# usfm-bible-parser

### Instantiate the parser
```javascript
var Parser = require('usfm-bible-parser');

var inputDir = '/path/of/the/usfm/files';
var lang = 'zh-hant';
var parser = Parser(inputDir, lang);
```
### Parser Object

- `getBooks()` - returns a list of [`Book`](#book-object) objects.
- `getBook(bookShortName)` - return a book with the short name.

### <a name="book-object"></a>Book Object

Properties:
- index
- id
- name
- localizedName
- localizedAbbreviation
- description
- shortName
- fileName
- filePath
- localizedData

Methods:
- getTexts([fromLineNumber, toLineNumber]) - Returns the text of the book.
- parse(options) - Parse the book with the [Parse Options](#parse-options) object.
- getChapterCount()

### <a name="parse-options"></a>Parse Options
```javascript
{
  onStartLine:function(text, [chapter, [verse]]){}; // optional
  onText:function(text){}; // optional
  onEndLine:function(text){}; // optional
  onStartMarker:function(marker){}; // optional
  onEndMarker:function(marker){}; // optional  
}
```
