const {
    parseChapter
} = require('../src/line-parser');

test('given "\\c 12" returns 12', () => {
    expect(parseChapter("\\c 12")).toBe(12);
});

test('given something not starting with a chapter marker i.e. "\\c " return undefined', () => {
    expect(parseChapter("hello")).toBe(undefined);
});

test('given something starting with a chapter marker i.e. "\\c " followed with a string return NaN', () => {
    expect(parseChapter("\\c hello")).toBe(NaN);
});