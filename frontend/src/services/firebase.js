import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDJ6o7JWF96J96GxCCFDe_6w7EOjZPpq88',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'national-auto-garage-01.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'national-auto-garage-01',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'national-auto-garage-01.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '949463542172',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:949463542172:web:1ee64b7f647577c8e5c059',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-D4XZ9ZPGBV',
};

// 1. Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// 2. Initialize Cloud Firestore with Intelligent Multi-Tab Offline Cache (Zero Quota Waste!)
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch (e) {
  firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;

// 3. Initialize Firebase Authentication
export const auth = getAuth(app);
