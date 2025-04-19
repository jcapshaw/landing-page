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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { fetchWithAuth } from "@/lib/auth-utils"

interface User {
  uid: string
  email: string
  displayName: string
  firstName?: string
  lastName?: string
  jobTitle?: string
  role?: string
  location?: string
  disabled?: boolean
  createdAt?: string
  lastSignIn?: string
}

interface NewUserForm {
  email: string
  password: string
  displayName: string
  firstName: string
  lastName: string
  jobTitle: string
  role: string
  location: string
}

export default function AdminUsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewUserDialog, setShowNewUserDialog] = useState(false)
  const [newUser, setNewUser] = useState<NewUserForm>({
    email: "",
    password: "",
    displayName: "",
    firstName: "",
    lastName: "",
    jobTitle: "",
    role: "salesperson",
    location: "LTP"
  })
  const [createUserLoading, setCreateUserLoading] = useState(false)
  const [createUserError, setCreateUserError] = useState<string | null>(null)

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
        // Fetch users from the API
        const response = await fetchWithAuth("/api/auth/users")
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch users")
        }
        
        const userData = await response.json()
        setUsers(userData.users)
      } catch (err) {
        console.error("Error fetching users:", err)
        setError(err instanceof Error ? err.message : "Failed to load users")
      } finally {
        setLoading(false)
      }
    }

    if (user && isAdmin(user)) {
      fetchUsers()
    }
  }, [user])

  const handleLocationChange = async (userId: string, newLocation: string) => {
    try {
      // Call the API to update the user
      const response = await fetchWithAuth(`/api/auth/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ location: newLocation }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update location")
      }

      // Update the local state
      setUsers(users.map(u => u.uid === userId ? { ...u, location: newLocation } : u))
    } catch (err) {
      console.error("Error updating location:", err)
      setError(err instanceof Error ? err.message : "Failed to update location")
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // Call the API to update the user
      const response = await fetchWithAuth(`/api/auth/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
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

  const handleCreateUser = async () => {
    try {
      setCreateUserLoading(true)
      setCreateUserError(null)

      // Validate form
      if (!newUser.email || !newUser.password || !newUser.displayName) {
        throw new Error("Please fill in all required fields")
      }

      // Call the API to create the user
      const response = await fetchWithAuth("/api/auth/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create user")
      }

      const data = await response.json()
      
      // Add the new user to the local state
      setUsers([...users, data.user])
      
      // Reset form and close dialog
      setNewUser({
        email: "",
        password: "",
        displayName: "",
        firstName: "",
        lastName: "",
        jobTitle: "",
        role: "salesperson",
        location: "LTP"
      })
      setShowNewUserDialog(false)
    } catch (err) {
      console.error("Error creating user:", err)
      setCreateUserError(err instanceof Error ? err.message : "Failed to create user")
    } finally {
      setCreateUserLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      // Call the API to delete the user
      const response = await fetchWithAuth(`/api/auth/users/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete user")
      }

      // Remove the user from the local state
      setUsers(users.filter(u => u.uid !== userId))
    } catch (err) {
      console.error("Error deleting user:", err)
      setError(err instanceof Error ? err.message : "Failed to delete user")
    }
  }

  const handleToggleUserStatus = async (userId: string, currentDisabled: boolean) => {
    try {
      // Call the API to update the user
      const response = await fetchWithAuth(`/api/auth/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ disabled: !currentDisabled }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update user status")
      }

      // Update the local state
      setUsers(users.map(u => u.uid === userId ? { ...u, disabled: !currentDisabled } : u))
    } catch (err) {
      console.error("Error updating user status:", err)
      setError(err instanceof Error ? err.message : "Failed to update user status")
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
          <DialogTrigger asChild>
            <Button>Add New User</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {createUserError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {createUserError}
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="firstName" className="text-right">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value, displayName: `${e.target.value} ${newUser.lastName}` })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lastName" className="text-right">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value, displayName: `${newUser.firstName} ${e.target.value}` })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="jobTitle" className="text-right">
                  Job Title
                </Label>
                <Input
                  id="jobTitle"
                  value={newUser.jobTitle}
                  onChange={(e) => setNewUser({ ...newUser, jobTitle: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                >
                  <SelectTrigger className="col-span-3 text-xs text-center">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="salesperson">Salesperson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Select
                  value={newUser.location}
                  onValueChange={(value) => setNewUser({ ...newUser, location: value })}
                >
                  <SelectTrigger className="col-span-3 text-xs text-center">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="LTP">LTP</SelectItem>
                    <SelectItem value="LTM">LTM</SelectItem>
                    <SelectItem value="LTS">LTS</SelectItem>
                    <SelectItem value="LTT">LTT</SelectItem>
                    <SelectItem value="LTSA">LTSA</SelectItem>
                    <SelectItem value="LTHV">LTHV</SelectItem>
                    <SelectItem value="LTHB">LTHB</SelectItem>
                    <SelectItem value="LTG">LTG</SelectItem>
                    <SelectItem value="LTH">LTH</SelectItem>
                    <SelectItem value="LTMK">LTMK</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewUserDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser} disabled={createUserLoading}>
                {createUserLoading ? "Creating..." : "Create User"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
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
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Job Title</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Location</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Last Sign In</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.uid} className={user.disabled ? "bg-gray-100" : ""}>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.displayName || "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-500">{user.jobTitle || "N/A"}</div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    <Select
                      value={user.role || "none"}
                      onValueChange={(value) => handleRoleChange(user.uid, value)}
                    >
                      <SelectTrigger className="w-[140px] text-xs mx-auto">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="none">No Role</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="salesperson">Salesperson</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    <Select
                      value={user.location || "LTP"}
                      onValueChange={(value) => handleLocationChange(user.uid, value)}
                    >
                      <SelectTrigger className="w-[140px] text-xs mx-auto">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="LTP">LTP</SelectItem>
                        <SelectItem value="LTM">LTM</SelectItem>
                        <SelectItem value="LTS">LTS</SelectItem>
                        <SelectItem value="LTT">LTT</SelectItem>
                        <SelectItem value="LTSA">LTSA</SelectItem>
                        <SelectItem value="LTHV">LTHV</SelectItem>
                        <SelectItem value="LTHB">LTHB</SelectItem>
                        <SelectItem value="LTG">LTG</SelectItem>
                        <SelectItem value="LTH">LTH</SelectItem>
                        <SelectItem value="LTMK">LTMK</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    <div className={`text-sm ${user.disabled ? "text-red-500" : "text-green-500"}`}>
                      {user.disabled ? "Disabled" : "Active"}
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-500">
                      {user.lastSignIn ? new Date(user.lastSignIn).toLocaleString() : "Never"}
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap space-x-2 text-center">
                    <Button
                      variant={user.disabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleUserStatus(user.uid, !!user.disabled)}
                    >
                      {user.disabled ? "Enable" : "Disable"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(user.uid)}
                    >
                      Delete
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