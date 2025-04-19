"use client"

import { useState } from "react"
import Image from "next/image"
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
import { useAuth } from "@/app/components/AuthProvider"
import { hasWriteAccess, isSalesPerson } from "@/lib/auth-utils"

interface InventoryTableProps {
  vehicles: Vehicle[]
  onVehicleUpdate: (updatedVehicle: Vehicle) => Promise<void>
  onLiftEdit: (vehicle: Vehicle) => void
}

export function InventoryTable({ vehicles, onVehicleUpdate, onLiftEdit }: InventoryTableProps) {
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showSoldModal, setShowSoldModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const { user } = useAuth()
  
  // Check if user has write access
  const canEdit = hasWriteAccess(user)
  // Check if user is a salesperson (view-only)
  const isViewOnly = isSalesPerson(user)

  const handleSoldConfirm = async (soldDetails: {
    locationSold: string
    deskManagerName: string
    financeManagerName: string
    salespersonName: string
    dealNumber: string
    dateSold: string
  }) => {
    if (selectedVehicle) {
      const mockUser = { uid: "mock-user", name: "Mock User" } // Replace with actual user data
      const updatedVehicle: Vehicle = {
        ...selectedVehicle,
        status: "SOLD",
        statusData: {
          current: "Sold",
          updatedAt: new Date().toISOString(),
          updatedBy: mockUser,
          soldDetails
        },
        lastStatusUpdate: new Date().toISOString()
      }
      await onVehicleUpdate(updatedVehicle)
      setShowSoldModal(false)
      setSelectedVehicle(updatedVehicle)
    }
  }

  const handleDepositConfirm = async (depositDetails: {
    locationSold: string
    deskManagerName: string
    dealNumber: string
    depositAmount: number
  }) => {
    if (selectedVehicle) {
      const mockUser = { uid: "mock-user", name: "Mock User" } // Replace with actual user data
      const updatedVehicle: Vehicle = {
        ...selectedVehicle,
        status: "DEPOSIT",
        statusData: {
          current: "Deposit",
          updatedAt: new Date().toISOString(),
          updatedBy: mockUser,
          depositDetails
        },
        lastStatusUpdate: new Date().toISOString()
      }
      await onVehicleUpdate(updatedVehicle)
      setShowDepositModal(false)
      setSelectedVehicle(updatedVehicle)
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
    <>
      <style jsx global>{`
        .no-chevron > svg {
          display: none !important;
        }
      `}</style>
      <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Location</th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Stock</th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Vehicle</th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Specs</th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Color</th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Price/Mileage</th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Adds?</th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {vehicles.map((vehicle) => (
            <tr
              key={vehicle.id}
              className={`${vehicle.status === "DEPOSIT" ? "bg-yellow-200" : ""} hover:shadow-md transition-colors cursor-pointer`}
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
              <td className="px-4 py-2 whitespace-nowrap text-center">
                <div className="flex flex-col items-center text-xs gap-1">
                  <div className="w-4 h-4 border border-gray-300 rounded" style={{ backgroundColor: vehicle.exteriorColor }}></div>
                  <div>{vehicle.exteriorColor}</div>
                </div>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-center">
                <div className="text-xs">
                  <div className="font-medium">${vehicle.totalPrice.toLocaleString()}</div>
                  <div>{vehicle.mileage.toLocaleString()} miles</div>
                </div>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-center">
                <div className="flex justify-center">
                  {vehicle.hasLift || vehicle.hasWheels || vehicle.hasTires || vehicle.hasPaintMatch || vehicle.hasLeather || vehicle.hasOther ? (
                    <Image src="/liftedtruck.svg" alt="Has adds" width={24} height={24} />
                  ) : (
                    <Image src="/noadds.svg" alt="No adds" width={24} height={24} />
                  )}
                </div>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-center">
                <div className="flex justify-center">
                  {canEdit ? (
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
                          const mockUser = { uid: user?.uid || "mock-user", name: user?.displayName || "Mock User" }
                          const updatedVehicle: Vehicle = {
                            ...vehicle,
                            status: value,
                            statusData: {
                              current: mapStatusToFirebase(value),
                              updatedAt: new Date().toISOString(),
                              updatedBy: mockUser
                            },
                            lastStatusUpdate: new Date().toISOString()
                          }
                          onVehicleUpdate(updatedVehicle)
                        }
                      }}
                    >
                      <SelectTrigger className="w-[90px] h-6 text-xs py-1 border-0 shadow-none bg-transparent hover:bg-gray-100 focus:ring-0 flex justify-center no-chevron">
                        <SelectValue placeholder="Status" className="text-center" />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="AVAILABLE" className="text-xs py-1">Available</SelectItem>
                        <SelectItem value="DEPOSIT" className="text-xs py-1">Deposit</SelectItem>
                        <SelectItem value="SOLD" className="text-xs py-1">Sold</SelectItem>
                        <SelectItem value="PENDING_RECON" className="text-xs py-1">Pending Recon</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-xs">{mapStatusToFirebase(vehicle.status)}</span>
                  )}
                </div>
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
        isViewOnly={isViewOnly}
      />
    </div>
    </>
  )
}