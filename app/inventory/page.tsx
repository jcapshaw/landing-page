"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LiftDetailsModal } from "./components/LiftDetailsModal"
import { AddVehicleForm } from "./components/AddVehicleForm"
import { InventoryTable } from "./components/InventoryTable"
import { Vehicle } from "./types"

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [showLiftModal, setShowLiftModal] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [showNewVehicleForm, setShowNewVehicleForm] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<Vehicle["status"] | "ALL">("ALL")
  const [selectedLocation, setSelectedLocation] = useState("ALL")

  const locations = Array.from(new Set(vehicles.map(v => v.location))).sort()

  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      vehicle.year.toLowerCase().includes(searchLower) ||
      vehicle.make.toLowerCase().includes(searchLower) ||
      vehicle.model.toLowerCase().includes(searchLower) ||
      (vehicle.trim?.toLowerCase() || '').includes(searchLower)
    
    const matchesStatus = selectedStatus === "ALL" || vehicle.status === selectedStatus
    const matchesLocation = selectedLocation === "ALL" || vehicle.location === selectedLocation
    
    return matchesSearch && matchesStatus && matchesLocation
  })

  const handleLiftDetailsSave = (vehicleId: string, data: {
    liftDescription: string
    liftPrice: number
    hasLift: boolean
    hasWheels: boolean
    hasTires: boolean
    hasPaintMatch: boolean
    hasLeather: boolean
    hasOther: boolean
  }) => {
    const updatedVehicles = vehicles.map(vehicle =>
      vehicle.id === vehicleId
        ? {
            ...vehicle,
            additions: {
              ...vehicle.additions,
              lift: data.hasLift ? {
                description: data.liftDescription,
                price: data.liftPrice,
                installed: true
              } : undefined,
              wheels: data.hasWheels ? {
                description: "",
                price: 0,
                installed: false
              } : undefined,
              tires: data.hasTires ? {
                description: "",
                price: 0,
                installed: false
              } : undefined,
              paintMatch: data.hasPaintMatch ? {
                description: "",
                price: 0,
                completed: false
              } : undefined,
              leather: data.hasLeather ? {
                description: "",
                price: 0,
                installed: false
              } : undefined,
              totalPrice: data.hasLift ? data.liftPrice : 0
            }
          }
        : vehicle
    );
    setVehicles(updatedVehicles);
    setShowLiftModal(false)
    setSelectedVehicle(null)
  }

  type VehicleFormData = Omit<Vehicle, 'id' | 'dateAdded' | 'lastStatusUpdate' | 'status' | 'statusData' | 'metadata' | 'searchIndex' | 'additions'>
  
  const handleNewVehicleSubmit = (formData: VehicleFormData) => {
    const now = new Date().toISOString()
    const mockUser = { uid: "mock-user", name: "Mock User" } // Replace with actual user data

    const vehicle: Vehicle = {
      ...formData,
      id: Date.now().toString(),
      stock: "", // Initialize with empty stock number
      totalPrice: formData.totalPrice || 0,
      status: "AVAILABLE",
      statusData: {
        current: "Available",
        updatedAt: now,
        updatedBy: mockUser
      },
      additions: {
        totalPrice: 0,
        lift: undefined,
        wheels: undefined,
        tires: undefined,
        paintMatch: undefined,
        leather: undefined,
        other: undefined
      },
      metadata: {
        createdAt: now,
        createdBy: mockUser,
        lastUpdated: now,
        lastUpdatedBy: mockUser
      },
      searchIndex: {
        makeModel: `${formData.make} ${formData.model}`,
        yearMakeModel: `${formData.year} ${formData.make} ${formData.model}`,
        priceRange: getPriceRange(formData.totalPrice || 0)
      },
      dateAdded: now,
      lastStatusUpdate: now,
      hasLift: false,
      hasWheels: false,
      hasTires: false,
      hasPaintMatch: false,
      hasLeather: false,
      hasOther: false
    }
    setVehicles([...vehicles, vehicle])
    setShowNewVehicleForm(false)
  }

  const handleVehicleUpdate = (updatedVehicle: Vehicle) => {
    const now = new Date().toISOString()
    const mockUser = { uid: "mock-user", name: "Mock User" } // Replace with actual user data

    const vehicle: Vehicle = {
      ...updatedVehicle,
      statusData: {
        ...updatedVehicle.statusData,
        updatedAt: now,
        updatedBy: mockUser
      },
      metadata: {
        ...updatedVehicle.metadata,
        lastUpdated: now,
        lastUpdatedBy: mockUser
      },
      lastStatusUpdate: now
    }

    setVehicles(vehicles.map(v =>
      v.id === vehicle.id ? vehicle : v
    ))
  }

  // Helper function to determine price range bucket
  const getPriceRange = (price: number): string => {
    if (price < 20000) return "Under $20k"
    if (price < 30000) return "$20k-$30k"
    if (price < 40000) return "$30k-$40k"
    if (price < 50000) return "$40k-$50k"
    return "Over $50k"
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex items-center gap-4">
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
              <SelectItem value="OTHER">Other</SelectItem>
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
          <div className="ml-auto">
            <Button onClick={() => setShowNewVehicleForm(!showNewVehicleForm)}>
              {showNewVehicleForm ? "Cancel" : "Add New Vehicle"}
            </Button>
          </div>
        </div>
      </div>

      {showNewVehicleForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <AddVehicleForm
            onSubmit={handleNewVehicleSubmit}
            onCancel={() => setShowNewVehicleForm(false)}
          />
        </div>
      )}

      <InventoryTable
        vehicles={filteredVehicles}
        onVehicleUpdate={handleVehicleUpdate}
        onLiftEdit={(vehicle) => {
          setSelectedVehicle(vehicle)
          setShowLiftModal(true)
        }}
      />

      {selectedVehicle && (
        <LiftDetailsModal
          isOpen={showLiftModal}
          onClose={() => {
            setShowLiftModal(false)
            setSelectedVehicle(null)
          }}
          onSave={(data) => {
            handleLiftDetailsSave(selectedVehicle.id, data)
          }}
          initialData={{
            liftDescription: selectedVehicle.liftDescription || "",
            liftPrice: selectedVehicle.liftPrice || 0,
            hasLift: selectedVehicle.hasLift,
            hasWheels: selectedVehicle.hasWheels,
            hasTires: selectedVehicle.hasTires,
            hasPaintMatch: selectedVehicle.hasPaintMatch,
            hasLeather: selectedVehicle.hasLeather,
            hasOther: selectedVehicle.hasOther
          }}
        />
      )}
    </div>
  )
}