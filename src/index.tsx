import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useTranslation } from 'react-i18next'

import ScopedCssBaseline from '@mui/material/ScopedCssBaseline'
import { ThemeProvider } from '@mui/material/styles'

import theme from './theme'
import './i18n'

const App = () => {
  const { t } = useTranslation()

  useEffect(() => {
    // @ts-ignore
    const listener = (message, sender, sendResponse) => {
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
