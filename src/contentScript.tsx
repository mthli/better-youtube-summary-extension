import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

import log from './log'
import { parseVid } from './api'
import { Chapter, PageChapters, MessageType, Message } from './message'

const TAG = 'contentScript'
const BLOCK_ID = 'better-youtube-summary-block'
const IFRAME_ID = 'better-youtube-summary-iframe'
const IFRAME_SRC = chrome.runtime.getURL('index.html')
const DEFAULT_PLAYER_HEIGHT = 560 // px

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

const sendPageUrl = (pageUrl: string) => {
  const iframe = document.getElementById(IFRAME_ID)
  if (!(iframe instanceof HTMLIFrameElement)) return

  const message: Message = {
    type: MessageType.PAGE_URL,
    data: pageUrl,
  }

  iframe.contentWindow?.postMessage(message, IFRAME_SRC)
}

const sendPageChapters = (pageChapters?: PageChapters) => {
  if (!pageChapters) return

  const iframe = document.getElementById(IFRAME_ID)
  if (!(iframe instanceof HTMLIFrameElement)) return

  const message: Message = {
    type: MessageType.PAGE_CHAPTERS,
    data: pageChapters,
  }

  iframe.contentWindow?.postMessage(message, IFRAME_SRC)
}

const App = () => {
  const [pageUrl, setPageUrl] = useState(location.href)
  const [pageChapters, setPageChapters] = useState<PageChapters>()
  const [panelObserver, setPanelObserver] = useState<MutationObserver>()
  const [playerHeight, setPlayerHeight] = useState(DEFAULT_PLAYER_HEIGHT)
  // const [noTranscript, setNoTranscript] = useState(false)

  useEffect(() => {
    // const subtitles = document.querySelector('svg.ytp-subtitles-button-icon')
    // const opacity = subtitles?.attributes?.getNamedItem('fill-opacity')?.value ?? '1.0'
    // setNoTranscript(parseFloat(opacity) < 1.0)

    const player = document.querySelector('video')
    const playerObserver = new ResizeObserver(() => {
      if (player) setPlayerHeight(player.offsetHeight)
    })

    const pageObserver = new MutationObserver(mutationList => {
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

    // Receive messages from iframe child.
    const listener = (e: MessageEvent) => {
      // log(TAG, `onMessage, data=${JSON.stringify(e.data)}`)

      const { type, data } = e.data as Message
      if (type !== MessageType.IFRAME_HEIGHT) return
      const height = data as number

      const block = document.getElementById(BLOCK_ID)
      if (!(block instanceof HTMLDivElement)) return
      block.style.height = `${height}px`

      // FIXME (Matthew Lee) why playerHeight always 560px?
      // block.style.maxHeight = `${playerHeight}px`
      if (player) block.style.maxHeight = `${player.offsetHeight}px`
    }

    if (player) playerObserver.observe(player)
    pageObserver.observe(document, { subtree: true, childList: true })
    window.addEventListener('message', listener)

    return () => {
      pageObserver.disconnect()
      playerObserver.disconnect()
      window.removeEventListener('message', listener)
    }
  }, [])

  useEffect(() => {
    panelObserver?.disconnect()
    if (!parseVid(pageUrl)) return

    if (document.getElementById(BLOCK_ID)) {
      // log(TAG, 'send when pageUrl changed')
      sendPageUrl(pageUrl)
      sendPageChapters(pageChapters)
      return
    }

    const insertBlock = (parent: Node | null) => {
      if (!parent) return

      const iframe = document.createElement('iframe')
      iframe.id = IFRAME_ID
      iframe.src = IFRAME_SRC
      iframe.style.width = '100%'
      iframe.style.border = 'none'
      iframe.onload = () => {
        // log(TAG, 'send when iframe onload')
        sendPageUrl(pageUrl)
        sendPageChapters(pageChapters)
      }

      const block = document.createElement('div')
      block.id = BLOCK_ID
      block.className = 'style-scope ytd-watch-flexy'
      block.style.height = '0px'
      block.style.maxHeight = `${playerHeight}px`
      block.style.marginBottom = '8px'
      block.appendChild(iframe)

      const ref = parent.childNodes.length > 0 ? parent.childNodes[0] : null
      parent.insertBefore(block, ref)
    }

    const panels = document.querySelector('#secondary-inner')
    if (panels) {
      log(TAG, 'insert block with selector')
      insertBlock(panels)
      return
    }

    const observer = new MutationObserver(mutationList => {
      for (const mutation of mutationList) {
        let found = false

        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLDivElement) {
            if (node.id === 'panels') {
              log(TAG, 'insert block with observer')
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
    sendPageChapters(pageChapters)
  }, [pageChapters])

  useEffect(() => {
    log(TAG, `useEffect, playerHeight=${playerHeight}`)
    const block = document.getElementById(BLOCK_ID)
    if (!(block instanceof HTMLDivElement)) return
    block.style.maxHeight = `${playerHeight}px`
  }, [playerHeight])

  return (
    <div />
  )
}

const root = document.createElement('div')
root.id = 'better-youtube-summary-root'
document.body.appendChild(root)
createRoot(root).render(<App />)
