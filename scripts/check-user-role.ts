// Script to check a user's current role
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// Path to the service account file
const serviceAccountPath = path.resolve(__dirname, '../firebase-service-account.json');

// Initialize Firebase Admin SDK
try {
  // Check if the service account file exists
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(`Service account file not found at ${serviceAccountPath}`);
  }
  
  // Load the service account file
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1);
}

// Function to find a user by email
async function getUserByEmail(email: string): Promise<admin.auth.UserRecord | null> {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    return userRecord;
  } catch (error) {
    console.error(`Error fetching user with email ${email}:`, error);
    return null;
  }
}

// Function to check a user's role
async function checkUserRole(uid: string): Promise<string | null> {
  try {
    // Get the user's custom claims
    const userRecord = await admin.auth().getUser(uid);
    const customClaims = userRecord.customClaims || {};
    
    // Get the user document from Firestore
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    const userData = userDoc.exists ? userDoc.data() : null;
    
    console.log('User details:');
    console.log('- Email:', userRecord.email);
    console.log('- Display Name:', userRecord.displayName || 'Not set');
    console.log('- UID:', userRecord.uid);
    console.log('- Email Verified:', userRecord.emailVerified);
    console.log('- Disabled:', userRecord.disabled);
    console.log('- Created At:', new Date(userRecord.metadata.creationTime).toLocaleString());
    console.log('- Last Sign In:', userRecord.metadata.lastSignInTime 
      ? new Date(userRecord.metadata.lastSignInTime).toLocaleString() 
      : 'Never');
    
    console.log('\nRole information:');
    console.log('- Role from Custom Claims:', customClaims.role || 'No role set in custom claims');
    console.log('- Role from Firestore:', userData?.role || 'No role set in Firestore');
    
    return customClaims.role || null;
  } catch (error) {
    console.error(`Error checking role for user ${uid}:`, error);
    return null;
  }
}

// Main function
async function main(): Promise<void> {
  // Get email from command line arguments or use default
  const targetEmail = process.argv[2] || 'demo@liftedtrucks.com';
  
  console.log(`Looking for user with email: ${targetEmail}`);
  const user = await getUserByEmail(targetEmail);
  
  if (!user) {
    console.error(`User with email ${targetEmail} not found`);
    process.exit(1);
  }
  
  console.log(`User found: ${user.uid}`);
  await checkUserRole(user.uid);
  
  // Exit the process
  process.exit(0);
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});