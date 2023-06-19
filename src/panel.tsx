import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Alert, { AlertColor } from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import ButtonGroup from '@mui/material/ButtonGroup'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import { ThemeProvider } from '@mui/material/styles'

import ChapterItem from './chapterItem'
import { GooSpinner, ImpulseSpinner } from 'react-spinners-kit'

import { useSummarize } from './api'
import {
  Message,
  MessageType,
  PageChapter,
  Summary,
  SummaryState,
} from './data'
import { Map as ImmutableMap } from 'immutable'

import log from './log'
import theme from './theme'
import './panel.css'
import './i18n'

const TAG = 'panel'

const checkNoTranscript = (): boolean => {
  const subtitles = document.querySelector('svg.ytp-subtitles-button-icon')
  const opacity = subtitles?.attributes?.getNamedItem('fill-opacity')?.value ?? '1.0'
  return parseFloat(opacity) < 1.0
}

// https://stackoverflow.com/a/75704708
const parseChapters = (): PageChapter[] => {
  const elements = Array.from(
    document.querySelectorAll(
      '#panels ytd-engagement-panel-section-list-renderer:nth-child(2) #content ytd-macro-markers-list-renderer #contents ytd-macro-markers-list-item-renderer #endpoint #details'
    )
  )

  const chapters = elements.map(node => ({
    title: node.querySelector('.macro-markers')?.textContent,
    timestamp: node.querySelector('#time')?.textContent,
  }))

  const filtered = chapters.filter(c =>
    c.title !== undefined &&
    c.title !== null &&
    c.timestamp !== undefined &&
    c.timestamp !== null
  )

  return [
    ...new Map(filtered.map(c => [c.timestamp, c])).values(),
  ] as PageChapter[]
}

// https://stackoverflow.com/a/62461987
const openOptionsPage = () => {
  chrome.runtime.sendMessage({
    type: MessageType.REQUEST,
    requestUrl: chrome.runtime.getURL('options.html'),
  } as Message, message => {
    const json = JSON.stringify(message)
    log(TAG, `openOptionsPage, responseCallback, message=${json}`)
  })
}

