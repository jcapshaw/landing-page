"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/auth-utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Navbar = () => {
  const router = useRouter();
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleMoreSelect = (value: string) => {
    router.push(`/${value}`);
  };

  return (
    <nav className="flex justify-between items-center px-4 sm:px-8 py-4 bg-gradient-to-r from-gray-900 to-black border-b">
      <div>
        <Image src="/30ltlogo.png" alt="Logo" width={60} height={60} />
      </div>
      <div className="flex items-center">
        {user && (
          <>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
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
              {isAdmin(user) && (
                <Link
                  href="/admin/users"
                  className="text-sm font-medium text-white hover:text-orange-400"
                >
                  Admin
                </Link>
              )}
              <Select onValueChange={handleMoreSelect}>
                <SelectTrigger className="w-[100px] bg-transparent text-white border-none hover:text-orange-400 focus:ring-0">
                  <SelectValue placeholder="More" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="hot-prospects">Hot Prospects</SelectItem>
                    <SelectItem value="sales-stats">Sales Stats</SelectItem>
                    <SelectItem value="resources">Resources</SelectItem>
                    <SelectItem value="daily-log">Daily Log</SelectItem>
                    <SelectItem value="sold-log">Sold Log</SelectItem>
                    <SelectItem value="service-request">Service Request</SelectItem>
                    <SelectItem value="loading-demo">Loading Demo</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            {/* Mobile Navigation */}
            <div className="md:hidden mr-4">
              <Select onValueChange={handleMoreSelect}>
                <SelectTrigger className="w-[100px] bg-transparent text-white border-none hover:text-orange-400 focus:ring-0">
                  <SelectValue placeholder="Menu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="dashboard">Dashboard</SelectItem>
                    <SelectItem value="inventory">Inventory</SelectItem>
                    {isAdmin(user) && (
                      <SelectItem value="admin/users">Admin</SelectItem>
                    )}
                    <SelectItem value="hot-prospects">Hot Prospects</SelectItem>
                    <SelectItem value="sales-stats">Sales Stats</SelectItem>
                    <SelectItem value="resources">Resources</SelectItem>
                    <SelectItem value="daily-log">Daily Log</SelectItem>
                    <SelectItem value="sold-log">Sold Log</SelectItem>
                    <SelectItem value="service-request">Service Request</SelectItem>
                    <SelectItem value="loading-demo">Loading Demo</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
        {user ? (
          <div className="flex flex-col items-center ml-4">
            <button
              onClick={handleSignOut}
              className="bg-orange-500 text-white hover:bg-orange-600 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap"
            >
              Sign Out
            </button>
            <span className="text-gray-400 mt-1 max-w-[120px] truncate" style={{ fontSize: '8px' }}>{user.email}</span>
          </div>
        ) : (
          <Link
            href="/auth"
            className="bg-orange-500 text-white hover:bg-orange-600 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
