import useSWR, { MutatorCallback } from 'swr'
import useSWRSubscription from 'swr/subscription'
import UrlMatch from '@fczbkk/url-match'

import {
  Chapter,
  Message,
  MessageType,
  PageChapter,
  State,
  Summary,
  Translation,
} from './data'
import log from './log'

const TAG = 'api'
export const BASE_URL = 'https://bys.mthli.com'
export const APPLICATION_JSON = 'application/json'

export const parseVid = (pageUrl: string): string => {
  // log(TAG, `parseVid, pageUrl=${pageUrl}`)

  // https://github.com/fczbkk/UrlMatch
  const pageUrlMatch = new UrlMatch([
    'https://*.youtube.com/watch*?v=*',
  ])

  const match = pageUrlMatch.test(pageUrl)
  if (!match) return ''

  const url = new URL(pageUrl)
  const params = new URLSearchParams(url.search)
  const vid = params.get('v') ?? ''
  if (!vid) return ''

  return vid.trim()
}

export const feedback = (pageUrl: string, good: boolean) => {
  const vid = parseVid(pageUrl)
  if (!vid) return

  chrome.runtime.sendMessage({
    type: MessageType.REQUEST,
    requestUrl: `${BASE_URL}/api/feedback/${vid}`,
    requestInit: {
      method: 'POST',
      headers: {
        'Content-Type': APPLICATION_JSON,
      },
      body: JSON.stringify({
        good: Boolean(good),
        bad: !Boolean(good),
      }),
    },
  })
}

export const useSummarize = (
  toggled: number,
  pageUrl: string,
  pageChapters?: PageChapter[],
  noTranscript?: boolean,
) => {
  const vid = parseVid(pageUrl)
  const chapters = pageChapters ?? []
  log(TAG, `useSummarize, vid=${vid}, toggled=${toggled}`)

  // Allow resummarize when `toggled` changed.
  return useSWRSubscription(
    toggled ? ['summarize', toggled, vid, chapters, noTranscript] : null,
    ([_tag, _toggled, vid, chapters, noTranscript], { next }) => {
      const port = summarize(vid, chapters, noTranscript, next)
      return () => {
        log(TAG, `useSummarize, disposed, vid=${vid}`)
        port?.disconnect()
      }
    },
    {
      loadingTimeout: 5 * 60 * 1000, // 5 mins.
      errorRetryCount: 2,
      onError: err => log(TAG, `useSummarize, onError, vid=${vid}, err=${JSON.stringify(err)}`),
    },
  )
}

const summarize = (
  vid: string,
  chapters?: PageChapter[],
  noTranscript?: boolean,
  next?: (error?: Error | null, data?: Summary | MutatorCallback<Summary>) => void,
): chrome.runtime.Port | null => {
  log(TAG, `summarize, vid=${vid}`)

  // Let swr into loading state as soon as possible.
  next?.(null, { state: State.DOING })

  const request: Message = {
    type: MessageType.REQUEST,
    requestUrl: `${BASE_URL}/api/summarize/${vid}`,
    requestInit: {
      method: 'POST',
      headers: {
        'Content-Type': APPLICATION_JSON,
      },
      body: JSON.stringify({
        'chapters': chapters ?? [],
        'no_transcript': Boolean(noTranscript),
      }),
    },
  }

  // https://stackoverflow.com/q/53939205
  let port: chrome.runtime.Port | null = null
  try {
    port = chrome.runtime.connect({ name: `summarize-${vid}` })
  } catch (e) {
    next?.(e as Error)
    return null
  }

  port.onMessage.addListener(msg => onMessage('summarize', msg, next))
  port.postMessage(request)
  return port
}

const onMessage = (
  tag: string,
  message: Message,
  next?: (error?: Error | null, data?: Summary | MutatorCallback<Summary>) => void,
) => {
  log(TAG, `${tag}, onMessage, message=${JSON.stringify(message)}`)

  const {
    type,
    responseOk,
    responseJson,
    // sseEvent,
    sseData,
    error,
  } = message || {}

  switch (type) {
    case MessageType.RESPONSE:
      if (responseOk) {
        next?.(null, responseJson)
      } else {
        next?.(new Error(responseJson))
      }
      break
    case MessageType.SSE:
      // Don't need to check sseEvent here.
      next?.(null, prev => upsert(sseData, prev))
      break
    case MessageType.ERROR:
      next?.(error as Error)
      break
    default:
      next?.(new Error(JSON.stringify(message)))
      break
  }
}

const upsert = (curr: Summary, prev?: Summary): Summary => {
  if (!prev) return curr

  const { chapters: prevChapters = [] } = prev
  const { chapters: currChapters = [], state } = curr

  const chapterMap = new Map<string, Chapter>()
  prevChapters.forEach(c => chapterMap.set(c.cid, c))
  currChapters.forEach(c => chapterMap.set(c.cid, c))

  const chapters = Array.from(chapterMap.values())
  chapters.sort((a, b) => a.start - b.start)

  return {
    state,
    chapters,
  }
}

export const useTranslate = (toggled: boolean, vid: string, cid: string, lang: string) => {
  log(TAG, `useTranslate, vid=${vid}, cid=${cid}, lang=${lang}, toggled=${toggled}`)

  return useSWR(
    toggled ? ['translate', vid, cid, lang] : null,
    ([_tag, vid, cid, lang]) => {
      const request: Message = {
        type: MessageType.REQUEST,
        requestUrl: `${BASE_URL}/api/translate/${vid}`,
        requestInit: {
          method: 'POST',
          headers: {
            'Content-Type': APPLICATION_JSON,
          },
          body: JSON.stringify({ cid, lang }),
        },
      }

      return new Promise<Translation>((resolve, reject) => {
        chrome.runtime.sendMessage(request, (message: Message) => {
          const { type, responseOk, responseJson, error } = message
          switch (type) {
            case MessageType.RESPONSE:
              responseOk ? resolve(responseJson) : reject(new Error(responseJson))
              break
            case MessageType.ERROR:
              reject(error)
              break
            default:
              reject(new Error(JSON.stringify(message)))
              break
          }
        })
      })
    },
    {
      loadingTimeout: 90 * 1000, // 90s.
      errorRetryCount: 2,
      onError: err => log(TAG, `useTranslate, onError, vid=${vid}, cid=${cid}, lang=${lang}, err=${JSON.stringify(err)}`),
    },
  )
}
