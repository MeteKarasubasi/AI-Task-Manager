import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Auth context oluşturulması
const AuthContext = createContext();

// Custom hook - Auth context'e kolay erişim için
export function useAuth() {
  return useContext(AuthContext);
}

// Auth Provider bileşeni
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const auth = getAuth();

  // Kullanıcı kaydı fonksiyonu
  async function signup(email, password, displayName) {
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Firestore'da kullanıcı profili oluşturma
      await setDoc(doc(db, 'users', user.uid), {
        email,
        displayName: displayName || email.split('@')[0],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        photoURL: user.photoURL || '',
        tasks: [],
        meetings: []
      });

      return user;
    } catch (error) {
      console.error('Kayıt hatası:', error);
      setError(error.message);
      throw error;
    }
  }

  // Email/şifre ile giriş
  async function login(email, password) {
    setError('');
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Kullanıcının son giriş tarihini güncelle
      if (result.user) {
        await setDoc(doc(db, 'users', result.user.uid), 
          { lastLogin: new Date().toISOString() }, 
          { merge: true }
        );
      }
      return result;
    } catch (error) {
      console.error('Giriş hatası:', error);
      setError(error.message);
      throw error;
    }
  }

  // Google ile giriş
  async function googleLogin() {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Kullanıcı profilini kontrol et, yoksa oluştur
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          photoURL: user.photoURL || '',
          tasks: [],
          meetings: []
        });
      } else {
        // Son giriş tarihini güncelle
        await setDoc(doc(db, 'users', user.uid), 
          { lastLogin: new Date().toISOString() }, 
          { merge: true }
        );
      }

      return user;
    } catch (error) {
      console.error('Google ile giriş hatası:', error);
      setError(error.message);
      throw error;
    }
  }

  // Çıkış yapma
  async function logout() {
    setError('');
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Çıkış hatası:', error);
      setError(error.message);
      throw error;
    }
  }

  // Kullanıcı durumu değişikliklerini dinleme
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  const value = {
    currentUser,
    signup,
    login,
    googleLogin,
    logout,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 