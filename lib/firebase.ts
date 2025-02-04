import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDkDSF9Dq50j8LnxENgYyjeXv6edfTtwu0",
  authDomain: "liftedtrucks-7d7c6.firebaseapp.com",
  projectId: "liftedtrucks-7d7c6",
  storageBucket: "liftedtrucks-7d7c6.firebasestorage.app",
  messagingSenderId: "157523753930",
  appId: "1:157523753930:web:3fdcdfdf233521b7b6ed33"
};

// Initialize Firebase
let firebase_app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(firebase_app);

// Set persistence to local (5 days)
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
      console.error("Auth persistence error:", error);
    });
}

export default firebase_app;