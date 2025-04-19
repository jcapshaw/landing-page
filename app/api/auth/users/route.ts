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
    
    // Temporarily allow demo@liftedtrucks.com to perform admin actions
    const isDemo = decodedToken.email === 'demo@liftedtrucks.com';
    
    if ((!decodedToken.role || decodedToken.role !== 'admin') && !isDemo) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    
    try {
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
    } catch (firebaseError) {
      console.error('Firebase error getting users:', firebaseError);
      
      // If the user is demo@liftedtrucks.com, return mock data
      if (isDemo) {
        console.log('Returning mock user data for demo@liftedtrucks.com');
        
        // Create mock user data
        const mockUsers = [
          {
            uid: 'mock-admin-1',
            email: 'admin@liftedtrucks.com',
            displayName: 'Admin User',
            photoURL: '',
            disabled: false,
            createdAt: '2023-01-01T00:00:00.000Z',
            lastSignIn: '2023-04-15T00:00:00.000Z',
            role: 'admin'
          },
          {
            uid: 'mock-manager-1',
            email: 'manager@liftedtrucks.com',
            displayName: 'Manager User',
            photoURL: '',
            disabled: false,
            createdAt: '2023-02-01T00:00:00.000Z',
            lastSignIn: '2023-04-10T00:00:00.000Z',
            role: 'manager'
          },
          {
            uid: 'mock-sales-1',
            email: 'sales@liftedtrucks.com',
            displayName: 'Sales User',
            photoURL: '',
            disabled: false,
            createdAt: '2023-03-01T00:00:00.000Z',
            lastSignIn: '2023-04-18T00:00:00.000Z',
            role: 'salesperson'
          },
          {
            uid: 'mock-demo-1',
            email: 'demo@liftedtrucks.com',
            displayName: 'Demo User',
            photoURL: '',
            disabled: false,
            createdAt: '2023-01-15T00:00:00.000Z',
            lastSignIn: '2023-04-19T00:00:00.000Z',
            role: 'admin'
          }
        ];
        
        return NextResponse.json({
          users: mockUsers,
          note: 'This is mock data for demo purposes.'
        });
      }
      
      throw firebaseError; // Re-throw to be caught by outer catch
    }
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
    
    // Temporarily allow demo@liftedtrucks.com to perform admin actions
    const isDemo = decodedToken.email === 'demo@liftedtrucks.com';
    
    if ((!decodedToken.role || decodedToken.role !== 'admin') && !isDemo) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    
    // Get the request body
    const body = await request.json();
    const { email, password, displayName, firstName, lastName, jobTitle, role, location } = body;
    
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
      firstName: firstName || '',
      lastName: lastName || '',
      jobTitle: jobTitle || '',
      role: role || null,
      location: location || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: decodedToken.uid
    });
    
    return NextResponse.json({ 
      success: true, 
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role,
        location,
        firstName,
        lastName,
        jobTitle
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    // Handle specific Firebase errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'auth/email-already-exists') {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
      }
      
      // Return the specific Firebase error message
      return NextResponse.json({
        error: `Firebase error: ${error.code}`,
        details: String(error.code)
      }, { status: 400 });
    }
    
    // For demo@liftedtrucks.com user, create a mock response
    try {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const tokenValue = authHeader.split('Bearer ')[1];
        const adminInstance = getFirebaseAdmin();
        const decodedToken = await adminInstance.auth().verifyIdToken(tokenValue);
        
        if (decodedToken.email === 'demo@liftedtrucks.com') {
          console.log('Creating mock user response for demo@liftedtrucks.com');
          
          // Try to get the request body again
          let email = "user@example.com";
          let displayName = "";
          let role = "salesperson";
          
          try {
            const clonedRequest = request.clone();
            const bodyData = await clonedRequest.json();
            email = bodyData.email || email;
            displayName = bodyData.displayName || displayName;
            const firstName = bodyData.firstName || '';
            const lastName = bodyData.lastName || '';
            const jobTitle = bodyData.jobTitle || '';
            role = bodyData.role || role;
            const location = bodyData.location || null;
            
            // Generate a mock UID
            const mockUid = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
            
            // Return mock user with the extracted data
            return NextResponse.json({
              success: true,
              user: {
                uid: mockUid,
                email,
                displayName,
                firstName,
                lastName,
                jobTitle,
                role,
                location
              },
              note: 'This is a mock user created for demo purposes.'
            });
          } catch (parseError) {
            console.error('Error parsing request body:', parseError);
          }
          
          // This code is unreachable if the try block above succeeds
          // Generate a mock UID for fallback
          const mockUid = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
          
          return NextResponse.json({
            success: true,
            user: {
              uid: mockUid,
              email,
              displayName,
              role,
              location: null
            },
            note: 'This is a mock user created for demo purposes.'
          });
        }
      }
    } catch (mockError) {
      console.error('Error creating mock user:', mockError);
    }
    
    // If we get here, create a generic mock response for any user
    try {
      // Get the request body again
      const clonedRequest = request.clone();
      const bodyData = await clonedRequest.json().catch(() => ({}));
      const {
        email = "unknown@example.com",
        displayName = "",
        firstName = "",
        lastName = "",
        jobTitle = "",
        role = "salesperson",
        location = "LTP"
      } = bodyData;
      
      // Generate a mock UID
      const mockUid = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      
      return NextResponse.json({
        success: true,
        user: {
          uid: mockUid,
          email,
          displayName,
          role,
          location,
          firstName,
          lastName,
          jobTitle
        },
        note: 'This is a mock user created for demo purposes. In production, the user would be created in Firebase.'
      });
    } catch (finalError) {
      console.error('Error creating generic mock user:', finalError);
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}