import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMediaQuery } from 'usehooks-ts'

import Alert, { AlertColor } from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import ButtonGroup from '@mui/material/ButtonGroup'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemIcon from '@mui/material/ListItemIcon'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'

import { ThemeProvider } from '@mui/material/styles'
import { lightTheme, darkTheme } from './theme'

import ChapterItem from './chapterItem'
import { GooSpinner } from 'react-spinners-kit'

import {
  Message,
  MessageType,
  PageChapter,
  Settings,
  State,
  Summary,
  TargetLang,
} from './data'
import { copyChapters } from './utils'
import { useSummarize, feedback } from './api'
import { Map as ImmutableMap } from 'immutable'

import browser from 'webextension-polyfill'
import log from './log'
import './panel.css'
import './i18n'

const TAG = 'panel'

const checkIsDarkMode = (prefersDarkMode: boolean): boolean => {
  // Follow the System Preferences.
  if (prefersDarkMode) return true

  const flexy = document.querySelector('ytd-watch-flexy')
  if (!flexy) return prefersDarkMode

  // Check if YouTube Settings.
  const check = flexy.attributes.getNamedItem('is-dark-theme')
  return Boolean(check) || prefersDarkMode
}

const checkNoTranscript = (): boolean => {
  const subtitles = document.querySelector('svg.ytp-subtitles-button-icon')
  const opacity = subtitles?.attributes?.getNamedItem('fill-opacity')?.value ?? '1.0'
  return parseFloat(opacity) < 1.0
}

const initTargetLang = (): string => {
  const keys = Object.keys(TargetLang)
  const lang = document
    .documentElement
    .attributes
    .getNamedItem('lang')
    ?.textContent
    ?.trim() ?? ''

  for (const key of keys) {
    if (lang.startsWith(key)) return key
  }

  return keys[0] // default.
}

