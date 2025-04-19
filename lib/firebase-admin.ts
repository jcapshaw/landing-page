import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
export function getFirebaseAdmin() {
  if (admin.apps.length === 0) {
    try {
      // Try to load service account from environment variables first
      if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
        const serviceAccount = JSON.parse(
          Buffer.from(process.env.FIREBASE_ADMIN_CREDENTIALS, 'base64').toString()
        );
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: process.env.FIREBASE_DATABASE_URL,
        });
      } 
      // Fall back to service account file if environment variable is not set
      else {
        try {
          // Try to load from service account file
          const serviceAccount = require('../firebase-service-account.json');
          
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.FIREBASE_DATABASE_URL,
          });
        } catch (error) {
          console.error('Error loading service account file:', error);
          throw new Error('Firebase Admin SDK initialization failed: Service account not found');
        }
      }
      
      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase Admin SDK:', error);
      throw new Error('Firebase Admin SDK initialization failed');
    }
  }
  
  return admin;
}

// Helper function to get Firestore instance
export function getFirestore() {
  return getFirebaseAdmin().firestore();
}

// Helper function to get Auth instance
export function getAuth() {
  return getFirebaseAdmin().auth();
}