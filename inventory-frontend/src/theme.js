import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#D2691E', // warm brown-orange
    },
    secondary: {
      main: '#FFD700', // warm gold
    },
    background: {
      default: '#FFF8F0', // light cream
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

export default theme;
