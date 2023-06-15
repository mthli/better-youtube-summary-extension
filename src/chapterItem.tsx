import React, { useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'

import { MessageType, Message, Chapter } from './data'
import './i18n'
import theme from './theme'

const formatSeconds = (seconds: number): string => {
  const pad = (num: number, size: number): string => ('000' + num).slice(size * -1)

  const h = Math.floor(seconds / 60 / 60)
  const m = Math.floor(seconds / 60) % 60
  const s = Math.floor(seconds % 60)

  let res = pad(m, (h > 0 || m >= 10) ? 2 : 1) + ':' + pad(s, 2)
  if (h > 0) res = pad(h, h >= 10 ? 2 : 1) + ':' + res
  return res
}

const hex2rgba = (hex: string, alpha: number = 1) => {
  // @ts-ignore
  const [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16))
  return `rgba(${r},${g},${b},${alpha})`
}

const ChapterItem = ({ seconds, chapter, summary }: Chapter) => {
  const [expand, setExpand] = useState(false)

  return (
    <ListItem
      disablePadding
      secondaryAction={
        <Button
          size='small'
          sx={{
            minWidth: 0,
            paddingLeft: '8px',
            paddingRight: '8px',
          }}
          onClick={() => {
            const message: Message = {
              type: MessageType.PLAY_SECONDS,
              data: seconds,
            }
            window.parent.postMessage(message, '*')
          }}
        >
          {formatSeconds(seconds)}
        </Button>
      }
    >
      <ListItemButton
        onClick={() => {
          // TODO
        }}
      >
        <ListItemText>
          {chapter}
          <Typography
            variant='body1'
            style={{
              display: 'inline',
              color: hex2rgba(theme.palette.text.primary, 0.3),
            }}
          >
            &nbsp;&nbsp;7
          </Typography>
        </ListItemText>
      </ListItemButton>
    </ListItem>
  )
}

export default ChapterItem
