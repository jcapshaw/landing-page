"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { auth } from "@/lib/firebase";

const Navbar = () => {
  const router = useRouter();
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      if (!auth) {
        throw new Error("Auth instance not initialized");
      }
      await signOut(auth);
      router.push("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-gradient-to-r from-gray-900 to-black border-b">
      <div>
        <Image src="/30ltlogo.png" alt="Logo" width={60} height={60} />
      </div>
      <div className="flex items-center gap-6">
        {user && (
          <>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-white hover:text-orange-400"
            >
              Dashboard
            </Link>
            <Link
              href="/inventory"
              className="text-sm font-medium text-white hover:text-orange-400"
            >
              Inventory
            </Link>
            <Link
              href="/hot-prospects"
              className="text-sm font-medium text-white hover:text-orange-400"
            >
              Hot Prospects
            </Link>
            <Link
              href="/sales-stats"
              className="text-sm font-medium text-white hover:text-orange-400"
            >
              Sales Stats
            </Link>
            <Link
              href="/resources"
              className="text-sm font-medium text-white hover:text-orange-400"
            >
              Resources
            </Link>
            <Link
              href="/daily-log"
              className="text-sm font-medium text-white hover:text-orange-400"
            >
              Daily Log
            </Link>
          </>
        )}
        {user ? (
          <button
            onClick={handleSignOut}
            className="bg-orange-500 text-white hover:bg-orange-600 px-4 py-2 rounded-md text-sm font-medium"
          >
            Sign Out
          </button>
        ) : (
          <Link
            href="/auth"
            className="bg-orange-500 text-white hover:bg-orange-600 px-4 py-2 rounded-md text-sm font-medium"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
