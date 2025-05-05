// Firebase yapılandırması ve servisleri
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase yapılandırması
const firebaseConfig = {
  apiKey: "AIzaSyCmw-qTfUud01IQASxGGjMasC1myN8gmqc",
  authDomain: "ai-task-manager-6b4fb.firebaseapp.com",
  projectId: "ai-task-manager-6b4fb",
  storageBucket: "ai-task-manager-6b4fb.appspot.com",
  messagingSenderId: "375124045477",
  appId: "1:375124045477:web:828d0e5e4e8e1ea385674c",
  measurementId: "G-57MREKES7H"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Servisleri başlat
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
export default app; 