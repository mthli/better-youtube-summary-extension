import UrlMatch from '@fczbkk/url-match'

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
  IFRAME_HEIGHT = 'iframe_height',
}

export interface Message {
  type: MessageType,
  data: number | string | PageChapters,
}

// https://github.com/fczbkk/UrlMatch
export const pageUrlMatch = new UrlMatch([
  'https://*.youtube.com/watch*?v=*',
])
