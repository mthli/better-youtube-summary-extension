import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

const App = () => {
  const [pageUrl, setPageUrl] = useState(location.href)

  useEffect(() => {
    const observer = new MutationObserver(() => setPageUrl(location.href))
    observer.observe(document, { subtree: true, childList: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    // TODO
  }, [pageUrl])

  return (
    <div />
  )
}

const root = document.createElement('div')
document.body.appendChild(root)
createRoot(root).render(<App />)
