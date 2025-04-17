"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth } from "@/lib/firebase";
import { User, getIdTokenResult, AuthError } from "firebase/auth";
import { setAuthToken, clearAuthToken, setupFetchInterceptor, resetFetchInterceptor } from "@/lib/auth-utils";

// Helper function to get token with retry mechanism
const getTokenWithRetry = async (user: User, maxRetries = 3): Promise<string> => {
  let retryCount = 0;
  let lastError: any;

  while (retryCount < maxRetries) {
    try {
      // Exponential backoff delay
      if (retryCount > 0) {
        const delay = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
        console.log(`Retry attempt ${retryCount}/${maxRetries} after ${delay}ms delay`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Try to get a fresh token
      return await user.getIdToken(true);
    } catch (error) {
      lastError = error;
      console.warn(`Token refresh attempt ${retryCount + 1}/${maxRetries} failed:`, error);
      retryCount++;
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError;
};

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<(User & { role?: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const setupAuth = async () => {
      try {
        // Wait for auth to be available with increased timeout
        let retries = 0;
        const maxRetries = 5;
        const retryDelay = 2000; // 2 seconds between retries
        
        while (!auth && retries < maxRetries) {
          console.log(`Waiting for auth to initialize... (attempt ${retries + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          retries++;
        }

        if (!auth) {
          throw new Error('Authentication failed to initialize after multiple attempts');
        }

        console.log('Setting up auth state listener');
        unsubscribe = auth.onAuthStateChanged(
          async (firebaseUser: User | null) => {
            try {
              if (firebaseUser) {
                console.log('User authenticated:', firebaseUser.email);
                
                let token: string;
                
                // Try to get a fresh token with retry mechanism
                try {
                  // First try to get a fresh token
                  token = await getTokenWithRetry(firebaseUser);
                  console.log('Successfully refreshed auth token');
                } catch (tokenError) {
                  console.warn('Failed to refresh token, using existing token:', tokenError);
                  
                  // If refresh fails, try to get the current token without forcing refresh
                  try {
                    token = await firebaseUser.getIdToken(false);
                    console.log('Using existing token');
                  } catch (currentTokenError) {
                    console.error('Failed to get current token:', currentTokenError);
                    throw currentTokenError; // Re-throw to be caught by outer catch
                  }
                }
                
                // Store token in localStorage
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

                // Get user role and update state
                try {
                  const tokenResult = await getIdTokenResult(firebaseUser);
                  const userWithRole = {
                    ...firebaseUser,
                    role: tokenResult.claims.role as string
                  };
                  setUser(userWithRole);
                } catch (roleError) {
                  console.warn('Failed to get user role, proceeding without role:', roleError);
                  setUser(firebaseUser);
                }
              } else {
                console.log('No user authenticated, clearing session');
                
                // Clear the token from localStorage
                clearAuthToken();
                
                // Reset fetch interceptor
                resetFetchInterceptor();
                
                // Also clear the session cookie via API
                try {
                  await fetch('/api/auth/session', {
                    method: 'DELETE'
                  });
                } catch (error) {
                  console.warn('Error clearing session cookie:', error);
                }
                
                setUser(null);
              }
            } catch (err) {
              console.error("Error in auth state change:", err);
              
              // Provide more detailed error information
              let errorCode = 'auth/internal-error';
              let errorMessage = err instanceof Error ? err.message : 'Unknown error';
              
              // Check for specific Firebase auth errors
              if (err instanceof Error && errorMessage.includes('auth/request-had-invalid-authentication-credentials')) {
                errorCode = 'auth/invalid-credentials';
                errorMessage = 'Authentication session expired or invalid. This can happen after long periods of inactivity. Please try signing out and signing in again.';
                
                // Clear the token to force a fresh login
                clearAuthToken();
                resetFetchInterceptor();
                
                // Attempt to clear the session cookie
                try {
                  fetch('/api/auth/session', { method: 'DELETE' }).catch(e =>
                    console.warn('Failed to clear session cookie:', e)
                  );
                } catch (clearError) {
                  console.warn('Error during session cleanup:', clearError);
                }
              }
              
              // Log additional details for debugging but don't include in the error object
              if (err instanceof Error) {
                console.error('Original error details:', err.toString());
              }
              
              const authError: AuthError = {
                code: errorCode,
                message: errorMessage,
                customData: {
                  appName: auth?.app?.name || 'default'
                },
                name: 'AuthError'
              };
              setError(authError);
            } finally {
              setLoading(false);
            }
          },
          (error: Error) => {
            console.error("Auth state change error:", error);
            
            // Provide more detailed error information
            let errorCode = 'auth/internal-error';
            let errorMessage = `Auth state change error: ${error.message}`;
            
            // Check for specific Firebase auth errors
            if (error.message.includes('auth/request-had-invalid-authentication-credentials')) {
              errorCode = 'auth/invalid-credentials';
              errorMessage = 'Authentication session expired or invalid. Please try signing out and signing in again.';
              
              // Clear the token to force a fresh login
              clearAuthToken();
              resetFetchInterceptor();
            }
            
            const authError: AuthError = {
              code: errorCode,
              message: errorMessage,
              customData: {
                appName: auth?.app?.name || 'default'
              },
              name: 'AuthError'
            };
            setError(authError);
            setLoading(false);
          }
        );
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
          customData: { appName: 'default' },
          name: 'AuthError'
        };
        
        setError(authError);
        setLoading(false);
      }
    };

    setupAuth();

    return () => {
      console.log('Cleaning up auth state listener');
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}