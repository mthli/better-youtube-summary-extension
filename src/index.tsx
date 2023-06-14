import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useTranslation } from 'react-i18next'

import AppBar from '@mui/material/AppBar'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import { ThemeProvider } from '@mui/material/styles'

import { GooSpinner } from 'react-spinners-kit'

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

  const [loading, setLoading] = useState(false)
  const [pageUrl, setPageUrl] = useState('')
  const [pageChapters, setPageChapters] = useState<PageChapters>()

  useEffect(() => {
    // Receive messages from parent.
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
      <ScopedCssBaseline sx={{ backgroundColor: 'transparent' }}>
        <Paper variant='outlined'>
          <AppBar position='static' color='transparent' elevation={0}>
            <Toolbar variant='dense'>
              <Tooltip title={t(loading ? 'cancel' : 'summarize').toString()}>
                <IconButton
                  aria-label={t(loading ? 'cancel' : 'summarize').toString()}
                  color='inherit'
                  edge='start'
                  onClick={() => setLoading(!loading)}
                >
                  {
                    !loading &&
                    <span className='material-symbols-outlined'>summarize</span>
                  }
                  {
                    loading &&
                    <GooSpinner
                      size={24}
                      color={theme.palette.iconColorActive.main}
                      loading={loading}
                    />
                  }
                </IconButton>
              </Tooltip>
            </Toolbar>
          </AppBar>
        </Paper>
      </ScopedCssBaseline>
    </ThemeProvider>
  )
}

const root = document.getElementById('root')
createRoot(root!).render(<App />)
