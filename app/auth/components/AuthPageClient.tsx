"use client";

import dynamic from "next/dynamic";

// Dynamically import AuthContent with loading state
const DynamicAuthContent = dynamic(() => import("./LazyAuthContent"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
        <span className="text-gray-500">Loading authentication page...</span>
      </div>
    </div>
  ),
});

export default function AuthPageClient() {
  return <DynamicAuthContent />;
}