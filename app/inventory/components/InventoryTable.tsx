"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Vehicle } from "../types"
import { DepositModal } from "./DepositModal"
import { SoldModal } from "./SoldModal"
import { EditVehicleModal } from "./EditVehicleModal"

interface InventoryTableProps {
  vehicles: Vehicle[]
  onVehicleUpdate: (updatedVehicle: Vehicle) => void
  onLiftEdit: (vehicle: Vehicle) => void
}

export function InventoryTable({ vehicles, onVehicleUpdate, onLiftEdit }: InventoryTableProps) {
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showSoldModal, setShowSoldModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  const handleSoldConfirm = (soldDetails: {
    locationSold: string
    deskManagerName: string
    salesManagerName: string
    salespersonName: string
    dealNumber: string
    dateSold: string
  }) => {
    if (selectedVehicle) {
      const now = new Date().toISOString()
      const mockUser = { uid: "mock-user", name: "Mock User" } // Replace with actual user data
      const updatedVehicle: Vehicle = {
        ...selectedVehicle,
        status: "SOLD",
        statusData: {
          current: "Sold",
          updatedAt: now,
          updatedBy: mockUser,
          soldDetails
        },
        lastStatusUpdate: now
      }
      onVehicleUpdate(updatedVehicle)
      setShowSoldModal(false)
      setSelectedVehicle(null)
    }
  }

  const handleDepositConfirm = (depositDetails: {
    locationSold: string
    deskManagerName: string
    dealNumber: string
    depositAmount: number
  }) => {
    if (selectedVehicle) {
      const now = new Date().toISOString()
      const mockUser = { uid: "mock-user", name: "Mock User" } // Replace with actual user data
      const updatedVehicle: Vehicle = {
        ...selectedVehicle,
        status: "DEPOSIT",
        statusData: {
          current: "Deposit",
          updatedAt: now,
          updatedBy: mockUser,
          depositDetails
        },
        lastStatusUpdate: now
      }
      onVehicleUpdate(updatedVehicle)
      setShowDepositModal(false)
      setSelectedVehicle(null)
    }
  }

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setShowEditModal(true)
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

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th className="px-4 py-2 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">Stock</th>
            <th className="px-4 py-2 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
            <th className="px-4 py-2 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">Specs</th>
            <th className="px-4 py-2 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">Color</th>
            <th className="px-4 py-2 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">Price/Mileage</th>
            <th className="px-4 py-2 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">Adds?</th>
            <th className="px-4 py-2 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {vehicles.map((vehicle) => (
            <tr
              key={vehicle.id}
              className={`${vehicle.status === "DEPOSIT" ? "bg-yellow-200" : ""} hover:bg-gray-50 transition-colors cursor-pointer`}
              onClick={() => handleEdit(vehicle)}
            >
              <td className="px-4 py-2 whitespace-nowrap text-xs text-center">
                {vehicle.location}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-center">
                {vehicle.stock}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-center">
                <div className="text-xs">
                  <div className="font-medium">{vehicle.year} {vehicle.make}</div>
                  <div>{vehicle.model} {vehicle.trim}</div>
                  <div className="text-gray-500">{vehicle.vin}</div>
                </div>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-center">
                <div className="text-xs">
                  <div>{vehicle.transmission}</div>
                  <div>{vehicle.fuelType}</div>
                  {vehicle.engineSize && ` - ${vehicle.engineSize}`}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm">
                  <div>{vehicle.exteriorColor}</div>
                </div>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-center">
                <div className="text-xs">
                  <div className="font-medium">${vehicle.totalPrice.toLocaleString()}</div>
                  <div>{vehicle.mileage.toLocaleString()} miles</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="text-sm">
                  <div>{vehicle.hasLift || vehicle.hasWheels || vehicle.hasTires || vehicle.hasPaintMatch || vehicle.hasLeather || vehicle.hasOther ? "YES" : "NO"}</div>
                  {(vehicle.hasLift || vehicle.hasWheels || vehicle.hasTires || vehicle.hasPaintMatch || vehicle.hasLeather || vehicle.hasOther) && (
                    <>
                      <div className="text-xs text-gray-600">
                        {vehicle.hasLift && "Lift"}
                        {vehicle.hasWheels && " • Wheels"}
                        {vehicle.hasTires && " • Tires"}
                        {vehicle.hasPaintMatch && " • Paint"}
                        {vehicle.hasLeather && " • Leather"}
                        {vehicle.hasOther && " • Other"}
                      </div>
                      <div className="text-center text-gray-500">+${(vehicle.additions?.totalPrice || vehicle.addsPrice || 0).toLocaleString()}</div>
                    </>
                  )}
                  {vehicle.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      Note: {vehicle.description}
                    </div>
                  )}
                  {vehicle.needsSmog && (
                    <div className="text-xs text-gray-500 mt-1">
                      Emissions: ✓
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <Select
                  value={vehicle.status}
                  onValueChange={(value: Vehicle["status"]) => {
                    if (value === "DEPOSIT") {
                      setSelectedVehicle(vehicle)
                      setShowDepositModal(true)
                    } else if (value === "SOLD") {
                      setSelectedVehicle(vehicle)
                      setShowSoldModal(true)
                    } else {
                      const now = new Date().toISOString()
                      const mockUser = { uid: "mock-user", name: "Mock User" } // Replace with actual user data
                      const updatedVehicle: Vehicle = {
                        ...vehicle,
                        status: value,
                        statusData: {
                          current: mapStatusToFirebase(value),
                          updatedAt: now,
                          updatedBy: mockUser
                        },
                        lastStatusUpdate: now
                      }
                      onVehicleUpdate(updatedVehicle)
                    }
                  }}
                >
                  <SelectTrigger className="w-[100px] h-7 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE" className="text-xs">Available</SelectItem>
                    <SelectItem value="DEPOSIT" className="text-xs">Deposit</SelectItem>
                    <SelectItem value="SOLD" className="text-xs">Sold</SelectItem>
                    <SelectItem value="PENDING_RECON" className="text-xs">Pending Recon</SelectItem>
                  </SelectContent>
                </Select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => {
          setShowDepositModal(false)
          setSelectedVehicle(null)
        }}
        onConfirm={handleDepositConfirm}
      />
      <SoldModal
        isOpen={showSoldModal}
        onClose={() => {
          setShowSoldModal(false)
          setSelectedVehicle(null)
        }}
        onConfirm={handleSoldConfirm}
      />
      <EditVehicleModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedVehicle(null)
        }}
        vehicle={selectedVehicle}
        onSubmit={onVehicleUpdate}
        onLiftEdit={onLiftEdit}
      />
    </div>
  )
}