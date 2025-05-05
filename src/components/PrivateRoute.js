import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Özel yönlendirme bileşeni
function PrivateRoute({ children }) {
  const { currentUser } = useAuth();

  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  return currentUser ? children : <Navigate to="/login" />;
}

export default PrivateRoute; 