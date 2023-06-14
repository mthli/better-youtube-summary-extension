import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

import UrlMatch from '@fczbkk/url-match'

import log from './log'
import {
  Chapter,
  PageChapters,
  MessageType,
  Message,
} from './message'

const TAG = 'contentScript'

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

const sendPageUrl = (pageUrl: string) => {
  const message: Message = {
    type: MessageType.PAGE_URL,
    data: pageUrl,
  }

  chrome.runtime.sendMessage(message)
}

const sendPageChapters = (pageChapters?: PageChapters) => {
  if (!pageChapters) return

  const message: Message = {
    type: MessageType.PAGE_CHAPTERS,
    data: pageChapters,
  }

  chrome.runtime.sendMessage(message)
}

const App = () => {
  const [pageUrl, setPageUrl] = useState(location.href)
  const [pageChapters, setPageChapters] = useState<PageChapters>()
  const [panelObserver, setPanelObserver] = useState<MutationObserver>()
  const [noTranscript, setNoTranscript] = useState(false)

  useEffect(() => {
    const subtitles = document.querySelector('svg.ytp-subtitles-button-icon')
    const opacity = subtitles?.attributes?.getNamedItem('fill-opacity')?.value ?? '1.0'
    setNoTranscript(parseFloat(opacity) < 1.0)

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
    panelObserver?.disconnect()
    const blockId = 'better-youtube-summary-block'

    const match = videoUrlMatch.test(pageUrl)
    if (!match) return

    const params = new URLSearchParams(location.search)
    const vid = params.get('v') ?? ''
    if (!vid) return

    if (document.querySelector(`#${blockId}`)) {
      log(TAG, 'useEffect, send when pageUrl changed')
      sendPageUrl(pageUrl)
      sendPageChapters(pageChapters)
      return
    }

    const insertBlock = (parent: Node | null) => {
      if (!parent) return

      const iframe = document.createElement('iframe')
      iframe.src = chrome.runtime.getURL('index.html')
      iframe.style.width = '100%'
      iframe.style.border = 'none'
      iframe.onload = () => {
        log(TAG, 'useEffect, send when iframe onload')
        sendPageUrl(pageUrl)
        setPageChapters(pageChapters)
      }

      const block = document.createElement('div')
      block.id = blockId
      block.className = 'style-scope ytd-watch-flexy'
      block.style.marginBottom = '8px'
      block.appendChild(iframe)

      const ref = parent.childNodes.length > 0 ? parent.childNodes[0] : null
      parent.insertBefore(block, ref)
    }

    const panels = document.querySelector('#secondary-inner')
    if (panels) {
      log(TAG, 'useEffect, insert block with selector')
      insertBlock(panels)
      return
    }

    const observer = new MutationObserver(mutationList => {
      for (const mutation of mutationList) {
        let found = false

        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLDivElement) {
            if (node.id === 'panels') {
              log(TAG, 'useEffect, insert block with observer')
              insertBlock(node.parentNode)
              found = true
              break
            }
          }
        }

        if (found) {
          observer.disconnect()
          break
        }
      }
    })

    setPanelObserver(observer)
    observer.observe(document, { subtree: true, childList: true })
  }, [pageUrl])

  useEffect(() => {
    log(TAG, 'useEffect, send when pageChapters changed')
    sendPageUrl(pageUrl)
    sendPageChapters(pageChapters)
  }, [pageChapters])

  return (
    <div />
  )
}

const root = document.createElement('div')
root.id = 'better-youtube-summary-root'
document.body.appendChild(root)
createRoot(root).render(<App />)
