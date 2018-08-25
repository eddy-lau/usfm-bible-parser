/*jshint esversion: 6 */

/*

Book IDs defined in
https://ubsicap.github.io/usfm/identification/books.html

*/

const BOOK_DATA = [

  // "Number", "Identifier", "English Name", "Alternative name / Notes"
  "01", "GEN", "Genesis", "'1 Moses' in some Bibles",
	"02", "EXO", "Exodus", "'2 Moses' in some Bibles",
	"03", "LEV", "Leviticus", "'3 Moses' in some Bibles",
	"04", "NUM", "Numbers", "'4 Moses' in some Bibles",
	"05", "DEU", "Deuteronomy", "'5 Moses' in some Bibles",
	"06", "JOS", "Joshua", " ",
	"07", "JDG", "Judges", " ",
	"08", "RUT", "Ruth", " ",
	"09", "1SA", "1 Samuel", "1 Kings or Kingdoms in Orthodox Bibles; do not confuse this abbreviation with ISA for Isaiah",
	"10", "2SA", "2 Samuel", "2 Kings or Kingdoms in Orthodox Bibles",
	"11", "1KI", "1 Kings", "3 Kings or Kingdoms in Orthodox Bibles",
	"12", "2KI", "2 Kings", "4 Kings or Kingdoms in Orthodox Bibles",
	"13", "1CH", "1 Chronicles", "1 Paralipomenon in Orthodox Bibles",
	"14", "2CH", "2 Chronicles", "2 Paralipomenon in Orthodox Bibles",
	"15", "EZR", "Ezra", "This is for Hebrew Ezra, sometimes called 1 Ezra or 1 Esdras; also for Ezra-Nehemiah when one book",
	"16", "NEH", "Nehemiah", "Sometimes appended to Ezra; called 2 Esdras in the Vulgate",
	"17", "EST", "Esther (Hebrew)", "This is for Hebrew Esther; for the longer Greek LXX Esther use ESG",
	"18", "JOB", "Job", "",
	"19", "PSA", "Psalms", "150 Psalms in Hebrew, 151 Psalms in Orthodox Bibles, 155 Psalms in West Syriac Bibles, if you put Psalm 151 separately in an Apocrypha use PS2, for Psalms 152-155 use PS3",
	"20", "PRO", "Proverbs", "31 Proverbs, but 24 Proverbs in the Ethiopian Bible",
	"21", "ECC", "Ecclesiastes", "Qoholeth in Catholic Bibles; for Ecclesiasticus use SIR",
	"22", "SNG", "Song of Songs", "Song of Solomon, or Canticles of Canticles in Catholic Bibles",
	"23", "ISA", "Isaiah", "Do not confuse this abbreviation with 1SA for 1 Samuel",
	"24", "JER", "Jeremiah", "The Book of Jeremiah; for the Letter of Jeremiah use LJE",
	"25", "LAM", "Lamentations", "The Lamentations of Jeremiah",
	"26", "EZK", "Ezekiel", "",
	"27", "DAN", "Daniel (Hebrew)", "This is for Hebrew Daniel; for the longer Greek LXX Daniel use DAG",
	"28", "HOS", "Hosea", "",
	"29", "JOL", "Joel", "",
	"30", "AMO", "Amos", "",
	"31", "OBA", "Obadiah", "",
	"32", "JON", "Jonah", "Do not confuse this abbreviation with JHN for John",
	"33", "MIC", "Micah", "",
	"34", "NAM", "Nahum", "",
	"35", "HAB", "Habakkuk", "",
	"36", "ZEP", "Zephaniah", "",
	"37", "HAG", "Haggai", "",
	"38", "ZEC", "Zechariah", "",
	"39", "MAL", "Malachi", "",
	"41", "MAT", "Matthew", "The Gospel according to Matthew",
	"42", "MRK", "Mark", "The Gospel according to Mark",
	"43", "LUK", "Luke", "The Gospel according to Luke",
	"44", "JHN", "John", "The Gospel according to John",
	"45", "ACT", "Acts", "The Acts of the Apostles",
	"46", "ROM", "Romans", "The Letter of Paul to the Romans",
	"47", "1CO", "1 Corinthians", "The First Letter of Paul to the Corinthians",
	"48", "2CO", "2 Corinthians", "The Second Letter of Paul to the Corinthians",
	"49", "GAL", "Galatians", "The Letter of Paul to the Galatians",
	"50", "EPH", "Ephesians", "The Letter of Paul to the Ephesians",
	"51", "PHP", "Philippians", "The Letter of Paul to the Philippians",
	"52", "COL", "Colossians", "The Letter of Paul to the Colossians",
	"53", "1TH", "1 Thessalonians", "The First Letter of Paul to the Thessalonians",
	"54", "2TH", "2 Thessalonians", "The Second Letter of Paul to the Thessalonians",
	"55", "1TI", "1 Timothy", "The First Letter of Paul to Timothy",
	"56", "2TI", "2 Timothy", "The Second Letter of Paul to Timothy",
	"57", "TIT", "Titus", "The Letter of Paul to Titus",
	"58", "PHM", "Philemon", "The Letter of Paul to Philemon",
	"59", "HEB", "Hebrews", "The Letter to the Hebrews",
	"60", "JAS", "James", "The Letter of James",
	"61", "1PE", "1 Peter", "The First Letter of Peter",
	"62", "2PE", "2 Peter", "The Second Letter of Peter",
	"63", "1JN", "1 John", "The First Letter of John",
	"64", "2JN", "2 John", "The Second Letter of John",
	"65", "3JN", "3 John", "The Third Letter of John",
	"66", "JUD", "Jude", "The Letter of Jude; do not confuse this abbreviation with JDG for Judges, or JDT for Judith",
	"67", "REV", "Revelation", "The Revelation to John; called Apocalypse in Catholic Bibles",
	"68", "TOB", "Tobit", "",
	"69", "JDT", "Judith", "",
	"70", "ESG", "Esther Greek", "",
	"71", "WIS", "Wisdom of Solomon", "",
	"72", "SIR", "Sirach", "Ecclesiasticus or Jesus son of Sirach",
	"73", "BAR", "Baruch", "5 chapters in Orthodox Bibles (LJE is separate); 6 chapters in Catholic Bibles (includes LJE); called 1 Baruch in Syriac Bibles",
	"74", "LJE", "Letter of Jeremiah", "Sometimes included in Baruch; called 'Rest of Jeremiah' in Ethiopia",
	"75", "S3Y", "Song of the 3 Young Men", "Includes the Prayer of Azariah; sometimes included in Greek Daniel",
	"76", "SUS", "Susanna", "Sometimes included in Greek Daniel",
	"77", "BEL", "Bel and the Dragon", "Sometimes included in Greek Daniel; called 'Rest of Daniel' in Ethiopia",
	"78", "1MA", "1 Maccabees", "Called '3 Maccabees' in some traditions, printed in Catholic and Orthodox Bibles",
	"79", "2MA", "2 Maccabees", "Called '1 Maccabees' in some traditions, printed in Catholic and Orthodox Bibles",
	"80", "3MA", "3 Maccabees", "Called '2 Maccabees' in some traditions, printed in Orthodox Bibles",
	"81", "4MA", "4 Maccabees", "In an appendix to the Greek Bible and in the Georgian Bible",
	"82", "1ES", "1 Esdras (Greek)", "The 9 chapter book of Greek Ezra in the LXX, called '2 Esdras' in Russian Bibles, and called '3 Esdras' in the Vulgate; when Ezra-Nehemiah is one book use EZR",
	"83", "2ES", "2 Esdras (Latin)", "The 16 chapter book of Latin Esdras called '3 Esdras' in Russian Bibles and called '4 Esdras' in the Vulgate; for the 12 chapter Apocalypse of Ezra use EZA",
	"84", "MAN", "Prayer of Manasseh", "Sometimes appended to 2 Chronicles, included in Orthodox Bibles",
	"85", "PS2", "Psalm 151", "An additional Psalm in the Septuagint, appended to Psalms in Orthodox Bibles",
	"86", "ODA", "Odae/Odes", "A book in some editions of the Septuagint; Odes has different contents in Greek, Russian, and Syriac traditions",
	"87", "PSS", "Psalms of Solomon", "A book in some editions of the Septuagint, but not printed in modern Bibles",
	"A4", "EZA", "Ezra Apocalypse", "12 chapter book of Ezra Apocalypse; called '3 Ezra' in the Armenian Bible, called 'Ezra Shealtiel' in the Ethiopian Bible; formerly called 4ES; called '2 Esdras' when it includes 5 Ezra and 6 Ezra",
	"A5", "5EZ", "5 Ezra", "2 chapter Latin preface to Ezra Apocalypse; formerly called 5ES",
	"A6", "6EZ", "6 Ezra", "2 chapter Latin conclusion to Ezra Apocalypse; formerly called 6ES",
	"B2", "DAG", "Daniel Greek", "The 14 chapter version of Daniel from the Septuagint including Greek additions",
	"B3", "PS3", "Psalms 152-155", "Additional Psalms 152-155 found in West Syriac manuscripts",
	"B4", "2BA", "2 Baruch (Apocalypse)", "The Apocalypse of Baruch in Syriac Bibles",
	"B5", "LBA", "Letter of Baruch", "Sometimes appended to 2 Baruch; sometimes separate in Syriac Bibles",
	"B6", "JUB", "Jubilees", "Ancient Hebrew book used in the Ethiopian Bible",
	"B7", "ENO", "Enoch", "Sometimes called '1 Enoch'; ancient Hebrew book in the Ethiopian Bible",
	"B8", "1MQ", "1 Meqabyan/Mekabis", "Book of Mekabis of Benjamin in the Ethiopian Bible",
	"B9", "2MQ", "2 Meqabyan/Mekabis", "Book of Mekabis of Moab in the Ethiopian Bible",
	"C0", "3MQ", "3 Meqabyan/Mekabis", "Book of Meqabyan in the Ethiopian Bible",
	"C1", "REP", "Reproof", "Proverbs part 2: Used in the Ethiopian Bible",
	"C2", "4BA", "4 Baruch", "Paralipomenon of Jeremiah, called 'Rest of the Words of Baruch' in Ethiopia; may include or exclude the Letter of Jeremiah as chapter 1, used in the Ethiopian Bible",
	"C3", "LAO", "Letter to the Laodiceans", "A Latin Vulgate book, found in the Vulgate and some medieval Catholic translations",
	"A0", "FRT", "Front Matter", "",
	"A1", "BAK", "Back Matter", "",
	"A2", "OTH", "Other Matter", "",
	"A7", "INT", "Introduction Matter", "",
	"A8", "CNC", "Concordance", "",
	"A9", "GLO", "Glossary / Wordlist", "",
	"B0", "TDX", "Topical Index", "",
	"B1", "NDX", "Names Index", ""

];

var bookData = (function() {

  var result = [];
  for (var i = 0; i<BOOK_DATA.length; i+=4) {
    result.push({
      index: BOOK_DATA[i],
      id: BOOK_DATA[i+1],
      name: BOOK_DATA[i+2],
      description: BOOK_DATA[i+3]
    });
  }
  return result;

})();

module.exports = bookData;
