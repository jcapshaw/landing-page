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
      if (!auth) {
        console.error('Auth not initialized yet');
        const authError: AuthError = {
          code: 'auth/invalid-auth-instance',
          message: 'Authentication not properly initialized',
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
              // Get the user's token and set it as a cookie
              const token = await firebaseUser.getIdToken();
              document.cookie = `session=${token}; path=/; max-age=${60 * 60 * 24 * 5}`; // 5 days

              const tokenResult = await getIdTokenResult(firebaseUser);
              const userWithRole = {
                ...firebaseUser,
                role: tokenResult.claims.role as string
              };
              setUser(userWithRole);
            } else {
              console.log('No user authenticated');
              // Clear the session cookie
              document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
              setUser(null);
            }
          } catch (err) {
            console.error("Error in auth state change:", err);
            const authError: AuthError = {
              code: 'auth/internal-error',
              message: err instanceof Error ? err.message : 'Authentication error',
              customData: {
                appName: auth!.app.name,
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
            message: error.message,
            customData: {
              appName: auth!.app.name,
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