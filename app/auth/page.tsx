import type { Metadata } from "next";
import AuthPageClient from "./components/AuthPageClient";

export const metadata: Metadata = {
  title: 'Authentication - Lifted Trucks Employee Portal',
  description: 'Sign in to your Lifted Trucks Employee Portal account',
};

export default function AuthPage() {
  return <AuthPageClient />;
}