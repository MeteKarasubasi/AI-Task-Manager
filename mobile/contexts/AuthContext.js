import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  subscribeToAuthChanges, 
  getCurrentUser,
  sendPasswordReset
} from '../services/authService';

// Context oluşturma
export const AuthContext = createContext();

// Context hook'u
export const useAuth = () => useContext(AuthContext);

// AuthProvider bileşeni
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Firebase auth durumunu dinle
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Temizlik fonksiyonu
    return () => unsubscribe();
  }, []);

  // Register fonksiyonu
  const register = async (email, password, displayName) => {
    setError(null);
    try {
      const user = await registerUser(email, password, displayName);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Login fonksiyonu
  const login = async (email, password) => {
    setError(null);
    try {
      const user = await loginUser(email, password);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout fonksiyonu
  const logout = async () => {
    setError(null);
    try {
      await logoutUser();
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Şifre sıfırlama
  const resetPassword = async (email) => {
    setError(null);
    try {
      await sendPasswordReset(email);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Auth durumunu kontrol etme
  const checkAuth = () => {
    return !!currentUser;
  };

  // Context değerleri
  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    resetPassword,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 