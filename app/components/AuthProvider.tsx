"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth } from "@/lib/firebase";
import { User, getIdTokenResult, AuthError } from "firebase/auth";

interface AuthContextType {
  user: (User & { role?: string }) | null;
  loading: boolean;
  error: Error | null;
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
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!auth) {
      console.log('Auth not initialized yet');
      setLoading(false);
      return;
    }

    console.log('Setting up auth state listener');
    const unsubscribe = auth.onAuthStateChanged(
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
          setError(err instanceof Error ? err : new Error('Authentication error'));
        } finally {
          setLoading(false);
        }
      },
      (error: AuthError) => {
        console.error("Auth state change error:", error);
        setError(error);
        setLoading(false);
      }
    );

    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
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