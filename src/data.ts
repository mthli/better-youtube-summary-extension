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
  SSE = 'sse',
  ERROR = 'error',
}

export interface Message {
  type: MessageType,
  requestUrl?: string,
  requestInit?: RequestInit,
  responseOk?: boolean,
  responseJson?: any,
  sseEvent?: string,
  sseData?: any,
  error?: Error,
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

export enum SseEvent {
  SUMMARY = 'summary',
  CLOSE = 'close',
}

export enum SummaryState {
  NOTHING = 'nothing',
  DOING = 'doing',
  DONE = 'done',
}

export interface Summary {
  state: SummaryState,
  chapters: Chapter[],
}
