import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // Auth durumu yükleniyorsa bekle
  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Kullanıcı giriş yapmışsa içeriği göster
  return <>{children}</>;
};

export default PrivateRoute; 