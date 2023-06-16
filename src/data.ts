export interface PageChapter {
  title: string,
  timestamp: string,
}

export interface PageChapters {
  pageUrl: string,
  chapters: PageChapter[],
}

export enum MessageType {
  REQUEST = 'request',
  RESPONSE = 'response',
  ERROR = 'error',
}

export interface Message {
  type: MessageType,
  data: RequestInfo | Response | Error,
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
