import UrlMatch from '@fczbkk/url-match'
import useSWRSubscription from 'swr/subscription'

import log from './log'
import {
  Message,
  MessageType,
  PageChapter,
  PageChapters,
} from './data'

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

  return vid
}

export const useSummarize = (
  toggled: number,
  pageUrl: string,
  pageChapters?: PageChapters,
  noTranscript?: boolean,
) => {
  const vid = parseVid(pageUrl)
  const chapters = pageUrl === pageChapters?.pageUrl ? pageChapters.chapters : []
  log(TAG, `useSummarize, vid=${vid}, toggled=${toggled}`)

  return useSWRSubscription(
    toggled ? [vid, chapters, noTranscript] : null,
    ([vid, chapters, noTranscript], { next }) => {
      /* const port = */ summarize(vid, chapters, noTranscript, next)
      return () => {
        log(TAG, `useSummarize disposed, vid=${vid}`)
        // DO NOTHING, port should be disconneted by server worker.
      }
    },
    {
      loadingTimeout: 5 * 60 * 1000, // 5 mins.
      errorRetryCount: 2,
      onError(err, key) {
        log(TAG, `useSummarize onError, key=${key}, err=${JSON.stringify(err)}`)
      },
    },
  )
}

const summarize = (
  vid: string,
  chapters?: PageChapter[],
  noTranscript?: boolean,
  next?: (error?: Error | null, message?: Message) => void,
): chrome.runtime.Port => {
  log(TAG, `summarize, vid=${vid}`)

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

  const port = chrome.runtime.connect({ name: vid })
  port.onDisconnect.addListener(({ name }) => {
    log(TAG, `summarize onDisconnect, name=${name}`)
    // DO NOTHING.
  })

  port.onMessage.addListener(message => {
    log(TAG, `summarize onMessage, message=${JSON.stringify(message)}`)

    const {
      type,
      // responseOk,
      responseJson,
      // sseEvent,
      sseData,
      error,
    } = message || {}

    switch (type) {
      case MessageType.RESPONSE:
        // Don't need to check responseOk here,
        // always `true` from server worker.
        next?.(null, responseJson)
        break
      case MessageType.SSE:
        // Don't need to check sseEvent here,
        // always `SseEvent.SUMMARY` from server worker.
        // TODO (Matthew Lee) upsert.
        next?.(null, sseData)
        break
      case MessageType.ERROR:
        next?.(error as Error)
        break
      default:
        next?.(new Error(`invalid message, message=${JSON.stringify(message)}`))
        break
    }
  })

  port.postMessage(request)
  return port
}
