import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useTranslation } from 'react-i18next'

import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'

import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { TargetLang } from './data'

import log from './log'
import theme from './theme'
import './i18n'

const TAG = 'options'

const manifest = chrome.runtime.getManifest()
const version = `v${manifest.version}`

const App = () => {
  // TODO (Matthew Lee) read from storage.
  const [targetLangKey, setTargetLangKey] = useState(Object.keys(TargetLang)[0])

  const { t } = useTranslation()
  const title = t('title').toString()

  useEffect(() => {
    log(TAG, `useEffect, targetLangKey=${targetLangKey}`)
    // TODO (Matthew Lee) save to storage.
  }, [targetLangKey])

  return (
    <ThemeProvider theme={theme}>
      <Container
        maxWidth='sm'
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography
          variant='h5'
          component='div'
          gutterBottom
          sx={{
            display: 'flex',
            flexDirection: 'row',
            pt: 2,
          }}
        >
          {title}
          <Typography
            variant='caption'
            component='div'
            gutterBottom
            sx={{ pl: '6px' }}
          >
            {version}
          </Typography>
        </Typography>
        <Typography
          variant='body1'
          component='div'
          gutterBottom
        >
          {t('slogan').toString()}
        </Typography>
        <List
          sx={{
            marginLeft: '-16px',
            marginRight: '-16px',
          }}
        >
          <ListItem
            divider
            disablePadding
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              pt: '8px',
              pb: '8px',
              pl: '16px',
              pr: '9px', // trick.
            }}
          >
            <ListItemText>
              {t('translation').toString()}
            </ListItemText>
            <Select
              size='small'
              sx={{
                minWidth: '180px',
                height: '32px',
              }}
              value={targetLangKey}
              onChange={({ target: { value: key } }) => {
                log(TAG, `Select, onChange, key=${key}`)
                setTargetLangKey(key)
              }}
            >
              {
                Object.keys(TargetLang).map(key => (
                  <MenuItem key={key} value={key}>
                    {/* @ts-ignore */}
                    {TargetLang[key]}
                  </MenuItem>
                ))
              }
            </Select>
          </ListItem>
          <ListItem disablePadding divider>
            <ListItemButton
              component='a'
              href='https://twitter.com/mth_li'
              target='_blank'
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <ListItemText>
                  {t('twitter').toString()}
                </ListItemText>
                <span className="material-symbols-outlined">open_in_new</span>
              </Box>
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding divider>
            <ListItemButton
              component='a'
              href='https://t.me/betteryoutubesummary'
              target='_blank'
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <ListItemText>
                  {t('telegram').toString()}
                </ListItemText>
                <span className="material-symbols-outlined">open_in_new</span>
              </Box>
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              component='a'
              href={`mailto:matthewlee0725@gmail.com?subject=${`${title} ${version}`}`}
              target='_blank'
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <ListItemText>
                  {t('gmail').toString()}
                </ListItemText>
                <span className="material-symbols-outlined">open_in_new</span>
              </Box>
            </ListItemButton>
          </ListItem>
        </List>
      </Container>
    </ThemeProvider>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <CssBaseline />
    <App />
  </React.StrictMode>
);
