import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { backendEnv } from '@lib/env-server';

// Initialize Firebase only if all required env vars are available
const firebaseConfig = {
  appId: backendEnv.APP_ID || 'dummy-app-id',
  apiKey: backendEnv.API_KEY || 'dummy-api-key',
  projectId: backendEnv.PROJECT_ID || 'dummy-project',
  authDomain: backendEnv.AUTH_DOMAIN || 'dummy.firebaseapp.com',
  storageBucket: backendEnv.STORAGE_BUCKET || 'dummy.appspot.com',
  messagingSenderId: backendEnv.MESSAGING_SENDER_ID || '123456789'
};

let app;
let db: Firestore | null = null;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.warn('Firebase initialization failed:', error);
  // Create a mock db for development
  db = null;
}

export { db };
