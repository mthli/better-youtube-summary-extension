import { createTheme } from '@mui/material/styles'

// YouTube Light.
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#065fd4', // --yt-spec-themed-blue
    },
    secondary: {
      main: '#737373', // --light-theme-secondary-color
    },
    error: {
      main: '#dd2c00', // --error-color
    },
    text: {
      primary: '#0f0f0f', // --yt-spec-text-primary
      secondary: '#606060', // --yt-spec-text-secondary
    },
    divider: 'rgba(0, 0, 0, 0.1)', // --yt-spec-outline
    action: {
      hover: 'rgba(0, 0, 0, 0.1)', // --yt-spec-outline
      hoverOpacity: 0.1,
    },
    background: {
      default: '#ffffff', // --yt-spec-base-background
    },
  },
})

// YouTube Dark.
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3ea6ff', // --yt-spec-themed-blue
    },
    secondary: {
      main: '#bcbcbc', // --dark-theme-secondary-color
    },
    error: {
      main: '#dd2c00', // --error-color
    },
    text: {
      primary: '#f1f1f1', // --yt-spec-text-primary
      secondary: '#aaaaaa', // --yt-spec-text-secondary
    },
    divider: 'rgba(255, 255, 255, 0.2)', // --yt-spec-outline
    action: {
      hover: 'rgba(255, 255, 255, 0.2)', // --yt-spec-outline
      hoverOpacity: 0.2,
    },
    background: {
      default: '#0f0f0f', // --yt-spec-base-background
    },
  }
})

export default theme
