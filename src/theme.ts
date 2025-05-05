import { createTheme } from '@mui/material/styles';

// Profesyonel, kullanıcı odaklı modern tema
const theme = createTheme({
  palette: {
    primary: {
      main: '#3a86ff', // Ana mavi - güven ve profesyonellik
      light: '#5cc0fc',
      dark: '#0256c2',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7209b7', // Mor - yaratıcılık ve inovasyon
      light: '#9d4eda',
      dark: '#560a8b',
      contrastText: '#ffffff',
    },
    success: {
      main: '#06d6a0', // Yeşil - başarı ve olumlu
      light: '#52f7cd',
      dark: '#048d69',
    },
    warning: {
      main: '#ffbe0b', // Amber - dikkat
      light: '#ffdb72',
      dark: '#d68e00',
    },
    error: {
      main: '#ef476f', // Kırmızı - hata
      light: '#ff7a9d',
      dark: '#cf3a5e',
    },
    info: {
      main: '#4cc9f0', // Açık mavi - bilgi
      light: '#83dff5',
      dark: '#26a0c7',
    },
    background: {
      default: '#f8f9fe', // Çok açık gri-mavi
      paper: '#ffffff',
    },
    text: {
      primary: '#2b2d42', // Koyu gri
      secondary: '#5f6273', // Orta gri
      disabled: '#a9abbe', // Açık gri
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.2rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.00714em',
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.01071em',
    },
    button: {
      fontWeight: 600,
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.02857em',
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 16, // Daha modern görünüm için daha yuvarlak köşeler
  },
  shadows: [
    'none',
    '0px 2px 8px rgba(17, 24, 39, 0.06)',
    '0px 4px 16px rgba(17, 24, 39, 0.08)',
    '0px 8px 24px rgba(17, 24, 39, 0.08)',
    '0px 12px 32px rgba(17, 24, 39, 0.08)',
    '0px 16px 48px rgba(17, 24, 39, 0.1)',
    '0px 20px 64px rgba(17, 24, 39, 0.12)',
    '0px 24px 80px rgba(17, 24, 39, 0.12)',
    '0px 28px 96px rgba(17, 24, 39, 0.14)',
    '0px 32px 80px rgba(17, 24, 39, 0.14)',
    '0px 36px 80px rgba(17, 24, 39, 0.14)',
    '0px 40px 80px rgba(17, 24, 39, 0.14)',
    '0px 44px 80px rgba(17, 24, 39, 0.14)',
    '0px 48px 80px rgba(17, 24, 39, 0.14)',
    '0px 52px 80px rgba(17, 24, 39, 0.14)',
    '0px 56px 80px rgba(17, 24, 39, 0.14)',
    '0px 60px 80px rgba(17, 24, 39, 0.14)',
    '0px 64px 80px rgba(17, 24, 39, 0.14)',
    '0px 68px 80px rgba(17, 24, 39, 0.14)',
    '0px 72px 80px rgba(17, 24, 39, 0.14)',
    '0px 76px 80px rgba(17, 24, 39, 0.14)',
    '0px 80px 80px rgba(17, 24, 39, 0.14)',
    '0px 84px 80px rgba(17, 24, 39, 0.14)',
    '0px 88px 80px rgba(17, 24, 39, 0.14)',
    '0px 92px 80px rgba(17, 24, 39, 0.14)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 16,
          padding: '12px 24px',
          boxShadow: '0px 3px 12px rgba(58, 134, 255, 0.15)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0px 6px 20px rgba(58, 134, 255, 0.2)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 8px 24px rgba(58, 134, 255, 0.3)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #3a86ff 30%, #5cc0fc 90%)',
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #7209b7 30%, #9d4eda 90%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          boxShadow: '0px 4px 24px rgba(17, 24, 39, 0.1)',
          overflow: 'visible',
          transition: 'transform 0.3s, box-shadow 0.3s',
          border: '1px solid rgba(255, 255, 255, 0.7)',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0px 12px 28px rgba(17, 24, 39, 0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 20,
        },
        elevation1: {
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          boxShadow: '0px 2px 12px rgba(17, 24, 39, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.7)',
        },
        elevation2: {
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          boxShadow: '0px 4px 20px rgba(17, 24, 39, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 16,
            transition: 'box-shadow 0.2s, border-color 0.2s',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#3a86ff',
            },
            '&.Mui-focused': {
              boxShadow: '0px 0px 0px 4px rgba(58, 134, 255, 0.15)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: 2,
                borderColor: '#3a86ff',
              },
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
          backdropFilter: 'blur(16px)',
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          boxShadow: '0px 20px 48px rgba(17, 24, 39, 0.16)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
          '&.MuiChip-colorPrimary': {
            background: 'linear-gradient(90deg, #3a86ff 0%, #5cc0fc 100%)',
          },
          '&.MuiChip-colorSecondary': {
            background: 'linear-gradient(90deg, #7209b7 0%, #9d4eda 100%)',
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(58, 134, 255, 0.05)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          minHeight: 42,
          borderRadius: 12,
          margin: '2px 6px',
          padding: '8px 12px',
          '&:hover': {
            backgroundColor: 'rgba(58, 134, 255, 0.08)',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backdropFilter: 'blur(16px)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRight: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0px 8px 24px rgba(17, 24, 39, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          boxShadow: '0px 2px 12px rgba(17, 24, 39, 0.06)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.7)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            color: '#3a86ff',
            opacity: 1,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.1)',
            backgroundColor: 'rgba(58, 134, 255, 0.08)',
          },
        },
      },
    },
  },
});

export default theme; 