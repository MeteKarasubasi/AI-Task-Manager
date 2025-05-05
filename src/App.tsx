import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, Box, Text } from '@chakra-ui/react';
import Layout from './components/layout/Layout';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ProfilePage from './components/profile/ProfilePage';
import PrivateRoute from './components/auth/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import theme from './theme';

const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
                <LoginForm />
              </Box>
            } />
            <Route path="/register" element={
              <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
                <RegisterForm />
              </Box>
            } />
            <Route path="/forgot-password" element={
              <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
                <ForgotPasswordForm />
              </Box>
            } />

            {/* Protected Routes */}
            <Route path="/" element={
              <PrivateRoute>
                <Navigate to="/dashboard" replace />
              </PrivateRoute>
            } />
            
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Text>Dashboard (Yapım aşamasında)</Text>
              </PrivateRoute>
            } />

            <Route path="/profile" element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            } />

            {/* 404 - Catch All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </ChakraProvider>
  );
};

export default App; 