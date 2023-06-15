export interface PageChapter {
  title: string,
  timestamp: string,
}

export interface PageChapters {
  pageUrl: string,
  chapters: PageChapter[],
}

export enum MessageType {
  PAGE_URL = 'page_url',
  PAGE_CHAPTERS = 'page_chapters',
  NO_TRANSCRIPT = 'no_transcript',
  IFRAME_HEIGHT = 'iframe_height',
}

export interface Message {
  type: MessageType,
  data: boolean | number | string | PageChapters,
}

export interface Chapter {
  cid: string,
  vid: string,
  seconds: number,
  slicer: string,
  lang: string,
  chapter: string,
  summary?: string,
}

export enum SummaryState {
  NOTHING = 'nothing',
  DOING = 'doing',
  DONE = 'done',
}

export interface Summary {
  chapters: Chapter[],
  state: SummaryState,
}
