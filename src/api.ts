import UrlMatch from '@fczbkk/url-match'

import { Chapter } from './message'

const BASE_URL = 'https://bys.mthli.com'

export const parseVid = (pageUrl: string): string => {
    // https://github.com/fczbkk/UrlMatch
    const pageUrlMatch = new UrlMatch([
        'https://*.youtube.com/watch*?v=*',
    ])

    const match = pageUrlMatch.test(pageUrl)
    if (!match) return ''

    const params = new URLSearchParams(location.search)
    const vid = params.get('v') ?? ''
    if (!vid) return ''

    return vid
}

export const summarize = async (vid: string, chapters?: Chapter[]): Promise<Response> => {
    const res = await fetch(`${BASE_URL}/api/summarize/${vid}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chapters: chapters ?? [],
        }),
    })

    if (!res.ok) {
        const msg = await res.json()
        throw new Error(msg)
    }

    return res
}
