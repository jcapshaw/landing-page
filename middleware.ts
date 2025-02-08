import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add static asset paths to be excluded from auth check
const PUBLIC_FILE = /\.(.*)$/;

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

  // Define public paths that don't require authentication
  const isPublicPath = path === '/' || path === '/auth' || path.includes('/auth?');

  // Get the token from cookies
  const token = request.cookies.get('session')?.value;

  // Log for debugging
  console.log('Middleware:', { path, isPublicPath, hasToken: !!token });

  // Redirect authenticated users to dashboard if they try to access public paths
  if (isPublicPath && token) {
    console.log('Redirecting authenticated user to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users to login if they try to access protected paths
  if (!isPublicPath && !token) {
    console.log('Redirecting unauthenticated user to auth');
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return NextResponse.next();
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