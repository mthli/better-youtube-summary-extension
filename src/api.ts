import UrlMatch from '@fczbkk/url-match'
import useSWR from 'swr'

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
  // log(TAG, `useSummarize, vid=${vid}, toggled=${toggled}`)

  return useSWR(toggled ? [vid, chapters, noTranscript] : null,
    ([vid, chapters, noTranscript]) => summarize(vid, chapters, noTranscript),
    {
      loadingTimeout: 10000, // ms.
      errorRetryCount: 2,
      onError(err, key) {
        log(TAG, `onError, key=${key}, err=${JSON.stringify(err)}`)
      },
    },
  )
}

const summarize = async (
  vid: string,
  chapters?: PageChapter[],
  noTranscript?: boolean,
): Promise<any> => {
  // log(TAG, `summarize, vid=${vid}, chapters=${JSON.stringify(chapters)}`)

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

  const response = await new Promise<Message>((resolve, reject) => {
    chrome.runtime.sendMessage<Message, Message>(request, res => {
      const { type, error } = res || {}
      switch (type) {
        case MessageType.RESPONSE:
          resolve(res)
          break
        case MessageType.ERROR:
          reject(error as Error)
          break
        default:
          reject(new Error(`invalid message, res=${JSON.stringify(res)}`))
          break
      }
    })
  })

  const { responseOk, responseJson } = response
  if (!responseOk) throw new Error(responseJson)
  return responseJson
}
