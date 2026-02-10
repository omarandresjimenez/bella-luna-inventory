import { createTheme, alpha } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: 'hsl(222, 47%, 13%)', // Deep Obsidian
      light: 'hsl(222, 47%, 25%)',
      dark: 'hsl(222, 47%, 5%)',
      contrastText: 'hsl(0, 0%, 100%)',
    },
    secondary: {
      main: 'hsl(14, 46%, 66%)', // Rose Gold / Champagne
      light: 'hsl(14, 46%, 75%)',
      dark: 'hsl(14, 46%, 55%)',
      contrastText: 'hsl(0, 0%, 100%)',
    },
    background: {
      default: 'hsl(210, 40%, 99%)', // Silk White
      paper: 'hsl(0, 0%, 100%)',
    },
    text: {
      primary: 'hsl(222, 47%, 11%)',
      secondary: 'hsl(215, 16%, 47%)',
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", sans-serif',
    h1: {
      fontFamily: '"Cormorant Garamond", serif',
      fontWeight: 600,
      letterSpacing: '-0.03em',
      fontSize: '4.5rem'
    },
    h2: {
      fontFamily: '"Cormorant Garamond", serif',
      fontWeight: 600,
      letterSpacing: '-0.02em',
      fontSize: '3.5rem'
    },
    h3: {
      fontFamily: '"Cormorant Garamond", serif',
      fontWeight: 600,
      fontSize: '2.5rem'
    },
    h4: {
      fontFamily: '"Cormorant Garamond", serif',
      fontWeight: 600,
      fontSize: '2rem'
    },
    h5: { fontWeight: 500, letterSpacing: '0.02em' },
    h6: { fontWeight: 600 },
    button: {
      textTransform: 'uppercase',
      fontWeight: 500,
      letterSpacing: '0.1em',
    },
  },
  shape: {
    borderRadius: 24,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '14px 32px',
          boxShadow: 'none',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 24px hsla(14, 46%, 66%, 0.3)',
            transform: 'translateY(-2px)',
          },
        },
        containedPrimary: {
          background: 'hsl(222, 47%, 13%)',
          '&:hover': {
            background: 'hsl(222, 47%, 20%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, hsl(14, 46%, 66%) 0%, hsl(14, 46%, 55%) 100%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: 'none',
          boxShadow: '0 4px 20px hsla(222, 47%, 11%, 0.04)',
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
          '&:hover': {
            boxShadow: '0 20px 40px hsla(222, 47%, 11%, 0.08)',
            transform: 'translateY(-8px)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha('hsl(0, 0%, 100%)', 0.75),
          backdropFilter: 'blur(20px) saturate(180%)',
          color: 'hsl(222, 47%, 11%)',
          boxShadow: 'none',
          borderBottom: '1px solid hsla(222, 47%, 11%, 0.05)',
        },
      },
    },
  },
});

export default theme;
