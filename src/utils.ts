import UrlMatch from '@fczbkk/url-match'
import copy from 'copy-to-clipboard'

import { Chapter } from './data'

export const copyChapters = (chapters: Chapter[], copyWithTimestamps: boolean = false) => {
  let text = ''

  // FIXME (Matthew Lee) window not defined.
  // https://github.com/vinta/pangu.js
  const pangu = require('pangu')

  for (const c of chapters) {
    let title = `# ${pangu.spacing(c.chapter).trim()}`
    if (copyWithTimestamps) {
      title = `${title} - ${formatSeconds(c.start)}`
    }

    const content = pangu.spacing(c.summary ?? '').trim()
    text += `# ${title}\n\n${content}\n\n`
  }

  text = text.trim()
  if (!text) return
  copy(text)
}

// https://stackoverflow.com/a/8488787
export const countLines = (str?: string | null): number => {
  return str ? str.trim().split(/\r\n|\r|\n/).length : 0
}

export const formatSeconds = (seconds: number): string => {
  const pad = (num: number, size: number): string => ('000' + num).slice(size * -1)

  const h = Math.floor(seconds / 60 / 60)
  const m = Math.floor(seconds / 60) % 60
  const s = Math.floor(seconds % 60)

  let res = pad(m, (h > 0 || m >= 10) ? 2 : 1) + ':' + pad(s, 2)
  if (h > 0) res = pad(h, h >= 10 ? 2 : 1) + ':' + res
  return res
}

export const hexToRgba = (hex: string, alpha: number = 1) => {
  // @ts-ignore
  const [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16))
  return `rgba(${r},${g},${b},${alpha})`
}

export const parseVid = (pageUrl: string): string => {
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
