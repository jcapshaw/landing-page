"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { User, Session, AuthError } from "@supabase/supabase-js";

interface AuthContextType {
  user: (User & { role?: string }) | null;
  loading: boolean;
  error: AuthError | null;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  session: null,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<(User & { role?: string }) | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          setError(error);
        } else {
          setSession(session);
          if (session?.user) {
            // Try to get user role
            try {
              const { data: roleData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .single();
              
              const userWithRole = {
                ...session.user,
                role: roleData?.role || 'user'
              };
              setUser(userWithRole);
            } catch (roleError) {
              console.warn('Failed to get user role:', roleError);
              setUser(session.user);
            }
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Error in getInitialSession:', err);
        setError(err as AuthError);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        try {
          setSession(session);
          
          if (session?.user) {
            // Try to get user role
            try {
              const { data: roleData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .single();
              
              const userWithRole = {
                ...session.user,
                role: roleData?.role || 'user'
              };
              setUser(userWithRole);
            } catch (roleError) {
              console.warn('Failed to get user role:', roleError);
              setUser(session.user);
            }
          } else {
            setUser(null);
          }
          
          setError(null);
        } catch (err) {
          console.error('Error in auth state change:', err);
          setError(err as AuthError);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, session }}>
      {children}
    </AuthContext.Provider>
  );
}