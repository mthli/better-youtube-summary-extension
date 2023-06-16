import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

import useResizeObserver from 'use-resize-observer'
import { useTranslation } from 'react-i18next'

import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import Toolbar from '@mui/material/Toolbar'

import { ThemeProvider } from '@mui/material/styles'
import { GooSpinner } from 'react-spinners-kit'

import ChapterItem from './chapterItem'

import { useSummarize } from './api'
import {
  PageChapters,
  MessageType,
  Message,
  Summary,
  SummaryState,
} from './data'

import log from './log'
import theme from './theme'
import './i18n'

const TAG = 'index'

const App = () => {
  const [toggled, setToggled] = useState(0)
  const [pageUrl, setPageUrl] = useState('')
  const [pageChapters, setPageChapters] = useState<PageChapters>()
  const [noTranscript, setNoTranscript] = useState(false)

  const { t } = useTranslation()
  const { ref, height = 50 /* minimal */ } = useResizeObserver<HTMLDivElement>()
  const { data, error, isLoading } = useSummarize(toggled, pageUrl, pageChapters, noTranscript)

  // TODO
  const { state = SummaryState.NOTHING, chapters = [] } = (data || {}) as Summary
  const list = chapters.map(c => <ChapterItem key={c.cid} {...c} />)

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
        case MessageType.NO_TRANSCRIPT:
          setNoTranscript(data as boolean)
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
    setToggled(0) // cancel all requests before.
  }, [pageUrl])

  return (
    <ThemeProvider theme={theme}>
      <Box
        ref={ref}
        sx={{ bgcolor: 'background.default' }}
      >
        <AppBar
          position='fixed'
          color='transparent'
          elevation={0}
          sx={{ bgcolor: 'background.default' }}
        >
          <Toolbar variant='dense'>
            <IconButton
              aria-label={t('summarize').toString()}
              color='inherit'
              edge='start'
              sx={{ mr: 1 }}
              disabled={isLoading}
              onClick={() => setToggled(toggled + 1)}
            >
              {
                !isLoading &&
                <span className='material-symbols-outlined'>summarize</span>
              }
              {
                isLoading &&
                <GooSpinner
                  size={24}
                  color={theme.palette.text.primary}
                  loading
                />
              }
            </IconButton>
          </Toolbar>
          {list.length > 0 && <Divider light />}
        </AppBar>
        <Toolbar /> {/* as placeholder because of the app bar is fixed */}
        {list.length > 0 && <List>{list}</List>}
      </Box>
    </ThemeProvider>
  )
}

const root = document.getElementById('root')
createRoot(root!).render(<App />)
