"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./components/AuthProvider";
import HomeContent from "./components/HomeContent";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Skip showing loading state
  if (loading) {
    return null; // Return empty instead of loading spinner
  }

  // If user is not authenticated, show home content
  return <HomeContent />;
}