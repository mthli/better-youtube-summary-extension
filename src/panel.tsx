import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import { ThemeProvider } from '@mui/material/styles'

import ChapterItem from './chapterItem'
import { GooSpinner } from 'react-spinners-kit'

import { useSummarize } from './api'
import { PageChapters, Summary, SummaryState } from './data'

import log from './log'
import theme from './theme'
import './i18n'

const TAG = 'panel'

const Panel = ({
  pageUrl,
  pageChapters,
  noTranscript = false,
  maxHeight = 560, // px.
}: {
  pageUrl: string,
  pageChapters?: PageChapters,
  noTranscript?: boolean,
  maxHeight?: number, // px.
}) => {
  const [toggled, setToggled] = useState(0)

  const { t } = useTranslation()
  const { data, error, isLoading } = useSummarize(toggled, pageUrl, pageChapters, noTranscript)

  // TODO
  const { state = SummaryState.NOTHING, chapters = [] } = (data || {}) as Summary
  const list = chapters.map((c, i) => (
    <ChapterItem
      key={c.cid}
      isLastItem={i === chapters.length - 1}
      {...c}
    />
  ))

  useEffect(() => {
    log(TAG, `useEffect, pageUrl=${pageUrl}`)
    setToggled(0) // cancel all requests before.
  }, [pageUrl])

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          overflow: 'hidden',
          flexDirection: 'column',
          maxHeight: `${maxHeight}px`,
          bgcolor: 'background.default',
        }}
      >
        <AppBar position='static' color='transparent' elevation={0}>
          <Toolbar
            variant='dense'
            style={{ /* instead of sx */
              paddingLeft: '20px',
              paddingRight: '20px',
            }}
          >
            <Tooltip title={t('summarize').toString()}>
              <IconButton
                aria-label={t('summarize').toString()}
                color='inherit'
                edge='start'
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
            </Tooltip>
            {
              list.length > 0 &&
              <Tooltip title={t('unfold_less').toString()}>
                <IconButton
                  aria-label={t('unfold_less').toString()}
                  color='inherit'
                  sx={{ ml: '8px' }}
                  disabled={isLoading}
                  onClick={() => {
                    // TODO
                  }}
                >
                  <span className="material-symbols-outlined">unfold_less</span>
                </IconButton>
              </Tooltip>
            }
          </Toolbar>
          {list.length > 0 && <Divider light />}
        </AppBar>
        <Box
          sx={{
            display: 'block',
            overflow: 'hidden scroll',
          }}
        >
          {
            list.length > 0 &&
            <List subheader={<li />}>
              {list}
            </List>
          }
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default Panel
