import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, useMediaQuery } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import { useEffect, useMemo, useState } from 'react';

function usePreferredMode() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const stored = typeof window !== 'undefined' ? window.localStorage.getItem('bugbase-theme') : null;
  return stored === 'light' || stored === 'dark' ? stored : (prefersDark ? 'dark' : 'light');
}

function makeTheme(mode) {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: { main: '#2563eb' },
      secondary: { main: '#7c3aed' },
      background: isDark
        ? { default: '#0b1020', paper: '#0f172a' }
        : { default: '#f7f7fb', paper: '#ffffff' },
      divider: isDark ? '#1f2937' : '#e5e7eb',
      text: isDark
        ? { primary: '#e5e7eb', secondary: '#9ca3af' }
        : { primary: '#111827', secondary: '#4b5563' },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: isDark
              ? 'radial-gradient(ellipse at top, rgba(37,99,235,0.08), transparent 60%), radial-gradient(ellipse at bottom, rgba(124,58,237,0.08), transparent 60%)'
              : 'radial-gradient(ellipse at top, rgba(37, 99, 235, 0.06), transparent 60%), radial-gradient(ellipse at bottom, rgba(124, 58, 237, 0.05), transparent 60%)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#0b1220' : '#111827',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
            borderRight: `1px solid ${isDark ? '#1f2937' : '#e5e7eb'}`,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '2px 8px',
            '&.Mui-selected': {
              backgroundColor: isDark ? 'rgba(37,99,235,0.18)' : 'rgba(37, 99, 235, 0.10)',
            },
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { borderRadius: 10 } },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            boxShadow: isDark
              ? '0 1px 2px rgba(0,0,0,0.35), 0 6px 20px rgba(0,0,0,0.25)'
              : '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
          },
        },
      },
    },
  });
}

function App() {
  const preferred = usePreferredMode();
  const [mode, setMode] = useState(preferred);
  const theme = useMemo(() => makeTheme(mode), [mode]);

  useEffect(() => {
    document.body.dataset.theme = mode;
    try { window.localStorage.setItem('bugbase-theme', mode); } catch {}
  }, [mode]);

  const toggleMode = () => setMode((m) => (m === 'light' ? 'dark' : 'light'));

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Layout mode={mode} onToggleMode={toggleMode} />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
