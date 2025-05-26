import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add static asset paths to be excluded from auth check
const PUBLIC_FILE = /\.(.*)$/;

// This middleware works with Supabase authentication
// It checks for authentication tokens in cookies, headers, and URL parameters

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Skip middleware for static files and api routes
  if (
    PUBLIC_FILE.test(path) || // Skip files with extensions (.jpg, .png, etc)
    path.startsWith('/_next') || // Skip Next.js internals
    path.startsWith('/api') || // Skip API routes
    path.includes('/favicon.') // Skip favicon
  ) {
    return NextResponse.next();
  }

  // Development bypass removed - using normal authentication

  // Define public paths that don't require authentication
  const isPublicPath = path === '/' || path === '/auth' || path.includes('/auth?');

  // Check for authentication in multiple places
  // 1. First check cookies
  let token = request.cookies.get('session')?.value;
  
  // 2. Then check Authorization header (used by our client-side code)
  if (!token) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  
  // 3. Finally check for a token in the URL (for initial auth)
  if (!token && !isPublicPath) {
    const url = new URL(request.url);
    token = url.searchParams.get('token') ?? undefined;
  }
  
  // Log for debugging
  console.log('Middleware:', {
    path,
    isPublicPath,
    hasToken: !!token,
    cookieNames: Array.from(request.cookies.getAll()).map(c => c.name),
    tokenLength: token ? token.length : 0,
    hasAuthHeader: !!request.headers.get('Authorization')
  });

  // Create a response object that we can modify
  let response = NextResponse.next();
  
  // If we have a token from any source but not in cookies, set it in the cookie
  if (token && !request.cookies.get('session')?.value) {
    response.cookies.set({
      name: 'session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 5, // 5 days
      path: '/',
      sameSite: 'lax', // Changed from strict to lax for better compatibility
    });
    console.log('Set session cookie in middleware');
  }

  // Allow access to /auth even if authenticated, so users can always reach the sign in page
  // if (isPublicPath && token) {
  //   console.log('Redirecting authenticated user to dashboard');
  //   response = NextResponse.redirect(new URL('/dashboard', request.url));
  //
  //   // Ensure the cookie is also set in the redirect response
  //   if (token) {
  //     response.cookies.set({
  //       name: 'session',
  //       value: token,
  //       httpOnly: true,
  //       secure: process.env.NODE_ENV === 'production',
  //       maxAge: 60 * 60 * 24 * 5, // 5 days
  //       path: '/',
  //       sameSite: 'lax',
  //     });
  //   }
  //
  //   return response;
  // }

  // Redirect unauthenticated users to login if they try to access protected paths
  if (!isPublicPath && !token) {
    console.log('Redirecting unauthenticated user to auth');
    
    // Create the redirect URL
    const redirectUrl = new URL('/auth', request.url);
    
    // Add a parameter to prevent redirect loops
    redirectUrl.searchParams.set('redirect', 'true');
    
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

// Configure the paths that should be handled by this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};