import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

import useSWR from 'swr'
import useResizeObserver from 'use-resize-observer'
import { useTranslation } from 'react-i18next'

import AppBar from '@mui/material/AppBar'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

import ScopedCssBaseline from '@mui/material/ScopedCssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { GooSpinner } from 'react-spinners-kit'

import log from './log'
import { parseVid, summarize } from './api'
import {
  PageChapters,
  MessageType,
  Message,
} from './message'

import theme from './theme'
import './i18n'

const TAG = 'index'

// Make sure chapters belong to its pageUrl.
const matchPageChapters = (pageUrl: string, pageChapters?: PageChapters): PageChapters | null => {
  return pageUrl === pageChapters?.pageUrl ? pageChapters : null
}

const App = () => {
  const [toggled, setToggled] = useState(false)
  const [pageUrl, setPageUrl] = useState('')
  const [pageChapters, setPageChapters] = useState<PageChapters>()

  const { t } = useTranslation()
  const { ref, height = 0 } = useResizeObserver<HTMLDivElement>()
  const { data, error, isLoading } = useSWR(
    toggled ? [parseVid(pageUrl), matchPageChapters(pageUrl, pageChapters)?.chapters] : null,
    ([vid, chapters]) => summarize(vid, chapters),
  )

  useEffect(() => {
    // Receive messages from parent.
    const listener = (e: MessageEvent) => {
      // log(TAG, `onMessage, data=${JSON.stringify(e.data)}`)

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

  useEffect(() => {
    log(TAG, `useEffect, height=${height}`)

    const message: Message = {
      type: MessageType.IFRAME_HEIGHT,
      data: height,
    }

    window.parent.postMessage(message, '*')
  }, [height])

  useEffect(() => {
    log(TAG, `useEffect, pageUrl=${pageUrl}`)
    setToggled(false) // cancel all requests before.
  }, [pageUrl])

  useEffect(() => {
    log(TAG, `useEffect, toggled=${toggled}`)

    if (!toggled) {
      // TODO
      return
    }

    // TODO
  }, [toggled])

  return (
    <ThemeProvider theme={theme}>
      <ScopedCssBaseline ref={ref} sx={{ backgroundColor: 'transparent' }}>
        <Paper variant='outlined'>
          <AppBar position='static' color='transparent' elevation={0}>
            <Toolbar variant='dense'>
              <IconButton
                aria-label={t(toggled ? 'cancel' : 'summarize').toString()}
                color='inherit'
                edge='start'
                sx={{ mr: 1 }}
                onClick={() => setToggled(!toggled)}
              >
                {
                  !toggled &&
                  <span className='material-symbols-outlined'>summarize</span>
                }
                {
                  toggled &&
                  <GooSpinner
                    size={24}
                    color={theme.palette.iconColorActive.main}
                    loading
                  />
                }
              </IconButton>
              <Typography
                component='div'
                variant='h6'
                color={theme.palette.textColorPrimary.main}
                sx={{
                  fontSize: '16px',
                  fontWeight: 500,
                }}
              >
                {t(toggled ? 'summarizing' : 'summarize').toString()}
              </Typography>
            </Toolbar>
          </AppBar>
        </Paper>
      </ScopedCssBaseline>
    </ThemeProvider>
  )
}

const root = document.getElementById('root')
createRoot(root!).render(<App />)
