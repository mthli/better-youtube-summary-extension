import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useTranslation } from 'react-i18next'

import ScopedCssBaseline from '@mui/material/ScopedCssBaseline'
import { ThemeProvider } from '@mui/material/styles'

import log from './log'
import {
  Chapter,
  PageChapters,
  MessageType,
  Message,
  pageUrlMatch,
} from './message'

import theme from './theme'
import './i18n'

const TAG = 'index'

const App = () => {
  const { t } = useTranslation()

  useEffect(() => {
    // @ts-ignore
    const listener = (message, sender, _) => {
      const { id: senderId, url: senderUrl = '' } = sender
      if (senderId !== chrome.runtime.id) return // not our event.
      if (!pageUrlMatch.test(senderUrl)) return // not video url.

      log(TAG, `useEffect, onMessage, senderUrl=${senderUrl}, message=${JSON.stringify(message)}`)
      // TODO
    }

    chrome.runtime.onMessage.addListener(listener)
    return () => chrome.runtime.onMessage.removeListener(listener)
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
