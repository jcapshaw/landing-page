"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/components/AuthProvider"
import { isAdmin } from "@/lib/auth-utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { fetchWithAuth } from "@/lib/auth-utils"

interface User {
  uid: string
  email: string
  displayName: string
  role?: string
}

export default function AdminUsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not admin
  useEffect(() => {
    if (user && !isAdmin(user)) {
      window.location.href = "/dashboard"
    }
  }, [user])

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        // In a real app, you would fetch this from an API endpoint
        // For demo purposes, we'll use mock data
        const mockUsers: User[] = [
          { uid: "user1", email: "admin@example.com", displayName: "Admin User", role: "admin" },
          { uid: "user2", email: "manager@example.com", displayName: "Manager User", role: "manager" },
          { uid: "user3", email: "sales@example.com", displayName: "Sales User", role: "salesperson" },
          { uid: "user4", email: "newuser@example.com", displayName: "New User" },
        ]
        setUsers(mockUsers)
      } catch (err) {
        console.error("Error fetching users:", err)
        setError("Failed to load users")
      } finally {
        setLoading(false)
      }
    }

    if (user && isAdmin(user)) {
      fetchUsers()
    }
  }, [user])

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // Call the API to update the user's role
      const response = await fetchWithAuth("/api/auth/set-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update role")
      }

      // Update the local state
      setUsers(users.map(u => u.uid === userId ? { ...u, role: newRole } : u))
    } catch (err) {
      console.error("Error updating role:", err)
      setError(err instanceof Error ? err.message : "Failed to update role")
    }
  }

  if (!user) {
    return <div className="p-8">Loading...</div>
  }

  if (!isAdmin(user)) {
    return <div className="p-8">Access denied. Admin privileges required.</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div>Loading users...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">User</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.uid}>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.displayName || "N/A"}</div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <Select
                      value={user.role || "none"}
                      onValueChange={(value) => handleRoleChange(user.uid, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Role</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="salesperson">Salesperson</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // In a real app, you would implement a reset password functionality
                        alert("Reset password functionality would be implemented here")
                      }}
                    >
                      Reset Password
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}