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

if (typeof window !== 'undefined') {
  try {
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
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log('Firebase persistence set to local');
        // Set up auth state listener for debugging
        if (auth) {
          onAuthStateChanged(auth, (user: User | null) => {
            console.log('Auth state changed:', user ? `User logged in: ${user.email}` : 'No user');
            if (user) {
              // Get and set the session token
              user.getIdToken().then((token: string) => {
                document.cookie = `session=${token}; path=/; max-age=${60 * 60 * 24 * 5}`; // 5 days
              });
            } else {
              // Clear the session token
              document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            }
          });
        }
      })
      .catch((error: Error) => {
        console.error("Auth persistence error:", error);
      });
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
}

export { auth, db, firebaseApp as default };