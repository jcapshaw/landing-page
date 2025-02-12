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
      // Wait for auth to be available
      let retries = 0;
      const maxRetries = 3;
      
      while (!auth && retries < maxRetries) {
        console.log(`Waiting for auth to initialize... (attempt ${retries + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        retries++;
      }

      if (!auth) {
        console.error('Auth failed to initialize after retries');
        const authError: AuthError = {
          code: 'auth/invalid-auth-instance',
          message: 'Authentication failed to initialize after multiple attempts',
          customData: { appName: 'default' },
          name: 'AuthError'
        };
        setError(authError);
        setLoading(false);
        return;
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
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4">Loading authentication...</div>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}