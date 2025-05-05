import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase yapılandırma bilgileri
const firebaseConfig = {
  apiKey: "AIzaSyBNMR1lATnTEzUY12ZFB19uxPP-Ui6n4fI",
  authDomain: "task-manager-98bd7.firebaseapp.com",
  projectId: "task-manager-98bd7",
  storageBucket: "task-manager-98bd7.firebasestorage.app",
  messagingSenderId: "710865734025",
  appId: "1:710865734025:web:ef10d955f08ad83fa17958",
  measurementId: "G-P4101M81C0"
};

// Firebase uygulamasını başlat
let app;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Auth servisi
const auth = getAuth(app);

// Firestore veritabanı
const db = getFirestore(app);

// Firebase depolama
const storage = getStorage(app);

// Auth metotlarını dışa aktar 
export { 
  app, 
  auth, 
  db, 
  storage, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
}; 