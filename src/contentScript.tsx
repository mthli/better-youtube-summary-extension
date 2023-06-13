import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

import UrlMatch from '@fczbkk/url-match'

interface Chapter {
  title: string,
  timestamp: string,
}

interface PageChapters {
  pageUrl: string,
  chapters: Chapter[],
}

// https://stackoverflow.com/a/75704708
const parseChapters = (): Chapter[] => {
  const elements = Array.from(
    document.querySelectorAll(
      '#panels ytd-engagement-panel-section-list-renderer:nth-child(2) #content ytd-macro-markers-list-renderer #contents ytd-macro-markers-list-item-renderer #endpoint #details'
    )
  )

  const chapters = elements.map(node => ({
    title: node.querySelector('.macro-markers')?.textContent,
    timestamp: node.querySelector('#time')?.textContent,
  }))

  const filtered = chapters.filter(c =>
    c.title !== undefined &&
    c.title !== null &&
    c.timestamp !== undefined &&
    c.timestamp !== null
  )

  return [
    ...new Map(filtered.map(c => [c.timestamp, c])).values(),
  ] as Chapter[]
}

// https://github.com/fczbkk/UrlMatch
const videoUrlMatch = new UrlMatch([
  'https://*.youtube.com/watch*?v=*',
])

const App = () => {
  const [pageUrl, setPageUrl] = useState(location.href)
  const [pageChapters, setPageChapters] = useState<PageChapters>()

  useEffect(() => {
    const observer = new MutationObserver(mutationList => {
      setPageUrl(location.href)

      for (const mutation of mutationList) {
        let found = false

        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLDivElement) {
            if (node.className.includes('ytp-chapter-hover-container')) {
              setPageChapters({
                pageUrl: location.href,
                chapters: parseChapters(),
              })
              found = true
              break
            }
          }
        }

        if (found) break
      }
    })

    observer.observe(document, { subtree: true, childList: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const match = videoUrlMatch.test(pageUrl)
    console.log(`useEffect, pageUrl=${pageUrl}, match=${match}`)
    if (!match) return

    const params = new URLSearchParams(location.search)
    const vid = params.get('v') ?? ''
    if (!vid) return

    // TODO
  }, [pageUrl])

  useEffect(() => {
    if (pageChapters == undefined) return
    console.log(`useEffect, pageChapters=${JSON.stringify(pageChapters)}`)
    // TODO
  }, [pageChapters])

  return (
    <div />
  )
}

const root = document.createElement('div')
document.body.appendChild(root)
createRoot(root).render(<App />)
