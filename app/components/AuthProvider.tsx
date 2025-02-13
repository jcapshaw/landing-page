"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth } from "@/lib/firebase";
import { User, getIdTokenResult, AuthError } from "firebase/auth";

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
                
                // Get fresh token and set cookie
                const token = await firebaseUser.getIdToken(true); // Force refresh
                const cookieValue = `session=${token}; path=/; max-age=${60 * 60 * 24 * 5}; SameSite=Strict; Secure`;
                document.cookie = cookieValue;
                console.log('Session cookie set successfully');

                // Get user role and update state
                const tokenResult = await getIdTokenResult(firebaseUser);
                const userWithRole = {
                  ...firebaseUser,
                  role: tokenResult.claims.role as string
                };
                setUser(userWithRole);
              } else {
                console.log('No user authenticated, clearing session');
                document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict; Secure';
                setUser(null);
              }
            } catch (err) {
              console.error("Error in auth state change:", err);
              const authError: AuthError = {
                code: 'auth/internal-error',
                message: `Authentication error: ${err instanceof Error ? err.message : 'Unknown error'}`,
                customData: {
                  appName: auth?.app?.name || 'default',
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
            const authError: AuthError = {
              code: 'auth/internal-error',
              message: `Auth state change error: ${error.message}`,
              customData: {
                appName: auth?.app?.name || 'default',
              },
              name: 'AuthError'
            };
            setError(authError);
            setLoading(false);
          }
        );
      } catch (error) {
        console.error('Error in setupAuth:', error);
        const authError: AuthError = {
          code: 'auth/setup-failed',
          message: error instanceof Error ? error.message : 'Failed to setup authentication',
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

  if (error) {
    return <div>Authentication Error: {error.message}</div>;
  }

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {loading ? (
        <div className="h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
            <div className="text-lg font-medium text-gray-700">
              Initializing application...
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Please wait while we set up your session
            </div>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}