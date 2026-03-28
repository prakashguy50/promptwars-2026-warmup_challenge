import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Import the Firebase configuration
import firebaseConfig from '../../firebase-applet-config.json';

// Check if Firebase has been configured with real keys
const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_API_KEY';

// Initialize Firebase SDK only if configured
export const app = isConfigured && getApps().length === 0 ? initializeApp(firebaseConfig) : (getApps().length > 0 ? getApps()[0] : null);
export const db = app ? getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)') : null;
export const auth = app ? getAuth(app) : null;

/**
 * Sign in anonymously for quick reporting
 * @returns {Promise<any>}
 * @throws {Error} If Firebase is not configured
 */
export const signInAnonymous = async () => {
  if (!auth) {
    throw new Error('Firebase is not configured. Please update firebase-applet-config.json with your credentials.');
  }
  return await signInAnonymously(auth);
};

/**
 * Sign in with Google for responders
 * @returns {Promise<any>}
 */
export const signInGoogle = async () => {
  if (!auth) throw new Error('Firebase is not configured. Please update firebase-applet-config.json with your credentials.');
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
};
