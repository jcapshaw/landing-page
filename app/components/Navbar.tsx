"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { auth } from "@/lib/firebase";
import { useState } from "react";

const Navbar = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-sm font-medium text-white hover:text-orange-400 flex items-center gap-1"
              >
                More
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isMenuOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <Link
                      href="/hot-prospects"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Hot Prospects
                    </Link>
                    <Link
                      href="/sales-stats"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sales Stats
                    </Link>
                    <Link
                      href="/resources"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Resources
                    </Link>
                    <Link
                      href="/daily-log"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Daily Log
                    </Link>
                    <Link
                      href="/service-request"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Service Request
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        {user ? (
          <div className="flex flex-col items-center">
            <button
              onClick={handleSignOut}
              className="bg-orange-500 text-white hover:bg-orange-600 px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign Out
            </button>
            <span className="text-xs text-gray-400 mt-1">{user.email}</span>
          </div>
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
