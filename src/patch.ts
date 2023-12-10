import { Book, LoadTextOptions } from './Book'

function replaceText(lines: string[], fromText: string, toText: string) {
  return lines.map(line => {
    if (line == fromText) {
      return toText;
    } else {
      return line;
    }
  });
}

export function patch(book: Book, options: LoadTextOptions, lines: string[]) {

  const { fromChapter, fromVerse, toChapter, toVerse, firstHalfOfLastVerse, secondHalfOfFirstVerse } = options;

  // 1SA 2:11a
  if (book.id == '1SA' && toChapter == 2 && toVerse == 11 && firstHalfOfLastVerse) {

    lines = replaceText(lines,
      '\\v 11 \\pn 以利加拿\\pn*往\\pn 拉瑪\\pn*回自己的家去了。那孩子在\\pn 以利\\pn*祭司面前事奉耶和華。',
      '\\v 11 \\pn 以利加拿\\pn*往\\pn 拉瑪\\pn*回自己的家去了。'
    );

    lines = replaceText(lines,
      '\\v 11 \\pn 以利加拿\\pn*往\\pn 拉瑪\\pn*回家去了。那孩子在祭司\\pn 以利\\pn*面前事奉耶和華。',
      '\\v 11 \\pn 以利加拿\\pn*往\\pn 拉瑪\\pn*回家去了。'
    );

  }

  // PSA 73:1-14
  if (book.id == 'PSA' && fromChapter == 73 && fromVerse == 1) {

    if (!lines.find(line => line == '\\d 亞薩的詩。')) {
      lines = ['\\d 亞薩的詩。', ...lines];
    }

  }

  // 2KI 5:1-19a
  if (book.id == '2KI' && toChapter == 5 && toVerse == 19 && firstHalfOfLastVerse) {

    lines = replaceText(lines,
      '\\p \\pn 乃縵\\pn*就離開他去了；走了不遠，',
      '\\p',
    );

    lines = replaceText(lines,
      '\\p \\pn 乃縵\\pn*離開他去了。走了一小段路，',
      '\\p',
    );
  }

  // LEV 19:1-19a
  if (book.id == 'LEV' && toChapter == 19 && toVerse == 19 && firstHalfOfLastVerse) {

    lines = replaceText(lines,
      '\\v 19 「你們要守我的律例。不可叫你的牲畜與異類配合；不可用兩樣攙雜的種種你的地，也不可用兩樣攙雜的料做衣服穿在身上。',
      '\\v 19 「你們要守我的律例。'
    );

    lines = replaceText(lines,
      '\\v 19 「你們要遵守我的律例。不可使你的牲畜與異類交配；不可在你的田地播下兩樣的種子；也不可穿兩種原料做成的衣服。',
      '\\v 19 「你們要遵守我的律例。'
    );

  }

  // LEV 19:19b-37
  if (book.id == 'LEV' && fromChapter == 19 && fromVerse == 19 && secondHalfOfFirstVerse) {

    lines = replaceText(lines,
      '\\v 19 「你們要守我的律例。不可叫你的牲畜與異類配合；不可用兩樣攙雜的種種你的地，也不可用兩樣攙雜的料做衣服穿在身上。',
      '\\p 不可叫你的牲畜與異類配合；不可用兩樣攙雜的種種你的地，也不可用兩樣攙雜的料做衣服穿在身上。',
    );

    lines = replaceText(lines,
      '\\v 19 「你們要遵守我的律例。不可使你的牲畜與異類交配；不可在你的田地播下兩樣的種子；也不可穿兩種原料做成的衣服。',
      '\\p 不可使你的牲畜與異類交配；不可在你的田地播下兩樣的種子；也不可穿兩種原料做成的衣服。'
    );

  }


  // PSA 90:1-17
  if (book.id == 'PSA' && fromChapter == 90 && fromVerse == 1) {

    if (!lines.find(line => line == '\\d 神人摩西的祈禱。')) {
      lines = ['\\d 神人摩西的祈禱。', ...lines];
    }

  }

  return lines;
}