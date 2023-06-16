import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import Toolbar from '@mui/material/Toolbar'
import { ThemeProvider } from '@mui/material/styles'

import ChapterItem from './chapterItem'
import { GooSpinner } from 'react-spinners-kit'

import { useSummarize } from './api'
import { PageChapters, Summary, SummaryState } from './data'

import log from './log'
import theme from './theme'
import './i18n'

const TAG = 'panel'

const Panel = () => {
  const [toggled, setToggled] = useState(0)
  const [pageUrl, setPageUrl] = useState('')
  const [pageChapters, setPageChapters] = useState<PageChapters>()
  const [noTranscript, setNoTranscript] = useState(false)

  const { t } = useTranslation()
  const { data, error, isLoading } = useSummarize(toggled, pageUrl, pageChapters, noTranscript)

  // TODO
  const { state = SummaryState.NOTHING, chapters = [] } = (data || {}) as Summary
  const list = chapters.map(c => <ChapterItem key={c.cid} {...c} />)

  useEffect(() => {
    log(TAG, `useEffect, pageUrl=${pageUrl}`)
    setToggled(0) // cancel all requests before.
  }, [pageUrl])

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: 'background.default' }}>
        <AppBar
          position='sticky'
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
        {list.length > 0 && <List>{list}</List>}
      </Box>
    </ThemeProvider>
  )
}

export default Panel
