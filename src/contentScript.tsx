import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'

const App = () => {

  useEffect(() => {
    // TODO
  }, [])

  return (
    <div />
  )
}

const root = document.createElement('div')
document.body.appendChild(root)
createRoot(root).render(<App />)
