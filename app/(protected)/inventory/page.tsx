"use client"

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { useAuth } from "@/app/components/AuthProvider";

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
  };

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
      };

      await updateVehicle(vehicle.id, vehicle);
      const updatedVehicles = await getAllVehicles();
      setVehicles(updatedVehicles);
    } catch (error) {
      console.error('Error updating vehicle:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
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
            onSubmit={() => {}}
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