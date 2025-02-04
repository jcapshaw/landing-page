import { Inter } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import NavbarWrapper from "./components/NavbarWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lifted Trucks Employee Portal",
  description: "Internal portal for Lifted Trucks employees",
};

export default function RootLayout({ children }: PropsWithChildren): React.ReactNode {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NavbarWrapper />
        {children}
      </body>
    </html>
  );
}