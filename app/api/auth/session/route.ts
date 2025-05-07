import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    // Try to get token from request body
    let token: string | undefined;
    
    try {
      const body = await request.json();
      token = body.token;
    } catch (e) {
      // If parsing JSON fails, check for Authorization header
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify the token with Supabase
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !data.user) {
      console.error('Invalid token:', error);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Create a response
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );

    // Set the session cookie that will be accessible to the middleware
    response.cookies.set({
      name: 'session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 5, // 5 days
      path: '/',
      sameSite: 'lax', // Changed from strict to lax for better compatibility
    });

    return response;
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { error: 'Failed to set session' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Check if the cookie already doesn't exist to prevent loops
  const sessionCookie = request.cookies.get('session');
  
  if (!sessionCookie || !sessionCookie.value) {
    return NextResponse.json(
      { success: true, message: 'Session already cleared' },
      { status: 200 }
    );
  }
  
  const response = NextResponse.json(
    { success: true },
    { status: 200 }
  );

  // Clear the session cookie
  response.cookies.set({
    name: 'session',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
  });

  return response;
}

// Handle GET requests to check authentication status
export async function GET(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  
  if (token) {
    // Verify the token with Supabase
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data.user) {
        return NextResponse.json({ authenticated: false });
      }
      return NextResponse.json({ authenticated: true, user: data.user });
    } catch (error) {
      console.error('Error verifying token:', error);
      return NextResponse.json({ authenticated: false });
    }
  } else {
    return NextResponse.json({ authenticated: false });
  }
}