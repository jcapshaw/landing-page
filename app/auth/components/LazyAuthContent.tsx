"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider";
import AuthForm from "./AuthForm";

export default function LazyAuthContent() {
  const router = useRouter();
  const { user, loading: authLoading, error } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContent: Auth state changed', { user, authLoading });
    
    // Only handle navigation after auth state is determined
    if (!authLoading) {
      if (user) {
        console.log('AuthContent: User authenticated, redirecting to dashboard');
        router.push("/dashboard");
      } else {
        console.log('AuthContent: No user, showing auth form');
        setPageLoading(false);
      }
    }
  }, [user, authLoading, router]);

  if (authLoading || pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <span className="text-gray-500">Loading authentication...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded">
          <strong className="font-bold">Auth Error: </strong>
          <span>{error.message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome to Lifted Trucks!
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to sign in to your account
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}