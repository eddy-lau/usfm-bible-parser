import { BookData } from "bible-book-data"
import { ParseLineOptions } from "./line-parser"

export interface LoadTextOptions extends ParseLineOptions {
  fromLine?: number
  toLine?: number
  fromChapter?: number
  toChapter?: number
  fromVerse?: number
  toVerse?: number
  secondHalfOfFirstVerse?: boolean
  firstHalfOfLastVerse?: boolean
  onStartBook?: () => {}
  onEndBook?: () => {}
};

export type Scriptures = {
  scriptures?: LoadTextOptions[]
}

export interface Book {
  index: string,
  id: string,
  name: string,
  localizedName: string,
  localizedAbbreviation: string,
  localizedAltNames: string[],
  description: string,
  shortName: string,
  fileName: string,
  filePath: string,
  localizedData: BookData,
  getTexts(arg1?: LoadTextOptions | Scriptures | number, arg2?: number): Promise<string[]>,
  parse(opts: LoadTextOptions): Promise<void>,
  getChapterCount(): Promise<number>
}

