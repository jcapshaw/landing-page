import { NextRequest, NextResponse } from 'next/server';
import { auth as adminAuth } from 'firebase-admin';
import { getFirebaseAdmin } from '../../../../lib/firebase-admin';

/**
 * API endpoint to get a user's role
 * This endpoint is protected and can only be accessed by authenticated users
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
    
    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Get the user's role from the token claims
    const role = decodedToken.role || null;
    
    return NextResponse.json({ 
      uid: decodedToken.uid,
      email: decodedToken.email,
      role 
    });
  } catch (error) {
    console.error('Error getting user role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}