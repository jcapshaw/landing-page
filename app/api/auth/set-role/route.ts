import { NextRequest, NextResponse } from 'next/server';
import { auth as adminAuth } from 'firebase-admin';
import { getFirebaseAdmin } from '../../../../lib/firebase-admin';

/**
 * API endpoint to set a user's role
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
    
    // Temporarily allow demo@liftedtrucks.com to perform admin actions
    const isDemo = decodedToken.email === 'demo@liftedtrucks.com';
    
    if ((!decodedToken.role || decodedToken.role !== 'admin') && !isDemo) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    
    // Get the request body
    const body = await request.json();
    const { userId, role } = body;
    
    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing required fields: userId, role' }, { status: 400 });
    }
    
    // Validate the role
    if (!['admin', 'manager', 'salesperson'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be one of: admin, manager, salesperson' }, { status: 400 });
    }
    
    // Set the custom claim for the user
    await admin.auth().setCustomUserClaims(userId, { role });
    
    // Also update the user document in Firestore
    await admin.firestore().collection('users').doc(userId).set({
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: decodedToken.uid
    }, { merge: true });
    
    return NextResponse.json({ success: true, message: `Role ${role} assigned to user ${userId}` });
  } catch (error) {
    console.error('Error setting user role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}