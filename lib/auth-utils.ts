/**
 * Authentication utility functions
 */

// User role types
export type UserRole = 'admin' | 'manager' | 'salesperson';

// Get the authentication token from localStorage
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

// Set the authentication token in localStorage
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('authToken', token);
}

// Clear the authentication token from localStorage
export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
}

// Add the authentication token to fetch headers
export function addAuthHeaderToInit(init?: RequestInit): RequestInit {
  const token = getAuthToken();
  if (!token) return init || {};
  const newInit: RequestInit = init ? { ...init } : {};
  newInit.headers = newInit.headers || {};
  
  
  // Convert headers to Headers object if it's not already
  const headers = newInit.headers instanceof Headers 
    ? newInit.headers 
    : new Headers(newInit.headers as Record<string, string>);
  
  // Add Authorization header
  headers.set('Authorization', `Bearer ${token}`);
  newInit.headers = headers;
  
  return newInit;
}

// Fetch with authentication
export async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const authInit = addAuthHeaderToInit(init);
  return fetch(input, authInit);
}

// Setup global fetch interceptor
export function setupFetchInterceptor(): void {
  if (typeof window === 'undefined' || window.fetchInterceptorSet) return;
  
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    const authInit = addAuthHeaderToInit(init);
    return originalFetch(input, authInit);
  };
  
  window.fetchInterceptorSet = true;
}

// Reset fetch interceptor
export function resetFetchInterceptor(): void {
  if (typeof window === 'undefined' || !window.fetchInterceptorSet) return;
  delete window.fetchInterceptorSet;
}

// Role-based access control utility functions
export function hasRole(user: any, role: UserRole): boolean {
  return user?.role === role;
}

export function isAdmin(user: any): boolean {
  // Temporarily allow demo@liftedtrucks.com to access admin pages
  if (user?.email === 'demo@liftedtrucks.com') {
    return true;
  }
  return hasRole(user, 'admin');
}

export function isManager(user: any): boolean {
  return hasRole(user, 'manager');
}

export function isSalesPerson(user: any): boolean {
  return hasRole(user, 'salesperson');
}

export function hasAdminAccess(user: any): boolean {
  return isAdmin(user);
}

export function hasManagerAccess(user: any): boolean {
  return isAdmin(user) || isManager(user);
}

export function hasWriteAccess(user: any): boolean {
  return isAdmin(user) || isManager(user);
}

export function hasReadAccess(user: any): boolean {
  return !!user; // Any authenticated user has read access
}