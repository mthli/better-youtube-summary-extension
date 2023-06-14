import { red } from '@mui/material/colors';
import { createTheme, PaletteColor, PaletteColorOptions } from '@mui/material/styles';

// https://mui.com/material-ui/customization/palette/#adding-new-colors
declare module '@mui/material/styles' {
  interface Palette {
    iconTintDefault: PaletteColor;
    iconTintActive: PaletteColor;
  }
  interface PaletteOptions {
    iconTintDefault: PaletteColorOptions;
    iconTintActive: PaletteColorOptions;
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
    iconTintDefault: {
      main: 'rgba(0, 0, 0, 0.38)',
    },
    iconTintActive: {
      main: 'rgba(0, 0, 0, 0.87)',
    },
  },
})

export default theme
