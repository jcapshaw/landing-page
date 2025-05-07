"use client";

import dynamic from "next/dynamic";
import { PropsWithChildren } from "react";

// Dynamically import LazyAuthProvider with ssr: false
const LazyAuthProvider = dynamic(() => import("./LazyAuthProvider"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      Loading...
    </div>
  ),
});

export default function ClientAuthProviderWrapper({ children }: PropsWithChildren) {
  return <LazyAuthProvider>{children}</LazyAuthProvider>;
}