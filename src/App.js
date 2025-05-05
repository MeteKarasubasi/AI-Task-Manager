import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, alpha } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import Meetings from './pages/Meetings';
import Navbar from './components/Navbar';
import theme from './theme';

function App() {
  const { currentUser } = useAuth();

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <Box 
          className="app-container" 
          sx={{ 
            minHeight: '100vh', 
            bgcolor: 'background.default',
            background: currentUser 
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.03)} 0%, ${alpha(theme.palette.background.default, 1)} 100%)`
              : 'background.default',
            backgroundSize: '100% 100%',
            backgroundAttachment: 'fixed'
          }}
        >
          {currentUser && <Navbar />}
          <Box 
            component="main" 
            sx={{ 
              pt: currentUser ? 2 : 0, 
              pb: 4,
              px: { xs: 2, sm: 3, md: 4 },
              maxWidth: '1600px',
              mx: 'auto',
              minHeight: currentUser ? 'calc(100vh - 64px)' : '100vh',
              position: 'relative',
            }}
          >
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <PrivateRoute>
                    <Tasks />
                  </PrivateRoute>
                }
              />
              <Route
                path="/meetings"
                element={
                  <PrivateRoute>
                    <Meetings />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Box>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App; 