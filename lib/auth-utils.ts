/**
 * Authentication utility functions for Supabase
 */

import { supabase } from './supabase';

// User role types
export type UserRole = 'admin' | 'manager' | 'salesperson';

// Get the authentication token from localStorage
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Get the session from Supabase
  const session = supabase.auth.getSession();
  if (!session) return null;
  
  // Return the access token if available
  return localStorage.getItem('sb-access-token');
}

// Set the authentication token in localStorage
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  // Note: Supabase handles token storage internally, but we'll keep this for compatibility
  localStorage.setItem('authToken', token);
}

// Clear the authentication token from localStorage
export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
  // Also sign out from Supabase
  supabase.auth.signOut();
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
  // In Supabase, we'll store user roles in user metadata
  return user?.user_metadata?.role === role;
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

// Get current user from Supabase
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Get current session from Supabase
export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}