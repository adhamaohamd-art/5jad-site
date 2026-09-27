// ============================================================
// Firebase — نفس مشروع msmath-886cf القديم
// حط بيانات المشروع الحقيقية هنا (من Firebase Console → Project settings → Your apps → SDK config)
// ============================================================
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAyAIwKoGcHNck7UQoTMX8rUEOVVBeLhqs',
  authDomain: 'msmath-886cf.firebaseapp.com',
  databaseURL: 'https://msmath-886cf-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'msmath-886cf',
  storageBucket: 'msmath-886cf.firebasestorage.app',
  messagingSenderId: '470999264365',
  appId: '1:470999264365:web:2aae7f721cd9ee421fe364',
  measurementId: 'G-FBEJVS9BKZ',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
