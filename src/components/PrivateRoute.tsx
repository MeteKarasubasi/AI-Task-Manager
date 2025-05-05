import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // Yükleme durumunda bir loading spinner gösterilebilir
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
    return <Navigate to="/login" />;
  }

  // Kullanıcı giriş yapmışsa children'ı render et
  return <>{children}</>;
};

export default PrivateRoute; 