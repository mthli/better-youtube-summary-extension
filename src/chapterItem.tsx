import React, { Ref, forwardRef } from 'react'
import ReactMarkdown from 'react-markdown'
import useResizeObserver from 'use-resize-observer'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListSubheader from '@mui/material/ListSubheader'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { Theme } from '@mui/material/styles'

import { useTranslate } from './api'
import { Chapter, ChapterStyle } from './data'
import { countLines, formatSeconds, hexToRgba } from './utils'
import './markdown-light.css'
import './markdown-dark.css'
import './panel.css'
import './i18n'

// https://github.com/vinta/pangu.js
const pangu = require('pangu')

const ChapterItem = forwardRef(function ChapterItem({
  vid,
  cid,
  style = ChapterStyle.MARKDOWN,
  start,
  chapter,
  summary = '',
  theme,
  targetLang,
  translatable = false,
  isLastItem = false,
  selected = false,
  expanded = false,
  onExpand,
  onSeekTo,
}: Chapter & {
  theme: Theme,
  targetLang: string,
  translatable?: boolean,
  isLastItem?: boolean,
  selected?: boolean,
  expanded?: boolean,
  onExpand?: (expand: boolean) => void,
  onSeekTo?: (start: number) => void,
}, ref: Ref<HTMLLIElement>) {

  const { ref: buttonRef, width: buttonWidth = 0 } = useResizeObserver<HTMLDivElement>()

  // FIXME (Matthew Lee) ignore loading and error for now.
  const { data, /* error, isLoading */ } = useTranslate(translatable, vid, cid, targetLang)
  const { chapter: transChapter, summary: transSummary } = data || {}

  const count = countLines(summary)
  const padding = style === ChapterStyle.TEXT ? '8px' : 0
  const finalChapter = pangu.spacing(transChapter || chapter)
  const finalSummary = pangu.spacing(transSummary || summary)

  return (
    <li ref={ref}>
      <ul>
        <ListSubheader
          sx={{
            padding: 0,
            color: 'text.primary',
          }}
        >
          {/* <li> cannot appear as a descendant of <li> */}
          <ul>
            <ListItem
              disablePadding
              divider={expanded}
              secondaryAction={
                <Button
                  component='div'
                  size='small'
                  ref={buttonRef}
                  sx={{
                    minWidth: 0,
                    paddingLeft: '8px',
                    paddingRight: '8px',
                    bgcolor: hexToRgba(theme.palette.primary.main, 0.05),
                  }}
                  onClick={() => onSeekTo?.(start)}
                >
                  {formatSeconds(start)}
                </Button>
              }
            >
              <ListItemButton
                disabled={count <= 0}
                selected={selected}
                onClick={() => onExpand?.(!expanded)}
              >
                <ListItemText
                  primaryTypographyProps={{
                    sx: {
                      fontWeight: expanded ? 600 : 400,
                    }
                  }}
                  style={{ paddingRight: `${buttonWidth}px` }}
                >
                  {finalChapter}
                  {
                    count > 1 &&
                    <Typography
                      variant='body1'
                      sx={{
                        display: 'inline',
                        color: 'text.primary',
                        opacity: 0.3,
                      }}
                    >
                      &nbsp;&nbsp;{count}
                    </Typography>
                  }
                </ListItemText>
              </ListItemButton>
            </ListItem>
          </ul>
        </ListSubheader>
        <Collapse in={expanded} timeout='auto' unmountOnExit>
          <Box
            sx={{
              pl: padding,
              pr: padding,
            }}
          >
            <ReactMarkdown className={`markdown-${theme.palette.mode}`}>
              {finalSummary}
            </ReactMarkdown>
          </Box>
          {!isLastItem && <Divider />}
        </Collapse>
      </ul>
    </li>
  )
})

export default ChapterItem
