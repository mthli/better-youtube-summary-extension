import UrlMatch from '@fczbkk/url-match'

import useSWRSubscription from 'swr/subscription'
import { MutatorCallback } from 'swr'

import {
  Chapter,
  Message,
  MessageType,
  PageChapter,
  Summary,
  SummaryState,
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

  return vid
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
    toggled ? [toggled, vid, chapters, noTranscript] : null,
    ([_toggled, vid, chapters, noTranscript], { next }) => {
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
  next?: (error?: Error | null, data?: Summary | MutatorCallback<Summary>) => void,
): chrome.runtime.Port => {
  log(TAG, `summarize, vid=${vid}`)

  // Let swr into loading state as soon as possible.
  next?.(null, { state: SummaryState.DOING })

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

  const port = chrome.runtime.connect({ name: `bys-${vid}` })
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
        next?.(null, prev => upsert(sseData, prev))
        break
      case MessageType.ERROR:
        next?.(error as Error)
        break
      default:
        const msg = `invalid message, message=${JSON.stringify(message)}`
        next?.(new Error(msg))
        break
    }
  })

  port.postMessage(request)
  return port
}

const upsert = (curr: Summary, prev?: Summary): Summary => {
  if (!prev) return curr

  const { chapters: prevChapters = [] } = prev
  const { chapters: currChapters = [], state } = curr

  const map = new Map<string, Chapter>()
  prevChapters.forEach(c => map.set(c.cid, c))
  currChapters.forEach(c => map.set(c.cid, c))

  const chapters = Array.from(map.values())
  chapters.sort((a, b) => a.seconds - b.seconds)

  return {
    state,
    chapters,
  }
}
