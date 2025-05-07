"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";
import { setAuthToken, clearAuthToken, setupFetchInterceptor, resetFetchInterceptor, fetchWithAuth } from "@/lib/auth-utils";

// Define a custom error type similar to Firebase's AuthError
interface AuthError {
  code: string;
  message: string;
  customData?: Record<string, any>;
  name: string;
}

interface AuthContextType {
  user: (User & { role?: string }) | null;
  loading: boolean;
  error: AuthError | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
});

export const useAuth = () => useContext(AuthContext);

export default function LazyAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<(User & { role?: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    // Setup Supabase auth state listener
    const setupAuth = async () => {
      try {
        console.log('Setting up Supabase auth state listener');
        
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        // Handle initial session
        if (session) {
          await handleSession(session);
        } else {
          console.log('No initial session found');
          setUser(null);
          setLoading(false);
          
          // Don't clear session cookie if we're just initializing
          // This prevents the DELETE /api/auth/session loop
        }
        
        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event);
            
            if (session) {
              await handleSession(session);
            } else {
              console.log('No user authenticated, clearing session');
              
              // Clear the token from localStorage
              clearAuthToken();
              
              // Reset fetch interceptor
              resetFetchInterceptor();
              
              // Only clear the session cookie if we previously had a user
              // This prevents the DELETE /api/auth/session loop
              if (user) {
                try {
                  await fetch('/api/auth/session', {
                    method: 'DELETE'
                  });
                } catch (error) {
                  console.warn('Error clearing session cookie:', error);
                }
              }
              
              setUser(null);
              setLoading(false);
            }
          }
        );
        
        // Return cleanup function
        return () => {
          console.log('Cleaning up auth state listener');
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error in setupAuth:', error);
        
        // Provide more detailed error information
        let errorCode = 'auth/setup-failed';
        let errorMessage = error instanceof Error ? error.message : 'Failed to setup authentication';
        
        // Log additional details for debugging
        if (error instanceof Error) {
          console.error('Setup error details:', error.toString());
        }
        
        const authError: AuthError = {
          code: errorCode,
          message: errorMessage,
          name: 'AuthError'
        };
        
        setError(authError);
        setLoading(false);
      }
    };
    
    // Helper function to handle authenticated session
    const handleSession = async (session: Session) => {
      try {
        console.log('User authenticated:', session.user.email);
        
        // Get the access token
        const token = session.access_token;
        
        // Store token in localStorage for client-side use
        setAuthToken(token);
        
        // Set up fetch interceptor
        setupFetchInterceptor();
        
        // Also set the session cookie via API for server-side access
        try {
          const response = await fetch('/api/auth/session', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            console.warn('Failed to set session cookie via API, but client-side auth is still working');
          }
        } catch (error) {
          console.warn('Error setting session cookie:', error);
        }
        
        console.log('Auth token set and fetch interceptor configured');
        
        // Get user role from user metadata
        const role = session.user.user_metadata?.role as string;
        
        // If no role in metadata, try to fetch from API
        if (!role) {
          try {
            const response = await fetch('/api/auth/get-role', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              const userWithRole = {
                ...session.user,
                role: data.role
              };
              setUser(userWithRole);
            } else {
              setUser(session.user);
            }
          } catch (apiError) {
            console.warn('Failed to fetch role from API:', apiError);
            setUser(session.user);
          }
        } else {
          const userWithRole = {
            ...session.user,
            role
          };
          setUser(userWithRole);
        }
      } catch (err) {
        console.error("Error handling session:", err);
        
        // Provide more detailed error information
        let errorCode = 'auth/internal-error';
        let errorMessage = err instanceof Error ? err.message : 'Unknown error';
        
        // Log additional details for debugging
        if (err instanceof Error) {
          console.error('Original error details:', err.toString());
        }
        
        const authError: AuthError = {
          code: errorCode,
          message: errorMessage,
          name: 'AuthError'
        };
        
        setError(authError);
      } finally {
        setLoading(false);
      }
    };
    
    // Start the auth setup
    const cleanupPromise = setupAuth();
    
    // Return cleanup function
    return () => {
      // Handle the promise when it resolves
      cleanupPromise.then(cleanup => {
        if (typeof cleanup === 'function') {
          cleanup();
        }
      }).catch(err => {
        console.error('Error during auth cleanup:', err);
      });
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}