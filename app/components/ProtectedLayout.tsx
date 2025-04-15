"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { getAuthToken, setupFetchInterceptor } from "@/lib/auth-utils";
import Spinner from "@/components/ui/loading-spinner";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check for token in URL (for initial auth after login)
    const token = searchParams.get('token');
    if (token) {
      console.log('Found token in URL, setting up auth');
      
      // Set up fetch interceptor with the token from URL
      setupFetchInterceptor();
      
      // Remove token from URL for security (replace state to avoid back button issues)
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('token');
      window.history.replaceState({}, '', newUrl.toString());
      
      // Set initialization complete
      setIsInitialized(true);
    } else {
      // Check if we have a token in localStorage
      const storedToken = getAuthToken();
      if (storedToken) {
        console.log('Found token in localStorage, setting up auth');
        setupFetchInterceptor();
      }
      
      // Set initialization complete
      setIsInitialized(true);
    }
  }, [searchParams]);

  // Handle redirection for unauthenticated users
  useEffect(() => {
    if (!loading && !user && isInitialized) {
      // Only redirect if we're not already on the auth page
      if (pathname !== '/auth') {
        console.log('User not authenticated, redirecting to auth page');
        router.push('/auth');
      }
    }
  }, [user, loading, isInitialized, pathname, router]);

  // Show loading state while authentication is being checked
  if (loading || !isInitialized) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner size="medium" />
          <div className="text-lg font-medium text-gray-700 mt-4">
            Initializing application...
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Please wait while we set up your session
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated or we're on a public path, render children
  return <>{children}</>;
}