import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '../../../../../lib/firebase-admin';

/**
 * API endpoint to get a specific user
 * This endpoint is protected and can only be accessed by admins
 */
export async function GET(
  request: NextRequest,
  context: { params: { userId: string } }
) {
  const { params } = context;
  try {
    const userId = params.userId;
    
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
    
    // Temporarily allow demo@liftedtrucks.com to perform admin actions
    const isDemo = decodedToken.email === 'demo@liftedtrucks.com';
    
    if ((!decodedToken.role || decodedToken.role !== 'admin') && !isDemo) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    
    // Get user from Firebase Auth
    const userRecord = await admin.auth().getUser(userId);
    
    // Get user data from Firestore
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    
    // Combine Auth and Firestore data
    const user = {
      uid: userRecord.uid,
      email: userRecord.email || '',
      displayName: userRecord.displayName || '',
      photoURL: userRecord.photoURL || '',
      disabled: userRecord.disabled,
      createdAt: userRecord.metadata.creationTime,
      lastSignIn: userRecord.metadata.lastSignInTime,
      role: userRecord.customClaims?.role || userData?.role || null,
      // Include other Firestore data if needed
      ...userData,
    };
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error getting user:', error);
    
    // Handle specific Firebase errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/user-not-found') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * API endpoint to update a specific user
 * This endpoint is protected and can only be accessed by admins
 */
export async function PATCH(
  request: NextRequest,
  context: { params: { userId: string } }
) {
  const { params } = context;
  try {
    const userId = params.userId;
    
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
    
    // Temporarily allow demo@liftedtrucks.com to perform admin actions
    const isDemo = decodedToken.email === 'demo@liftedtrucks.com';
    
    if ((!decodedToken.role || decodedToken.role !== 'admin') && !isDemo) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    
    // Get the request body
    const body = await request.json();
    const { displayName, email, password, firstName, lastName, jobTitle, role, disabled, location } = body;
    
    // Update user in Firebase Auth
    const updateParams: any = {};
    
    if (displayName !== undefined) updateParams.displayName = displayName;
    if (email !== undefined) updateParams.email = email;
    if (password !== undefined) updateParams.password = password;
    if (disabled !== undefined) updateParams.disabled = disabled;
    
    // Only update if there are changes
    if (Object.keys(updateParams).length > 0) {
      await admin.auth().updateUser(userId, updateParams);
    }
    
    // Update custom claims if role is provided
    if (role !== undefined) {
      // Validate the role
      if (role !== null && !['admin', 'manager', 'salesperson'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role. Must be one of: admin, manager, salesperson' }, { status: 400 });
      }
      
      // Set or clear custom claims based on role
      if (role === null) {
        await admin.auth().setCustomUserClaims(userId, {});
      } else {
        await admin.auth().setCustomUserClaims(userId, { role });
      }
    }
    
    // Update user document in Firestore
    const firestoreUpdateData: any = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: decodedToken.uid
    };
    
    if (displayName !== undefined) firestoreUpdateData.displayName = displayName;
    if (email !== undefined) firestoreUpdateData.email = email;
    if (firstName !== undefined) firestoreUpdateData.firstName = firstName;
    if (lastName !== undefined) firestoreUpdateData.lastName = lastName;
    if (jobTitle !== undefined) firestoreUpdateData.jobTitle = jobTitle;
    if (role !== undefined) firestoreUpdateData.role = role;
    if (disabled !== undefined) firestoreUpdateData.disabled = disabled;
    if (location !== undefined) firestoreUpdateData.location = location;
    
    await admin.firestore().collection('users').doc(userId).set(firestoreUpdateData, { merge: true });
    
    return NextResponse.json({ 
      success: true, 
      message: `User ${userId} updated successfully` 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    
    // Handle specific Firebase errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'auth/user-not-found') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      if (error.code === 'auth/email-already-exists') {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
      }
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * API endpoint to delete a specific user
 * This endpoint is protected and can only be accessed by admins
 */
export async function DELETE(
  request: NextRequest,
  context: { params: { userId: string } }
) {
  const { params } = context;
  try {
    const userId = params.userId;
    
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
    
    // Temporarily allow demo@liftedtrucks.com to perform admin actions
    const isDemo = decodedToken.email === 'demo@liftedtrucks.com';
    
    if ((!decodedToken.role || decodedToken.role !== 'admin') && !isDemo) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    
    // Delete user from Firebase Auth
    await admin.auth().deleteUser(userId);
    
    // Delete user document from Firestore
    await admin.firestore().collection('users').doc(userId).delete();
    
    return NextResponse.json({ 
      success: true, 
      message: `User ${userId} deleted successfully` 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    
    // Handle specific Firebase errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/user-not-found') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}