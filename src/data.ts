// https://www.deepl.com/docs-api/translate-text
// https://en.wikipedia.org/wiki/Languages_used_on_the_Internet#Internet_users_by_language
export enum TargetLang {
  'EN-US' = 'English', // default.
  'ZH' = '中文',
  'ES' = 'Español',
  'ID' = 'Bahasa Indonesia',
  'PT-BR' = 'Português',
  'FR' = 'Français',
  'JA' = '日本語',
  'RU' = 'Русский язык',
  'DE' = 'Deutsch',
  'KO' = '한국어',
}

export enum Settings {
  UID = 'uid',
  OPENAI_API_KEY = 'openai_api_key',
  TRANSLATION_TARGET_LANG = 'translation_target_lang',
}

export interface PageChapter {
  title: string,
  timestamp: string,
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

export enum ChapterStyle {
  MARKDOWN = 'markdown',
  TEXT = 'text',
}

export interface Chapter {
  cid: string,
  vid: string,
  slicer: string,
  style: ChapterStyle,
  start: number,
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
  chapters?: Chapter[],
}
