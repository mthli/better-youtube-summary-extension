import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Trans, useTranslation } from 'react-i18next'

import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'

import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'

import theme from './theme'
import './i18n'

const App = () => {
  const { t } = useTranslation()
  const title = t('title').toString()

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
          sx={{ pt: 2 }}
        >
          {title}
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
          <ListItem disablePadding divider>
            <ListItemButton
              component='a'
              href='https://twitter.com/mth_li'
              target='_blank'
            >
              <ListItemText>
                {t('twitter').toString()}
              </ListItemText>
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding divider>
            <ListItemButton
              component='a'
              href='https://t.me/betteryoutubesummary'
              target='_blank'
            >
              <ListItemText>
                {t('telegram').toString()}
              </ListItemText>
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              component='a'
              href={`mailto:matthewlee0725@gmail.com?subject=${title}`}
              target='_blank'
            >
              <ListItemText>
                {t('gmail').toString()}
              </ListItemText>
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
