import { createTheme } from '@mui/material/styles'

// YouTube Light.
const theme = createTheme({
  palette: {
    primary: {
      main: '#c5cae9',
    },
    secondary: {
      main: '#737373',
    },
    error: {
      main: '#dd2c00',
    },
    text: {
      primary: '#030303',
      secondary: '#606060',
    },
    divider: 'rgba(0, 0, 0, 0.1)',
    background: {
      default: '#ffffff',
    }
  },
})

export default theme
