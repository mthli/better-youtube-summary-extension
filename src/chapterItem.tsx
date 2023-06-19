import React, { Ref, forwardRef } from 'react'
import useResizeObserver from 'use-resize-observer'

import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListSubheader from '@mui/material/ListSubheader'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { Theme } from '@mui/material/styles'

import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

import { Chapter } from './data'
import 'github-markdown-css'
import './panel.css'
import './i18n'

const formatSeconds = (seconds: number): string => {
  const pad = (num: number, size: number): string => ('000' + num).slice(size * -1)

  const h = Math.floor(seconds / 60 / 60)
  const m = Math.floor(seconds / 60) % 60
  const s = Math.floor(seconds % 60)

  let res = pad(m, (h > 0 || m >= 10) ? 2 : 1) + ':' + pad(s, 2)
  if (h > 0) res = pad(h, h >= 10 ? 2 : 1) + ':' + res
  return res
}

// https://stackoverflow.com/a/8488787
const countLines = (str?: string | null): number => {
  return str ? str.trim().split(/\r\n|\r|\n/).length : 0
}

const hexToRgba = (hex: string, alpha: number = 1) => {
  // @ts-ignore
  const [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16))
  return `rgba(${r},${g},${b},${alpha})`
}

const ChapterItem = forwardRef(function ChapterItem({
  seconds,
  chapter,
  summary = '',
  theme,
  isLastItem = false,
  selected = false,
  expanded = false,
  onExpand,
  onSeekTo,
}: Chapter & {
  theme: Theme,
  isLastItem?: boolean,
  selected?: boolean,
  expanded?: boolean,
  onExpand?: (expand: boolean) => void,
  onSeekTo?: (seconds: number) => void,
}, ref: Ref<HTMLLIElement>) {
  const {
    ref: buttonRef,
    width: buttonWidth = 0,
  } = useResizeObserver<HTMLDivElement>()

  const count = countLines(summary)

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
                  onClick={() => onSeekTo?.(seconds)}
                >
                  {formatSeconds(seconds)}
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
                      fontSize: '1.6rem',
                      fontWeight: expanded ? 600 : 400,
                    }
                  }}
                  style={{ paddingRight: `${buttonWidth}px` }}
                >
                  {chapter}
                  <Typography
                    variant='body1'
                    sx={{
                      display: 'inline',
                      fontSize: '1.6rem',
                      color: 'text.primary',
                      opacity: 0.3,
                    }}
                  >
                    &nbsp;&nbsp;{count}
                  </Typography>
                </ListItemText>
              </ListItemButton>
            </ListItem>
          </ul>
        </ListSubheader>
        <Collapse in={expanded} timeout='auto' unmountOnExit>
          <ReactMarkdown className='markdown-body' rehypePlugins={[rehypeRaw]}>
            {/* textVide(summary) */ summary}
          </ReactMarkdown>
          {!isLastItem && <Divider />}
        </Collapse>
      </ul>
    </li>
  )
})

export default ChapterItem
