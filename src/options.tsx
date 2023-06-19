import React, { } from 'react'
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
          <ListItem
            divider
            disablePadding
            sx={{
              display: 'flex',
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              pt: '8px',
              pb: '8px',
              pl: '16px',
              pr: '16px',
            }}
          >
            <ListItemText>
              {t('translation').toString()}
            </ListItemText>
            <Select
              size='small'
              sx={{
                minWidth: '120px',
                height: '32px',
              }}
            >
              <MenuItem value={0}>
                <em>None</em>
              </MenuItem>
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
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
                  overflow: 'hidden',
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
                  overflow: 'hidden',
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
              href={`mailto:matthewlee0725@gmail.com?subject=${title}`}
              target='_blank'
            >
              <Box
                sx={{
                  display: 'flex',
                  overflow: 'hidden',
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
