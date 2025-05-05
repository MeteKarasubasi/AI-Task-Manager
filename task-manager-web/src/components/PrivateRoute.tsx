import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// PrivateRoute bileşeni props tipi
interface PrivateRouteProps {
  children: React.ReactNode;
}

// Özel rotaları koruyan bileşen
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // Kullanıcı durumu yükleniyorsa bekle
  if (loading) {
    return <div>Loading...</div>;
  }

  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Kullanıcı giriş yapmışsa içeriği göster
  return <>{children}</>;
};

export default PrivateRoute; 