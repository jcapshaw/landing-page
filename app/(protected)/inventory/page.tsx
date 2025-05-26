"use client"

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddVehicleForm } from "@/app/inventory/components/forms/AddVehicleForm";
import { LiftDetailsModal } from "@/app/inventory/components/forms/AddendumForm/LiftDetailsModal";
import { InventoryTable } from "@/app/inventory/components/InventoryTable";
import { Vehicle } from "@/app/inventory/types";
import { addVehicle, updateVehicle, getAllVehicles } from "@/lib/vehicles";
import { useAuth } from "@/app/components/LazyAuthProvider";

export default function InventoryPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showLiftModal, setShowLiftModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showNewVehicleForm, setShowNewVehicleForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Vehicle["status"] | "ALL">("ALL");
  const [selectedLocation, setSelectedLocation] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

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

  const locations = Array.from(new Set(vehicles.map(v => v.location))).sort();

  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (vehicle.stock?.toLowerCase() || '').includes(searchLower) ||
      (vehicle.vin?.toLowerCase() || '').includes(searchLower) ||
      vehicle.make.toLowerCase().includes(searchLower) ||
      vehicle.model.toLowerCase().includes(searchLower) ||
      (vehicle.exteriorColor?.toLowerCase() || '').includes(searchLower) ||
      (vehicle.engineSize?.toLowerCase() || '').includes(searchLower) ||
      (vehicle.transmission?.toLowerCase() || '').includes(searchLower) ||
      (vehicle.fuelType?.toLowerCase() || '').includes(searchLower) ||
      (vehicle.description?.toLowerCase() || '').includes(searchLower);
    
    const matchesStatus = selectedStatus === "ALL" || vehicle.status === selectedStatus;
    const matchesLocation = selectedLocation === "ALL" || vehicle.location === selectedLocation;
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const handleLiftDetailsSave = async (vehicleId: string, data: any) => {
    if (!user) return;

    try {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (!vehicle) return;

      console.log("Saving lift details:", data);

      // Create a properly structured updated vehicle object
      const updatedVehicle = {
        ...vehicle,
        // Set legacy fields for backward compatibility
        liftDescription: data.liftDescription || "",
        liftPrice: data.addsPrice || 0,
        addsPrice: data.addsPrice || 0,
        
        // Set boolean flags
        hasLift: data.hasLift || false,
        hasWheels: data.hasWheels || false,
        hasTires: data.hasTires || false,
        hasPaintMatch: data.hasPaintMatch || false,
        hasLeather: data.hasLeather || false,
        hasOther: data.hasOther || false,
        
        // Set the additions object with proper structure
        additions: {
          totalPrice: data.addsPrice || 0,
          ...(data.additions || {})
        },
        
        // Update metadata
        metadata: {
          ...vehicle.metadata,
          lastUpdated: new Date().toISOString(),
          lastUpdatedBy: { uid: user.id, name: user.user_metadata?.full_name || user.email || 'Unknown' }
        }
      };

      // Save the updated vehicle to the database
      await updateVehicle(vehicleId, updatedVehicle);
      
      // Refresh the vehicles list
      const updatedVehicles = await getAllVehicles();
      setVehicles(updatedVehicles);
      
      // Close the modal
      setShowLiftModal(false);
      setSelectedVehicle(null);
    } catch (error) {
      console.error('Error updating vehicle lift details:', error);
    }
  };

  const handleVehicleUpdate = async (updatedVehicle: Vehicle) => {
    if (!user) return;

    try {
      const vehicle: Vehicle = {
        ...updatedVehicle,
        statusData: {
          ...updatedVehicle.statusData,
          updatedAt: new Date().toISOString(),
          updatedBy: { uid: user.id, name: user.user_metadata?.full_name || user.email || 'Unknown' }
        },
        metadata: {
          ...updatedVehicle.metadata,
          lastUpdated: new Date().toISOString(),
          lastUpdatedBy: { uid: user.id, name: user.user_metadata?.full_name || user.email || 'Unknown' }
        },
        lastStatusUpdate: new Date().toISOString()
      };

      await updateVehicle(vehicle.id, vehicle);
      const updatedVehicles = await getAllVehicles();
      setVehicles(updatedVehicles);
    } catch (error) {
      console.error('Error updating vehicle:', error);
    }
  };

  // Skip showing loading spinner
  if (isLoading) {
    return null; // Return empty instead of loading spinner
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
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="ALL" className="text-xs py-1">All Status</SelectItem>
              <SelectItem value="AVAILABLE" className="text-xs py-1">Available</SelectItem>
              <SelectItem value="DEPOSIT" className="text-xs py-1">Deposit</SelectItem>
              <SelectItem value="SOLD" className="text-xs py-1">Sold</SelectItem>
              <SelectItem value="PENDING_RECON" className="text-xs py-1">Pending Recon</SelectItem>
              <SelectItem value="OTHER" className="text-xs py-1">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-[200px] h-8 text-xs">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="ALL" className="text-xs py-1">All Locations</SelectItem>
              {locations.map(location => (
                <SelectItem key={location} value={location} className="text-xs py-1">
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="ml-auto">
            <Button
              size="sm"
              onClick={() => setShowNewVehicleForm(!showNewVehicleForm)}
            >
              {showNewVehicleForm ? "Cancel" : "Add New Vehicle"}
            </Button>
          </div>
        </div>
      </div>

      {showNewVehicleForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <AddVehicleForm
            onSubmit={async (data) => {
              if (!user) return;
              
              try {
                // Prepare the vehicle data with required metadata
                const vehicleData = {
                  ...data,
                  status: "AVAILABLE" as const, // Use const assertion to preserve the literal type
                  statusData: {
                    current: "Available" as const,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    updatedBy: { uid: user.id, name: user.user_metadata?.full_name || user.email || 'Unknown' }
                  },
                  // Create search index for filtering and searching
                  searchIndex: {
                    makeModel: `${data.make} ${data.model}`.toLowerCase(),
                    yearMakeModel: `${data.year} ${data.make} ${data.model}`.toLowerCase(),
                    priceRange: `${Math.floor(data.totalPrice / 5000) * 5000}`
                  },
                  // Add dateAdded field (will be overwritten by serverTimestamp in addVehicle function)
                  dateAdded: new Date().toISOString(),
                  metadata: {
                    createdAt: new Date().toISOString(),
                    createdBy: { uid: user.id, name: user.user_metadata?.full_name || user.email || 'Unknown' },
                    lastUpdated: new Date().toISOString(),
                    lastUpdatedBy: { uid: user.id, name: user.user_metadata?.full_name || user.email || 'Unknown' }
                  },
                  lastStatusUpdate: new Date().toISOString()
                };
                
                // Add the vehicle to the database
                await addVehicle(vehicleData);
                
                // Refresh the vehicles list
                const updatedVehicles = await getAllVehicles();
                setVehicles(updatedVehicles);
                
                // Close the form
                setShowNewVehicleForm(false);
              } catch (error) {
                console.error('Error adding vehicle:', error);
                alert('Error adding vehicle. Please try again.');
              }
            }}
            onCancel={() => setShowNewVehicleForm(false)}
          />
        </div>
      )}

      <InventoryTable
        vehicles={filteredVehicles}
        onVehicleUpdate={handleVehicleUpdate}
        onLiftEdit={(vehicle: Vehicle) => {
          setSelectedVehicle(vehicle);
          setShowLiftModal(true);
        }}
      />

      {selectedVehicle && (
        <LiftDetailsModal
          isOpen={showLiftModal}
          onClose={() => {
            setShowLiftModal(false);
            setSelectedVehicle(null);
          }}
          onSave={(data) => {
            handleLiftDetailsSave(selectedVehicle.id, data);
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
  );
}