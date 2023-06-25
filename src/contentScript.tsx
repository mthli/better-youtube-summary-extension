import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { createRoot } from 'react-dom/client'

import Panel from './panel'

import log from './log'
import { parseVid } from './utils'

// Insert as soon as possible.
const link = document.createElement('link')
link.rel = 'stylesheet'
link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,200,0,0'
document.head.appendChild(link)

const TAG = 'contentScript'

const App = () => {
  const [pageUrl, setPageUrl] = useState(location.href)
  const [panelsObserver, setPanelsObserver] = useState<MutationObserver>()
  const [blockNode, setBlockNode] = useState<HTMLDivElement>()

  useEffect(() => {
    const observer = new MutationObserver(() => setPageUrl(location.href))
    observer.observe(document, { subtree: true, childList: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    panelsObserver?.disconnect()
    if (blockNode || !parseVid(pageUrl)) return

    const insertBlock = (parent: Node | null) => {
      if (!parent) return

      const block = document.createElement('div')
      block.id = 'better-youtube-summary-block'
      block.className = 'style-scope ytd-watch-flexy'
      block.style.display = 'block'
      block.style.overflow = 'hidden'
      block.style.minHeight = '48px'
      block.style.marginBottom = '8px'
      block.style.border = '1px solid var(--yt-spec-10-percent-layer)'
      block.style.borderRadius = '12px'

      const ref = parent.childNodes.length > 0 ? parent.childNodes[0] : null
      parent.insertBefore(block, ref)
      setBlockNode(block)
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

    setPanelsObserver(observer)
    observer.observe(document, { subtree: true, childList: true })
  }, [pageUrl])

  return (
    <div>
      {
        blockNode &&
        createPortal(
          <Panel pageUrl={pageUrl} />,
          blockNode,
        )
      }
    </div>
  )
}

const root = document.createElement('div')
root.id = 'better-youtube-summary-root'
document.body.appendChild(root)
createRoot(root).render(<App />)
