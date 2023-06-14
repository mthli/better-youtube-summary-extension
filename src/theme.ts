import { createTheme, PaletteColor, PaletteColorOptions } from '@mui/material/styles'

// https://mui.com/material-ui/customization/palette/#adding-new-colors
declare module '@mui/material/styles' {

  interface Palette {
    iconColorActive: PaletteColor
    iconColorDisabled: PaletteColor
    textColorPrimary: PaletteColor
    textColorSecondary: PaletteColor
  }

  interface PaletteOptions {
    iconColorActive: PaletteColorOptions
    iconColorDisabled: PaletteColorOptions
    textColorPrimary: PaletteColorOptions
    textColorSecondary: PaletteColorOptions
  }
}

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
    iconColorActive: {
      main: '#030303',
    },
    iconColorDisabled: {
      main: '#909090',
    },
    textColorPrimary: {
      main: '#030303',
    },
    textColorSecondary: {
      main: '#606060',
    },
  },
})

export default theme
