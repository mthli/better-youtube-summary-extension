import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

import UrlMatch from '@fczbkk/url-match'

// https://github.com/fczbkk/UrlMatch
const videoUrlMatch = new UrlMatch([
  'https://*.youtube.com/watch*?v=*',
])

// https://stackoverflow.com/a/75704708
const parseChapters = () => {
  const elements = Array.from(
    document.querySelectorAll(
      '#panels ytd-engagement-panel-section-list-renderer:nth-child(2) #content ytd-macro-markers-list-renderer #contents ytd-macro-markers-list-item-renderer #endpoint #details'
    )
  )

  const chapters = elements.map(node => ({
    title: node.querySelector('.macro-markers')?.textContent,
    timestamp: node.querySelector('#time')?.textContent,
  }))

  const filtered = chapters.filter(
    (element) =>
      element.title !== undefined &&
      element.title !== null &&
      element.timestamp !== undefined &&
      element.timestamp !== null
  );

  return [
    ...new Map(filtered.map((node) => [node.timestamp, node])).values(),
  ]
}

const App = () => {
  const [pageUrl, setPageUrl] = useState(location.href)

  useEffect(() => {
    const observer = new MutationObserver(() => setPageUrl(location.href))
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

  return (
    <div />
  )
}

const root = document.createElement('div')
document.body.appendChild(root)
createRoot(root).render(<App />)
