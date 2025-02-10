"use client"

import { useState, useEffect } from "react"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { AddVehicleForm } from "./components/forms/AddVehicleForm"
import { LiftDetailsModal } from "./components/forms/AddendumForm/LiftDetailsModal"
import { InventoryTable } from "./components/InventoryTable"
import { Vehicle } from "./types"
import { addVehicle, updateVehicle, getAllVehicles } from "../../lib/vehicles"
import { useAuth } from "../components/AuthProvider"

export default function InventoryPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("")
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [showLiftModal, setShowLiftModal] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [showNewVehicleForm, setShowNewVehicleForm] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<Vehicle["status"] | "ALL">("ALL")
  const [selectedLocation, setSelectedLocation] = useState("ALL")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const fetchedVehicles = await getAllVehicles();
        setVehicles(fetchedVehicles);
      } catch (error) {
        console.error('Error loading vehicles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVehicles();
  }, []);

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

  const handleLiftDetailsSave = async (vehicleId: string, data: {
    liftDescription: string
    hasLift: boolean
    hasWheels: boolean
    hasTires: boolean
    hasPaintMatch: boolean
    hasLeather: boolean
    hasOther: boolean
    addsPrice: number
    additions: {
      lift?: { description: string; price: number; installed: boolean }
      wheels?: { description: string; price: number; installed: boolean }
      tires?: { description: string; price: number; installed: boolean }
      paintMatch?: { description: string; price: number; completed: boolean }
      leather?: { description: string; price: number; installed: boolean }
      totalPrice: number
    }
  }) => {
    if (!user) return;

    try {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (!vehicle) return;

      const updatedVehicle = {
        ...vehicle,
        liftDescription: data.liftDescription,
        addsPrice: data.addsPrice,
        hasLift: data.hasLift,
        hasWheels: data.hasWheels,
        hasTires: data.hasTires,
        hasPaintMatch: data.hasPaintMatch,
        hasLeather: data.hasLeather,
        hasOther: data.hasOther,
        additions: data.additions,
        metadata: {
          ...vehicle.metadata,
          lastUpdated: new Date().toISOString(),
          lastUpdatedBy: { uid: user.uid, name: user.displayName || 'Unknown' }
        }
      };

      await updateVehicle(vehicleId, updatedVehicle);
      const updatedVehicles = await getAllVehicles();
      setVehicles(updatedVehicles);
      setShowLiftModal(false);
      setSelectedVehicle(null);
    } catch (error) {
      console.error('Error updating vehicle lift details:', error);
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  type VehicleFormData = Omit<Vehicle, 'id' | 'dateAdded' | 'lastStatusUpdate' | 'status' | 'statusData' | 'metadata' | 'searchIndex' | 'additions'>
  
  const handleNewVehicleSubmit = async (formData: VehicleFormData) => {
    if (!user) {
      alert('You must be logged in to add vehicles');
      return;
    }

    // Skip email verification in development
    if (process.env.NODE_ENV === 'production' && !user.emailVerified) {
      alert('Your email must be verified before adding vehicles');
      return;
    }

    try {
      console.log('Starting vehicle submission process...');
      console.log('Form data received:', JSON.stringify(formData, null, 2));

      // Create the vehicle object with all required fields
      const totalPrice = Number(formData.totalPrice) || 0;
      const now = new Date().toISOString();
      const userInfo = { uid: user.uid, name: user.displayName || 'Unknown' };
      
      // Create a clean vehicle object
      const vehicle = {
        stock: formData.stock || "",
        location: formData.location,
        year: formData.year,
        make: formData.make,
        model: formData.model,
        trim: formData.trim,
        totalPrice: totalPrice,
        mileage: Number(formData.mileage) || 0,
        vin: formData.vin,
        exteriorColor: formData.exteriorColor,
        engineSize: formData.engineSize,
        transmission: formData.transmission,
        fuelType: formData.fuelType,
        description: formData.description,
        status: "AVAILABLE" as const,
        statusData: {
          current: "Available" as const,
          updatedAt: now,
          updatedBy: userInfo
        },
        additions: {
          totalPrice: 0
        },
        metadata: {
          createdAt: now,
          createdBy: userInfo,
          lastUpdated: now,
          lastUpdatedBy: userInfo
        },
        searchIndex: {
          makeModel: `${formData.make} ${formData.model}`.trim(),
          yearMakeModel: `${formData.year} ${formData.make} ${formData.model}`.trim(),
          priceRange: getPriceRange(totalPrice)
        },
        dateAdded: now,
        lastStatusUpdate: now,
        hasLift: formData.hasLift || false,
        hasWheels: formData.hasWheels || false,
        hasTires: formData.hasTires || false,
        hasPaintMatch: formData.hasPaintMatch || false,
        hasLeather: formData.hasLeather || false,
        hasOther: formData.hasOther || false,
        needsSmog: formData.needsSmog || false
      };

      console.log('Submitting vehicle data:', vehicle);
      const newVehicleId = await addVehicle(vehicle);
      console.log('Vehicle added successfully with ID:', newVehicleId);
      
      console.log('Fetching updated vehicle list...');
      const updatedVehicles = await getAllVehicles();
      console.log('Updated vehicles list:', updatedVehicles.length, 'vehicles');
      
      console.log('Updating state and closing form...');
      setVehicles(updatedVehicles);
      setShowNewVehicleForm(false);
      alert('Vehicle added successfully!');
    } catch (error) {
      console.error('Error in handleNewVehicleSubmit:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        alert(`Error adding vehicle: ${error.message}`);
      } else {
        alert('An unknown error occurred while adding the vehicle');
      }
    }
  }

  const handleVehicleUpdate = async (updatedVehicle: Vehicle) => {
    if (!user) return;

    try {
      const vehicle: Vehicle = {
        ...updatedVehicle,
        statusData: {
          ...updatedVehicle.statusData,
          updatedAt: new Date().toISOString(),
          updatedBy: { uid: user.uid, name: user.displayName || 'Unknown' }
        },
        metadata: {
          ...updatedVehicle.metadata,
          lastUpdated: new Date().toISOString(),
          lastUpdatedBy: { uid: user.uid, name: user.displayName || 'Unknown' }
        },
        lastStatusUpdate: new Date().toISOString()
      }

      await updateVehicle(vehicle.id, vehicle);
      const updatedVehicles = await getAllVehicles();
      setVehicles(updatedVehicles);
    } catch (error) {
      console.error('Error updating vehicle:', error);
    }
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
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
        onLiftEdit={(vehicle: Vehicle) => {
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
          onSave={(data: {
            liftDescription: string;
            hasLift: boolean;
            hasWheels: boolean;
            hasTires: boolean;
            hasPaintMatch: boolean;
            hasLeather: boolean;
            hasOther: boolean;
            addsPrice: number;
            additions: {
              lift?: { description: string; price: number; installed: boolean };
              wheels?: { description: string; price: number; installed: boolean };
              tires?: { description: string; price: number; installed: boolean };
              paintMatch?: { description: string; price: number; completed: boolean };
              leather?: { description: string; price: number; installed: boolean };
              totalPrice: number;
            };
          }) => {
            handleLiftDetailsSave(selectedVehicle.id, data)
          }}
          initialData={{
            liftDescription: selectedVehicle.liftDescription || "",
            addsPrice: selectedVehicle.addsPrice || 0,
            hasLift: selectedVehicle.hasLift,
            hasWheels: selectedVehicle.hasWheels,
            hasTires: selectedVehicle.hasTires,
            hasPaintMatch: selectedVehicle.hasPaintMatch,
            hasLeather: selectedVehicle.hasLeather,
            hasOther: selectedVehicle.hasOther,
            additions: selectedVehicle.additions
          }}
        />
      )}
    </div>
  )
}