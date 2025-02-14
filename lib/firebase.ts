import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  Auth,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDkDSF9Dq50j8LnxENgYyjeXv6edfTtwu0",
  authDomain: "liftedtrucks-7d7c6.firebaseapp.com",
  projectId: "liftedtrucks-7d7c6",
  storageBucket: "liftedtrucks-7d7c6.firebasestorage.app",
  messagingSenderId: "157523753930",
  appId: "1:157523753930:web:3fdcdfdf233521b7b6ed33"
};

// Initialize Firebase
const getFirebaseApp = () => {
  if (!getApps().length) {
    console.log('Initializing new Firebase app');
    return initializeApp(firebaseConfig);
  }
  console.log('Using existing Firebase app');
  return getApps()[0];
};
const firebaseApp = getFirebaseApp();
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

// Set persistence to local (5 days) only on client side
// Set persistence to local (5 days) only on client side
if (typeof window !== 'undefined') {
  // Wrap in try-catch for better error handling
  (async () => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      console.log('Firebase persistence set to local');
    } catch (error) {
      console.error("Auth persistence error:", error);
    }
  })();
}

export { auth, db, storage };
export default firebaseApp;