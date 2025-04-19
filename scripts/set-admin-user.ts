// Script to set a user as admin (TypeScript version)
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

// Function to set a user as admin
async function setUserAsAdmin(uid: string): Promise<boolean> {
  try {
    // Set custom claims
    await admin.auth().setCustomUserClaims(uid, { role: 'admin' });
    
    // Update the user document in Firestore
    await admin.firestore().collection('users').doc(uid).set({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: 'system-script'
    }, { merge: true });
    
    console.log(`User ${uid} has been successfully set as admin`);
    return true;
  } catch (error) {
    console.error(`Error setting user ${uid} as admin:`, error);
    return false;
  }
}

// Main function
async function main(): Promise<void> {
  const targetEmail = 'demo@liftedtrucks.com';
  
  console.log(`Looking for user with email: ${targetEmail}`);
  const user = await getUserByEmail(targetEmail);
  
  if (!user) {
    console.error(`User with email ${targetEmail} not found`);
    process.exit(1);
  }
  
  console.log(`User found: ${user.uid}`);
  const success = await setUserAsAdmin(user.uid);
  
  if (success) {
    console.log(`✅ Successfully set ${targetEmail} as admin`);
  } else {
    console.error(`❌ Failed to set ${targetEmail} as admin`);
  }
  
  // Exit the process
  process.exit(success ? 0 : 1);
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});