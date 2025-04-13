import { Inter } from "next/font/google";
import "./globals.css";
import type { PropsWithChildren } from "react";
import NavbarWrapper from "./components/NavbarWrapper";
import { AuthProvider } from "./components/AuthProvider";
import { metadata as siteMetadata } from "./metadata";
import { metadata as homeMetadata } from "./home-metadata";

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
        <AuthProvider>
          <NavbarWrapper />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}