import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '../../../../lib/firebase-admin';

/**
 * API endpoint to get all users
 * This endpoint is protected and can only be accessed by admins
 */
export async function GET(request: NextRequest) {
  try {
    // Initialize Firebase Admin if not already initialized
    const admin = getFirebaseAdmin();
    
    // Get the authorization token from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token and check if the user is an admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (!decodedToken.role || decodedToken.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    
    // Get all users from Firebase Auth
    const listUsersResult = await admin.auth().listUsers();
    const users = [];
    
    // For each user, get their role from Firestore if available
    const db = admin.firestore();
    const usersCollection = db.collection('users');
    
    for (const userRecord of listUsersResult.users) {
      const { uid, email, displayName, photoURL, disabled, metadata } = userRecord;
      
      // Get user data from Firestore
      const userDoc = await usersCollection.doc(uid).get();
      const userData = userDoc.exists ? userDoc.data() : {};
      
      // Combine Auth and Firestore data
      users.push({
        uid,
        email: email || '',
        displayName: displayName || '',
        photoURL: photoURL || '',
        disabled,
        createdAt: metadata.creationTime,
        lastSignIn: metadata.lastSignInTime,
        role: userRecord.customClaims?.role || userData?.role || null,
        // Include other Firestore data if needed
        ...userData,
      });
    }
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error getting users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * API endpoint to create a new user
 * This endpoint is protected and can only be accessed by admins
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize Firebase Admin if not already initialized
    const admin = getFirebaseAdmin();
    
    // Get the authorization token from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token and check if the user is an admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (!decodedToken.role || decodedToken.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    
    // Get the request body
    const body = await request.json();
    const { email, password, displayName, role } = body;
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing required fields: email, password' }, { status: 400 });
    }
    
    // Create the user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: displayName || '',
    });
    
    // Set custom claims if role is provided
    if (role) {
      // Validate the role
      if (!['admin', 'manager', 'salesperson'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role. Must be one of: admin, manager, salesperson' }, { status: 400 });
      }
      
      await admin.auth().setCustomUserClaims(userRecord.uid, { role });
    }
    
    // Create user document in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email,
      displayName: displayName || '',
      role: role || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: decodedToken.uid
    });
    
    return NextResponse.json({ 
      success: true, 
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle specific Firebase errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/email-already-exists') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}