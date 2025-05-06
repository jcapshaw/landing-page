import { Inter } from "next/font/google";
import "./globals.css";
import type { PropsWithChildren } from "react";
import NavbarWrapper from "./components/NavbarWrapper";
import dynamic from 'next/dynamic';
import { metadata as siteMetadata } from "./metadata";
import { metadata as homeMetadata } from "./home-metadata";
import PageTransition from "@/components/ui/page-transition";

// Lazy load the AuthProvider to reduce initial bundle size
const LazyAuthProvider = dynamic(() => import('./components/LazyAuthProvider'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen">Loading...</div>
});

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  ...siteMetadata,
  ...homeMetadata,
  title: "Lifted Trucks Employee Portal",
  description: "Internal portal for Lifted Trucks employees",
  icons: {
    icon: '/treadicon.svg'
  }
};

export default function RootLayout({ children }: PropsWithChildren): React.ReactNode {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LazyAuthProvider>
          <NavbarWrapper />
          <PageTransition>
            {children}
          </PageTransition>
        </LazyAuthProvider>
      </body>
    </html>
  );
}