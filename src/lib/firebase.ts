// Firebase Configuration and Initialization
// ⚠️ IMPORTANT: Never commit this file with real credentials!
// This file uses environment variables from .env.local

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate configuration
const validateConfig = () => {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];

  const missing = required.filter(key => !import.meta.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase configuration: ${missing.join(', ')}\n` +
      'Please check your .env.local file. See FIREBASE_SETUP_GUIDE.md for setup instructions.'
    );
  }
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  validateConfig();
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  console.log('✅ Firebase initialized successfully');
  console.log('📦 Project ID:', firebaseConfig.projectId);
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

// Export initialized services
export { app, auth, db, storage };

// Export configuration (without sensitive data)
export const getFirebaseConfig = () => ({
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  storageBucket: firebaseConfig.storageBucket,
});

// Connection test utility
export const testFirebaseConnection = async () => {
  try {
    // Test 1: Check if Firebase is initialized
    if (!app) throw new Error('Firebase app not initialized');
    console.log('✅ Test 1: Firebase app initialized');

    // Test 2: Check Auth
    if (!auth) throw new Error('Firebase Auth not initialized');
    console.log('✅ Test 2: Firebase Auth ready');

    // Test 3: Check Firestore
    if (!db) throw new Error('Firestore not initialized');
    console.log('✅ Test 3: Firestore ready');

    // Test 4: Check Storage
    if (!storage) throw new Error('Storage not initialized');
    console.log('✅ Test 4: Storage ready');

    return {
      success: true,
      services: {
        app: !!app,
        auth: !!auth,
        firestore: !!db,
        storage: !!storage,
      },
      config: getFirebaseConfig(),
    };
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Error handler utility
export const handleFirebaseError = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const firebaseError = error as { code: string; message: string };
    
    // User-friendly error messages
    const errorMessages: Record<string, string> = {
      'auth/email-already-in-use': 'This email is already registered',
      'auth/invalid-email': 'Invalid email address',
      'auth/operation-not-allowed': 'Operation not allowed',
      'auth/weak-password': 'Password is too weak',
      'auth/user-disabled': 'This account has been disabled',
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/network-request-failed': 'Network error. Please check your connection',
      'permission-denied': 'Permission denied. Please check your account',
      'unavailable': 'Service temporarily unavailable',
      'unauthenticated': 'Please sign in to continue',
    };

    return errorMessages[firebaseError.code] || firebaseError.message;
  }

  return 'An unexpected error occurred';
};

// Development mode helpers
if (import.meta.env.DEV) {
  // Log configuration in development (without sensitive data)
  console.log('🔧 Firebase Configuration:', getFirebaseConfig());
  
  // Add global test function for development
  (window as any).testFirebase = testFirebaseConnection;
  console.log('💡 Tip: Run window.testFirebase() in console to test connection');
}
