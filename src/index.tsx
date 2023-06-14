import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useTranslation } from 'react-i18next'

import ScopedCssBaseline from '@mui/material/ScopedCssBaseline'
import { ThemeProvider } from '@mui/material/styles'

import log from './log'
import {
  PageChapters,
  MessageType,
  Message,
} from './message'

import theme from './theme'
import './i18n'

const TAG = 'index'

const App = () => {
  const { t } = useTranslation()
  const [pageUrl, setPageUrl] = useState('')
  const [pageChapters, setPageChapters] = useState<PageChapters>()

  useEffect(() => {
    const listener = (e: MessageEvent) => {
      log(TAG, `useEffect, onMessage, data=${JSON.stringify(e.data)}`)
      const { type, data } = e.data as Message
      switch (type) {
        case MessageType.PAGE_URL:
          setPageUrl(data as string)
          break
        case MessageType.PAGE_CHAPTERS:
          setPageChapters(data as PageChapters)
          break
        default:
          break
      }
    }

    window.addEventListener('message', listener)
    return () => window.removeEventListener('message', listener)
  })

  return (
    <ThemeProvider theme={theme}>
      <ScopedCssBaseline>
        {/* TODO */}
      </ScopedCssBaseline>
    </ThemeProvider>
  )
}

const root = document.getElementById('root')
createRoot(root!).render(<App />)
