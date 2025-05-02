"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AddVehicleForm } from "@/app/inventory/components/forms/AddVehicleForm"
import { Vehicle } from "@/app/inventory/types"
import { addVehicle, updateVehicle, getAllVehicles, deleteVehicle } from "@/lib/vehicles"
import { useAuth } from "@/app/components/AuthProvider"
import { isAdmin } from "@/lib/auth-utils"

export default function AdminVehiclesPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewVehicleForm, setShowNewVehicleForm] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<Vehicle["status"] | "ALL">("ALL")
  const [selectedLocation, setSelectedLocation] = useState("ALL")
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Redirect if not admin
  useEffect(() => {
    if (user && !isAdmin(user)) {
      window.location.href = "/dashboard"
    }
  }, [user])

  // Fetch vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true)
        const fetchedVehicles = await getAllVehicles()
        setVehicles(fetchedVehicles)
      } catch (err) {
        console.error("Error fetching vehicles:", err)
        setError(err instanceof Error ? err.message : "Failed to load vehicles")
      } finally {
        setLoading(false)
      }
    }

    if (user && isAdmin(user)) {
      fetchVehicles()
    }
  }, [user])

  const locations = Array.from(new Set(vehicles.map(v => v.location))).sort()

  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      (vehicle.stock?.toLowerCase() || '').includes(searchLower) ||
      (vehicle.vin?.toLowerCase() || '').includes(searchLower) ||
      vehicle.make.toLowerCase().includes(searchLower) ||
      vehicle.model.toLowerCase().includes(searchLower) ||
      (vehicle.exteriorColor?.toLowerCase() || '').includes(searchLower) ||
      (vehicle.engineSize?.toLowerCase() || '').includes(searchLower) ||
      (vehicle.transmission?.toLowerCase() || '').includes(searchLower) ||
      (vehicle.fuelType?.toLowerCase() || '').includes(searchLower) ||
      (vehicle.description?.toLowerCase() || '').includes(searchLower)
    
    const matchesStatus = selectedStatus === "ALL" || vehicle.status === selectedStatus
    const matchesLocation = selectedLocation === "ALL" || vehicle.location === selectedLocation
    
    return matchesSearch && matchesStatus && matchesLocation
  })

  const handleStatusChange = async (vehicleId: string, newStatus: Vehicle["status"]) => {
    if (!user) return

    try {
      const vehicle = vehicles.find(v => v.id === vehicleId)
      if (!vehicle) return

      const updatedVehicle: Vehicle = {
        ...vehicle,
        status: newStatus,
        statusData: {
          ...vehicle.statusData,
          current: mapStatusToFirebase(newStatus),
          updatedAt: new Date().toISOString(),
          updatedBy: { uid: user.uid, name: user.displayName || 'Unknown' }
        },
        lastStatusUpdate: new Date().toISOString()
      }

      await updateVehicle(vehicleId, updatedVehicle)
      
      // Update local state
      setVehicles(vehicles.map(v => v.id === vehicleId ? updatedVehicle : v))
    } catch (err) {
      console.error("Error updating vehicle status:", err)
      setError(err instanceof Error ? err.message : "Failed to update vehicle status")
    }
  }

  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      await deleteVehicle(vehicleId)
      
      // Update local state
      setVehicles(vehicles.filter(v => v.id !== vehicleId))
      setConfirmDeleteId(null)
    } catch (err) {
      console.error("Error deleting vehicle:", err)
      setError(err instanceof Error ? err.message : "Failed to delete vehicle")
    }
  }

  // Helper function to map UI status to Firebase status
  const mapStatusToFirebase = (status: Vehicle["status"]): Vehicle["statusData"]["current"] => {
    switch (status) {
      case "AVAILABLE":
        return "Available"
      case "DEPOSIT":
        return "Deposit"
      case "SOLD":
        return "Sold"
      case "PENDING_RECON":
        return "Pending Recon"
      default:
        return "Available"
    }
  }

  if (!user) {
    return <div className="p-8">Loading...</div>
  }

  if (!isAdmin(user)) {
    return <div className="p-8">Access denied. Admin privileges required.</div>
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vehicle Inventory Management</h1>
        <Dialog open={showNewVehicleForm} onOpenChange={setShowNewVehicleForm}>
          <DialogTrigger asChild>
            <Button>Add New Vehicle</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
            </DialogHeader>
            <AddVehicleForm
              onSubmit={async (data) => {
                if (!user) return
                
                try {
                  // Prepare the vehicle data with required metadata
                  const vehicleData = {
                    ...data,
                    status: "AVAILABLE" as const,
                    statusData: {
                      current: "Available" as const,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      updatedBy: { uid: user.uid, name: user.displayName || 'Unknown' }
                    },
                    // Create search index for filtering and searching
                    searchIndex: {
                      makeModel: `${data.make} ${data.model}`.toLowerCase(),
                      yearMakeModel: `${data.year} ${data.make} ${data.model}`.toLowerCase(),
                      priceRange: `${Math.floor(data.totalPrice / 5000) * 5000}`
                    },
                    // Add dateAdded field
                    dateAdded: new Date().toISOString(),
                    metadata: {
                      createdAt: new Date().toISOString(),
                      createdBy: { uid: user.uid, name: user.displayName || 'Unknown' },
                      lastUpdated: new Date().toISOString(),
                      lastUpdatedBy: { uid: user.uid, name: user.displayName || 'Unknown' }
                    },
                    lastStatusUpdate: new Date().toISOString()
                  }
                  
                  // Add the vehicle to the database
                  await addVehicle(vehicleData)
                  
                  // Refresh the vehicles list
                  const updatedVehicles = await getAllVehicles()
                  setVehicles(updatedVehicles)
                  
                  // Close the form
                  setShowNewVehicleForm(false)
                } catch (error) {
                  console.error('Error adding vehicle:', error)
                  setError(error instanceof Error ? error.message : "Failed to add vehicle")
                }
              }}
              onCancel={() => setShowNewVehicleForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="flex items-center gap-4 mb-6">
        <Input
          type="text"
          placeholder="Search inventory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Select value={selectedStatus} onValueChange={(value: Vehicle["status"] | "ALL") => setSelectedStatus(value)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="DEPOSIT">Deposit</SelectItem>
            <SelectItem value="SOLD">Sold</SelectItem>
            <SelectItem value="PENDING_RECON">Pending Recon</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Locations</SelectItem>
            {locations.map(location => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {loading ? (
        <div>Loading vehicles...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Location</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Vehicle</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">VIN</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Price</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Mileage</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Date Added</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className={vehicle.status === "DEPOSIT" ? "bg-yellow-100" : ""}>
                  <td className="px-4 py-2 whitespace-nowrap text-center text-sm">
                    {vehicle.stock}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center text-sm">
                    {vehicle.location}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    <div className="text-sm">
                      <div className="font-medium">{vehicle.year} {vehicle.make}</div>
                      <div>{vehicle.model} {vehicle.trim}</div>
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center text-sm">
                    {vehicle.vin}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center text-sm">
                    ${vehicle.totalPrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center text-sm">
                    {vehicle.mileage.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    <Select
                      value={vehicle.status}
                      onValueChange={(value: Vehicle["status"]) => handleStatusChange(vehicle.id, value)}
                    >
                      <SelectTrigger className="w-[140px] text-xs mx-auto">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="AVAILABLE" className="text-xs py-1">Available</SelectItem>
                        <SelectItem value="DEPOSIT" className="text-xs py-1">Deposit</SelectItem>
                        <SelectItem value="SOLD" className="text-xs py-1">Sold</SelectItem>
                        <SelectItem value="PENDING_RECON" className="text-xs py-1">Pending Recon</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center text-sm">
                    {typeof vehicle.dateAdded === 'string' 
                      ? new Date(vehicle.dateAdded).toLocaleDateString() 
                      : new Date(vehicle.dateAdded.seconds * 1000).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/inventory?id=${vehicle.id}`, '_blank')}
                      >
                        View
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setConfirmDeleteId(vehicle.id)}
                      >
                        Delete
                      </Button>
                    </div>
                    {confirmDeleteId === vehicle.id && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
                          <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
                          <p className="mb-4">
                            Are you sure you want to delete this vehicle?<br />
                            <span className="font-semibold">{vehicle.year} {vehicle.make} {vehicle.model}</span><br />
                            Stock: {vehicle.stock}<br />
                            VIN: {vehicle.vin}
                          </p>
                          <p className="text-red-600 mb-4">This action cannot be undone.</p>
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => setConfirmDeleteId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteVehicle(vehicle.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
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