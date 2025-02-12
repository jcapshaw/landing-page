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

const firebaseConfig = {
  apiKey: "AIzaSyDkDSF9Dq50j8LnxENgYyjeXv6edfTtwu0",
  authDomain: "liftedtrucks-7d7c6.firebaseapp.com",
  projectId: "liftedtrucks-7d7c6",
  storageBucket: "liftedtrucks-7d7c6.firebasestorage.app",
  messagingSenderId: "157523753930",
  appId: "1:157523753930:web:3fdcdfdf233521b7b6ed33"
};

// Initialize Firebase
let firebaseApp: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

// Initialize Firebase only once
if (!getApps().length) {
  console.log('Initializing new Firebase app');
  firebaseApp = initializeApp(firebaseConfig);
} else {
  console.log('Using existing Firebase app');
  firebaseApp = getApps()[0];
}

auth = getAuth(firebaseApp);
db = getFirestore(firebaseApp);

// Set persistence to local (5 days)
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('Firebase persistence set to local');
    })
    .catch((error: Error) => {
      console.error("Auth persistence error:", error);
    });
}

export { auth, db, firebaseApp as default };