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

  // REV 1:1-4a
  if (book.id == 'REV' && fromChapter == 1 && fromVerse == 1 && toVerse == 4 && firstHalfOfLastVerse) {

      lines = replaceText(lines,
        '\\v 4 \\pn 約翰\\pn*寫信給\\pn 亞細亞\\pn*的七個教會。但願從那昔在、今在、以後永在的\\add 上帝\\add*，和他寶座前的七靈，',
        '\\v 4 \\pn 約翰\\pn*寫信給\\pn 亞細亞\\pn*的七個教會。',
      )

      lines = replaceText(lines,
        '\\v 4-5 \\pn 約翰\\pn*寫信給\\pn 亞細亞\\pn*的七個教會。願那位今在、昔在、以後永在的上帝，與他寶座前的七靈，和那忠信的見證者、從死人中復活的首生者\\f + 「首生者」或譯「長子」。\\f*、世上君王的元首耶穌基督，賜恩惠和平安\\f + 「平安」或譯「和平」。\\f*給你們。',
        '\\v 4 \\pn 約翰\\pn*寫信給\\pn 亞細亞\\pn*的七個教會。',
      )

  }

  // REV 1:4b-8
  if (book.id == 'REV' && fromChapter == 1 && fromVerse == 4 && toVerse == 8 && secondHalfOfFirstVerse) {

    lines = replaceText(lines,
      '\\v 4 \\pn 約翰\\pn*寫信給\\pn 亞細亞\\pn*的七個教會。但願從那昔在、今在、以後永在的\\add 上帝\\add*，和他寶座前的七靈，',
      '\\p 但願從那昔在、今在、以後永在的\\add 上帝\\add*，和他寶座前的七靈，',
    )

    if (lines[0] === '\\p 他愛我們，用自己的血使我們從罪中得釋放 \\f + 「得釋放」：有古卷是「洗去」。\\f*，') {
      lines = ['\\v 4-5 願那位今在、昔在、以後永在的上帝，與他寶座前的七靈，和那忠信的見證者、從死人中復活的首生者\\f + 「首生者」或譯「長子」。\\f*、世上君王的元首耶穌基督，賜恩惠和平安\\f + 「平安」或譯「和平」。\\f*給你們。', ...lines];
    }

}


  return lines;
}