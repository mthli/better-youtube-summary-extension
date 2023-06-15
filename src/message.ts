export interface Chapter {
  title: string,
  timestamp: string,
}

export interface PageChapters {
  pageUrl: string,
  chapters: Chapter[],
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