// https://stackoverflow.com/a/62461987
const openOptionsPage = () => {
  browser.runtime.sendMessage({
    type: MessageType.REQUEST,
    requestUrl: browser.runtime.getURL('options.html'),
  } as Message)
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

const Panel = ({ pageUrl }: { pageUrl: string }) => {
  const itemRefs = useRef(new Map<string, Element | null>())
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const currentTheme = checkIsDarkMode(prefersDarkMode) ? darkTheme : lightTheme
  const iconColorActive = currentTheme.palette.action.active
  const iconColorDisabled = currentTheme.palette.action.disabled
  const iconColorHighlight = currentTheme.palette.primary.main
  const targetLangkeys = Object.keys(TargetLang)

  const [summarizing, setSummarizing] = useState(0)
  const [translatable, setTranslatable] = useState(false)
  const [targetLang, setTargetLang] = useState(initTargetLang())
  const [copyWithTimestamps, setCopyWithTimestamps] = useState(false)

  const [selected, setSelected] = useState<string>('') // cid.
  const [expands, setExpands] = useState<ImmutableMap<string, boolean>>(ImmutableMap())

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [playerHeight, setPlayerHeight] = useState(560) // px.

  const { t } = useTranslation()
  const { data, error } = useSummarize(
    summarizing,
    pageUrl,
    parseChapters(),
    checkNoTranscript(),
  )

  const { state, chapters = [] } = (data || {}) as Summary
  const doing = (state === State.DOING) && !error
  const done = (state === State.DONE) && !error

  const transDisabled = !done
  let transIconColor = iconColorActive
  if (transDisabled) {
    transIconColor = iconColorDisabled
  } else if (translatable) {
    transIconColor = iconColorHighlight
  }

  let showAlert = false
  let alertSeverity: AlertColor = 'info'
  let alertTitle = ''
  let alertMsg = ''
  if (error) {
    const { name, message } = error as Error
    showAlert = true
    alertSeverity = 'error'
    alertTitle = name
    alertMsg = message
  } else if (state === State.NOTHING) {
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
      theme={currentTheme}
      targetLang={targetLang}
      translatable={translatable}
      isLastItem={i === chapters.length - 1}
      selected={c.cid === selected}
      expanded={expands.get(c.cid, false)}
      onExpand={expand => setExpands(expands.set(c.cid, expand))}
      onSeekTo={start => {
        log(TAG, `onSeekTo, start=${start}`)
        const player = document.querySelector('video')
        if (player) player.currentTime = start
      }}
    />
  ))

  const onClose = () => {
    setSelected('') // clear.
    setExpands(expands.clear())
    setSummarizing(0) // reset.
    setTranslatable(false) // reset.
  }

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
      if (chapters[i].start >= currentTime) {
        const { cid } = i > 0 ? chapters[i - 1] : chapters[0]
        scrollIntoView(cid)
        return
      }
    }

    // If not seleted in for loop, then must be the last item.
    scrollIntoView(chapters[chapters.length - 1].cid)
  }

  useEffect(() => {
    browser.storage.sync
      .get([
        Settings.TRANSLATION_TARGET_LANG,
        Settings.COPY_WITH_TIMESTAMPS,
      ])
      .then(({
        [Settings.TRANSLATION_TARGET_LANG]: lang,
        [Settings.COPY_WITH_TIMESTAMPS]: copy,
      }) => {
        setCopyWithTimestamps(Boolean(copy))

        if (targetLangkeys.includes(lang)) {
          setTargetLang(lang)
          return
        }

        // If no settings yet.
        browser.storage.sync.set({ [Settings.TRANSLATION_TARGET_LANG]: targetLang })
      })

    // @ts-ignore
    const listener = (changes, areaName) => {
      if (areaName !== 'sync') return

      // @ts-ignore
      for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
        log(TAG, `storage.onChanged, key=${key}, oldValue=${oldValue}, newValue=${newValue}`)
        if (key === Settings.TRANSLATION_TARGET_LANG) {
          setTargetLang(newValue)
        } else if (key === Settings.COPY_WITH_TIMESTAMPS) {
          setCopyWithTimestamps(newValue)
        }
      }
    }

    const player = document.querySelector('video')
    log(TAG, `useEffect, init, player=${player}`)

    const playerObserver = new ResizeObserver(() => {
      if (!player) return
      const height = player.offsetHeight
      log(TAG, `ResizeObserverCallback, height=${height}`)
      setPlayerHeight(height)
    })

    if (player) playerObserver.observe(player)
    browser.storage.onChanged.addListener(listener)

    return () => {
      playerObserver.disconnect()
      browser.storage.onChanged.removeListener(listener)
    }
  }, [])

  useEffect(() => {
    log(TAG, `useEffect, pageUrl=${pageUrl}`)
    setSummarizing(0) // cancel all requests before.
    setTranslatable(false) // cancel all requests before.
  }, [pageUrl])

  useEffect(() => {
    log(TAG, `useEffect, selected=${selected}`)
    if (selected) setTimeout(() => setSelected(''), 2000) // ms.
  }, [selected])

  const menu = (
    <Menu
      anchorReference='anchorPosition'
      anchorPosition={{
        top: (anchorEl?.getBoundingClientRect()?.top ?? 0) - 2,
        left: (anchorEl?.getBoundingClientRect()?.left ?? 0) - 56,
      }}
      open={Boolean(anchorEl)}
      onClose={() => setAnchorEl(null)}
    >
      <MenuItem
        key={'good'}
        sx={{ pr: '18px' }}
        disabled={!done}
        onClick={() => {
          setAnchorEl(null)
          feedback(pageUrl, true)
        }}
      >
        <ListItemIcon>
          <span className='material-symbols-outlined'>thumb_up</span>
        </ListItemIcon>
        {t('good').toString()}
      </MenuItem>
      <MenuItem
        key={'bad'}
        sx={{ pr: '18px' }}
        disabled={!done}
        onClick={() => {
          setAnchorEl(null)
          feedback(pageUrl, false)
        }}
      >
        <ListItemIcon>
          <span className='material-symbols-outlined'>thumb_down</span>
        </ListItemIcon>
        {t('bad').toString()}
      </MenuItem>
      <MenuItem
        key={'settings'}
        sx={{ pr: '18px' }}
        onClick={() => {
          setAnchorEl(null)
          openOptionsPage()
        }}
      >
        <ListItemIcon>
          <span className='material-symbols-outlined'>settings</span>
        </ListItemIcon>
        {t('settings').toString()}
      </MenuItem>
    </Menu>
  )

  return (
    <ThemeProvider theme={currentTheme}>
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
                    disabled={doing}
                    style={{ color: doing ? iconColorDisabled : iconColorActive }} // not `sx` here.
                    onClick={() => setSummarizing(summarizing + 1)}
                  >
                    {
                      !doing &&
                      <span className='material-symbols-outlined'>summarize</span>
                    }
                    {
                      doing &&
                      <GooSpinner
                        size={24}
                        color={currentTheme.palette.text.primary}
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
                    style={{ color: iconColorActive, marginLeft: '8px' }} // not `sx` here.
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
                    style={{ color: iconColorActive, marginLeft: '8px' }} // not `sx` here.
                    onClick={() => setExpands(expands.clear())}
                  >
                    <span className='material-symbols-outlined'>unfold_less</span>
                  </IconButton>
                </Tooltip>
              }
              {
                list.length > 0 &&
                <Tooltip title={t('close').toString()}>
                  <IconButton
                    aria-label={t('close').toString()}
                    style={{ color: iconColorActive, marginLeft: '8px' }} // not `sx` here.
                    onClick={onClose}
                  >
                    <span className='material-symbols-outlined'>close</span>
                  </IconButton>
                </Tooltip>
              }
            </ButtonGroup>
            <ButtonGroup>
              {
                list.length > 0 &&
                <Tooltip title={t('copy').toString()}>
                  <IconButton
                    aria-label={t('copy').toString()}
                    disabled={!done}
                    style={{ // not `sx` here.
                      marginRight: '8px',
                      color: done ? iconColorActive : iconColorDisabled,
                    }}
                    onClick={() => copyChapters(chapters, copyWithTimestamps)}
                  >
                    <span className='material-symbols-outlined'>content_copy</span>
                  </IconButton>
                </Tooltip>
              }
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
                      disabled={transDisabled}
                      style={{ color: transIconColor }} // not `sx` here.
                      onClick={() => {
                        const lang = chapters.length > 0 ? chapters[0].lang : targetLangkeys[0]
                        if (lang === targetLang || !targetLang) {
                          openOptionsPage()
                        } else {
                          setTranslatable(!translatable)
                        }
                      }}
                    >
                      {/* SVG copied from YouTube, not perfect but ok. */}
                      <svg
                        viewBox='0 0 24 24'
                        width='22px'
                        height='22px'
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '1px',
                          fill: transIconColor,
                        }}
                      >
                        <path d='M13.33 6c-1 2.42-2.22 4.65-3.57 6.52l2.98 2.94-.7.71-2.88-2.84c-.53.67-1.06 1.28-1.61 1.83l-3.19 3.19-.71-.71 3.19-3.19c.55-.55 1.08-1.16 1.6-1.83l-.16-.15c-1.11-1.09-1.97-2.44-2.49-3.9l.94-.34c.47 1.32 1.25 2.54 2.25 3.53l.05.05c1.2-1.68 2.29-3.66 3.2-5.81H2V5h6V3h1v2h7v1h-2.67zM22 21h-1l-1.49-4h-5.02L13 21h-1l4-11h2l4 11zm-2.86-5-1.86-5h-.56l-1.86 5h4.28z' />
                      </svg>
                    </IconButton>
                  </Box>
                </Tooltip>
              }
              <Tooltip title={t('more').toString()}>
                <IconButton
                  aria-label={t('more').toString()}
                  style={{ color: iconColorActive }} // not `sx` here.
                  onClick={e => setAnchorEl(e.currentTarget)}
                >
                  {/* SVG copied from YouTube, not perfect but ok. */}
                  <svg
                    viewBox='0 0 24 24'
                    width='22px'
                    height='22px'
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1px',
                      fill: iconColorActive,
                    }}
                  >
                    <path d='M12 16.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zM10.5 12c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5zm0-6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5z' />
                  </svg>
                </IconButton>
              </Tooltip>
              {menu}
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
              paddingTop: 0,
              paddingBottom: 0,
              fontSize: '1.2rem',
            }}
            icon={false}
            action={
              <Tooltip title={t('close').toString()}>
                <IconButton
                  aria-label={t('close').toString()}
                  style={{ color: iconColorActive, marginTop: '-4px' }} // not `sx` here.
                  onClick={onClose}
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
                fontSize: '1.4rem',
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
