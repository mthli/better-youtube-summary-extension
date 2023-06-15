export interface PageChapter {
  title: string,
  timestamp: string,
}

export interface PageChapters {
  pageUrl: string,
  chapters: PageChapter[],
}

export enum MessageType {
  PAGE_URL = 'page_url',           // string; to iframe.
  PAGE_CHAPTERS = 'page_chapters', // PageChapters; to iframe.
  NO_TRANSCRIPT = 'no_transcript', // boolean; to iframe.
  IFRAME_HEIGHT = 'iframe_height', // number; from iframe.
  PLAY_SECONDS = 'play_seconds',   // number; from iframe.
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