const Panel = ({ pageUrl }: { pageUrl: string }) => {
  const itemRefs = useRef(new Map<string, Element | null>())

  const [toggled, setToggled] = useState(0)
  const [selected, setSelected] = useState<string>('') // cid.
  const [expands, setExpands] = useState<ImmutableMap<string, boolean>>(ImmutableMap())

  const [playerHeight, setPlayerHeight] = useState(560) // px.
  const [translating, setTranslating] = useState(false)

  const { t } = useTranslation()
  const { data, error } = useSummarize(
    toggled,
    pageUrl,
    parseChapters(),
    checkNoTranscript(),
  )

  const { state, chapters = [] } = (data || {}) as Summary
  const { name: errName, message: errMsg } = (error || {}) as Error
  const doing = (state === SummaryState.DOING) && !error
  const done = (state === SummaryState.DONE) && !error

  let showAlert = false
  let alertSeverity: AlertColor = 'info'
  let alertTitle = ''
  let alertMsg = ''
  if (error) {
    showAlert = true
    alertSeverity = 'error'
    alertTitle = errName
    alertMsg = errMsg
  } else if (state === SummaryState.NOTHING) {
    showAlert = true
    alertSeverity = 'warning'
    alertTitle = t('no_transcript').toString()
    alertMsg = t('no_transcript_desc').toString()
  }

  const list = chapters.map((c, i) => (
    <ChapterItem
      {...c}
      key={c.cid}
      ref={el => itemRefs.current.set(c.cid, el)}
      isLastItem={i === chapters.length - 1}
      selected={c.cid === selected}
      expanded={expands.get(c.cid, false)}
      onExpand={expand => setExpands(expands.set(c.cid, expand))}
      onSeekTo={seconds => {
        log(TAG, `onSeekTo, seconds=${seconds}`)
        const player = document.querySelector('video')
        if (player) player.currentTime = seconds
      }}
    />
  ))

  // https://developer.mozilla.org/zh-CN/docs/Web/API/Element/scrollIntoView
  const scrollIntoView = (cid: string) => {
    log(TAG, `scrollIntoView, cid=${cid}`)

    itemRefs.current.get(cid)?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })

    setSelected(cid)
  }

  const syncToVideoTime = () => {
    const player = document.querySelector('video')
    if ((!player) || (chapters.length <= 0)) return

    const currentTime = player.currentTime // in seconds.
    log(TAG, `syncToViewTime, currentTime=${currentTime}`)

    for (let i = 0; i < chapters.length; i++) {
      if (chapters[i].seconds >= currentTime) {
        const { cid } = i > 0 ? chapters[i - 1] : chapters[0]
        scrollIntoView(cid)
        return
      }
    }

    // If not seleted in for loop, then must be the last item.
    scrollIntoView(chapters[chapters.length - 1].cid)
  }

  useEffect(() => {
    const player = document.querySelector('video')
    log(TAG, `useEffect, init, player=${player}`)

    const playerObserver = new ResizeObserver(() => {
      if (!player) return
      const height = player.offsetHeight
      log(TAG, `ResizeObserverCallback, height=${height}`)
      setPlayerHeight(height)
    })

    if (player) playerObserver.observe(player)
    return () => playerObserver.disconnect()
  }, [])

  useEffect(() => {
    log(TAG, `useEffect, pageUrl=${pageUrl}`)
    setToggled(0) // cancel all requests before.
  }, [pageUrl])

  useEffect(() => {
    log(TAG, `useEffect, selected=${selected}`)
    if (selected) setTimeout(() => setSelected(''), 2000) // ms.
  }, [selected])

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          overflow: 'hidden',
          flexDirection: 'column',
          minHeight: '48px',
          maxHeight: `${playerHeight > 240 ? playerHeight : 240}px`,
          bgcolor: 'background.default',
        }}
      >
        <AppBar position='static' color='transparent' elevation={0}>
          <Toolbar
            variant='dense'
            style={{ /* instead of sx */
              justifyContent: 'space-between',
              paddingLeft: '8px',
              paddingRight: '8px',
            }}
          >
            <ButtonGroup disableElevation>
              <Tooltip title={t('summarize').toString()}>
                {
                  // Tooltip will always show if its children changed accidentally,
                  // so use a Box as wrapper to let Tooltip can always foucs.
                }
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <IconButton
                    aria-label={t('summarize').toString()}
                    color='inherit'
                    disabled={doing}
                    onClick={() => setToggled(toggled + 1)}
                  >
                    {
                      !doing &&
                      <span className='material-symbols-outlined'>summarize</span>
                    }
                    {
                      doing &&
                      <GooSpinner
                        size={24}
                        color={theme.palette.text.primary}
                        loading
                      />
                    }
                  </IconButton>
                </Box>
              </Tooltip>
              {
                list.length > 0 &&
                <Tooltip title={t('sync_to_video_time').toString()}>
                  <IconButton
                    aria-label={t('sync_to_video_time').toString()}
                    color='inherit'
                    sx={{ ml: '8px' }}
                    onClick={syncToVideoTime}
                  >
                    <span className='material-symbols-outlined'>schedule</span>
                  </IconButton>
                </Tooltip>
              }
              {
                list.length > 0 &&
                <Tooltip title={t('unfold_less').toString()}>
                  <IconButton
                    aria-label={t('unfold_less').toString()}
                    color='inherit'
                    sx={{ ml: '8px' }}
                    onClick={() => setExpands(expands.clear())}
                  >
                    <span className='material-symbols-outlined'>unfold_less</span>
                  </IconButton>
                </Tooltip>
              }
            </ButtonGroup>
            <ButtonGroup>
              {
                list.length > 0 &&
                <Tooltip title={t('translate').toString()}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mr: '8px',
                  }}>
                    <IconButton
                      aria-label={t('translate').toString()}
                      color='inherit'
                      disabled={translating || !done}
                      onClick={() => {
                        // TODO
                      }}
                    >
                      {
                        !translating &&
                        <span className='material-symbols-outlined'>language</span>
                      }
                      {
                        translating &&
                        <ImpulseSpinner
                          size={24}
                          frontColor={theme.palette.text.primary}
                          backColor={theme.palette.text.secondary}
                          loading
                        />
                      }
                    </IconButton>
                  </Box>
                </Tooltip>
              }
              <Tooltip title={t('settings').toString()}>
                <IconButton
                  aria-label={t('settings').toString()}
                  color='inherit'
                  onClick={openOptionsPage}
                >
                  <span className='material-symbols-outlined'>settings</span>
                </IconButton>
              </Tooltip>
            </ButtonGroup>
          </Toolbar>
          {list.length > 0 && <Divider />}
        </AppBar>
        {
          showAlert &&
          <Alert
            severity={alertSeverity}
            sx={{
              display: 'flex',
              alignItems: 'center',
              borderRadius: 0,
              pt: 0,
              pb: 0,
            }}
            icon={false}
            action={
              <Tooltip title={t('close').toString()}>
                <IconButton
                  aria-label={t('close').toString()}
                  color='inherit'
                  sx={{ marginTop: '-4px' }} // FIXME (Matthew Lee) hack.
                  onClick={() => setToggled(0)} // reset.
                >
                  <span className='material-symbols-outlined'>close</span>
                </IconButton>
              </Tooltip>
            }
          >
            <AlertTitle
              sx={{
                marginTop: 0,
                marginBottom: '4px',
              }}
            >
              {alertTitle}
            </AlertTitle>
            {alertMsg}
          </Alert>
        }
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
