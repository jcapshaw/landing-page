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

  // Development bypass - check if we should skip auth
  const isDevelopmentBypass = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true';

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
              
              // Session cleanup is handled by Supabase
              console.log('Session cleared by Supabase');
              
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
        
        // Session is now handled entirely by Supabase
        console.log('Session handled by Supabase');
        
        console.log('Auth token set and fetch interceptor configured');
        
        // Get user role from user metadata
        const role = session.user.user_metadata?.role as string;
        
        // For now, just use the role from metadata
        const userWithRole = {
          ...session.user,
          role: role || 'user' // Default to 'user' if no role
        };
        setUser(userWithRole);
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