import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase yapılandırma bilgileri
const firebaseConfig = {
  apiKey: "AIzaSyCmw-qTfUud01IQASxGGjMasC1myN8gmqc",
  authDomain: "ai-task-manager-6b4fb.firebaseapp.com",
  projectId: "ai-task-manager-6b4fb",
  storageBucket: "ai-task-manager-6b4fb.appspot.com",
  messagingSenderId: "375124045477",
  appId: "1:375124045477:web:828d0e5e4e8e1ea385674c",
  measurementId: "G-57MREKES7H"
};

// Firebase uygulamasını başlatma
const app = initializeApp(firebaseConfig);

// Auth, Firestore ve Analytics servislerini export etme
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app; 