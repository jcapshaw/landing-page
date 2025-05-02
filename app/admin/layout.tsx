"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/app/components/AuthProvider"
import { isAdmin } from "@/lib/auth-utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState("users")

  // Redirect if not admin
  useEffect(() => {
    if (user && !isAdmin(user)) {
      window.location.href = "/dashboard"
    }
  }, [user])

  // Set active tab based on pathname
  useEffect(() => {
    if (pathname.includes("/admin/vehicles")) {
      setActiveTab("vehicles")
    } else if (pathname.includes("/admin/users")) {
      setActiveTab("users")
    }
  }, [pathname])

  if (!user) {
    return <div className="p-8">Loading...</div>
  }

  if (!isAdmin(user)) {
    return <div className="p-8">Access denied. Admin privileges required.</div>
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs value={activeTab} className="mb-6">
        <TabsList>
          <Link href="/admin/users" passHref>
            <TabsTrigger value="users" className="cursor-pointer">
              User Management
            </TabsTrigger>
          </Link>
          <Link href="/admin/vehicles" passHref>
            <TabsTrigger value="vehicles" className="cursor-pointer">
              Vehicle Inventory
            </TabsTrigger>
          </Link>
        </TabsList>
      </Tabs>
      
      {children}
    </div>
  )
}