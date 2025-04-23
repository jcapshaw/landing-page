"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Vehicle } from "../types"
import { EditVehicleForm } from "./EditVehicleForm"
import { VehicleDetailsView } from "./VehicleDetailsView"
import { AccessDenied } from "@/app/components/AccessDenied"

interface EditVehicleModalProps {
  isOpen: boolean
  onClose: () => void
  vehicle: Vehicle | null
  onSubmit: (updatedVehicle: Vehicle) => void
  onLiftEdit: (vehicle: Vehicle) => void
  isViewOnly?: boolean
}

export function EditVehicleModal({
  isOpen,
  onClose,
  vehicle,
  onSubmit,
  onLiftEdit,
  isViewOnly = false
}: EditVehicleModalProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  if (!vehicle) return null

  const handleEditClick = () => {
    setShowWarning(true)
  }

  const handleConfirmEdit = () => {
    setShowWarning(false)
    setIsEditMode(true)
  }

  const handleClose = () => {
    setIsEditMode(false)
    setShowWarning(false)
    onClose()
  }

  if (showWarning) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Warning</DialogTitle>
            <DialogDescription>
              Are you sure you want to edit the vehicle details? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWarning(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmEdit}>
              Continue to Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Vehicle" : "Vehicle Details"}</DialogTitle>
        </DialogHeader>
        {isEditMode ? (
          isViewOnly ? (
            <>
              <AccessDenied
                message="You don't have permission to edit vehicle details."
                action="edit vehicles"
                role="Manager or Admin role"
              />
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setIsEditMode(false)}>
                  Back to Details
                </Button>
              </DialogFooter>
            </>
          ) : (
            <EditVehicleForm
              vehicle={vehicle}
              onSubmit={(data) => {
                // Clean up the data structure
                const cleanData = {
                  ...vehicle,
                  ...data,
                  id: vehicle.id,
                  metadata: vehicle.metadata,
                  searchIndex: vehicle.searchIndex,
                  dateAdded: vehicle.dateAdded,
                  lastStatusUpdate: vehicle.lastStatusUpdate,
                }
  
                // Clean up additions object to remove undefined values
                if (cleanData.additions) {
                  // Create a clean additions object with the proper type
                  const additions: Vehicle['additions'] = {
                    totalPrice: cleanData.additions.totalPrice || cleanData.liftPrice || 0,
                  }
                  
                  // Only include properties that are enabled (hasX is true) and have valid data
                  if (cleanData.hasLift && cleanData.additions.lift) {
                    additions.lift = {
                      description: cleanData.liftDescription || cleanData.additions.lift.description,
                      price: cleanData.liftPrice || cleanData.additions.lift.price,
                      installed: true
                    }
                  }
                  
                  if (cleanData.hasWheels && cleanData.additions.wheels) {
                    additions.wheels = cleanData.additions.wheels
                  }
                  
                  if (cleanData.hasTires && cleanData.additions.tires) {
                    additions.tires = cleanData.additions.tires
                  }
                  
                  if (cleanData.hasPaintMatch && cleanData.additions.paintMatch) {
                    additions.paintMatch = cleanData.additions.paintMatch
                  }
                  
                  if (cleanData.hasLeather && cleanData.additions.leather) {
                    additions.leather = cleanData.additions.leather
                  }
                  
                  if (cleanData.hasOther && cleanData.additions.other) {
                    additions.other = cleanData.additions.other
                  }
                  
                  // Update the cleanData with the cleaned additions
                  cleanData.additions = additions
                  
                  // Ensure the legacy fields are also set for backward compatibility
                  if (cleanData.hasLift) {
                    cleanData.liftDescription = cleanData.liftDescription || additions.lift?.description || ""
                    cleanData.liftPrice = cleanData.liftPrice || additions.lift?.price || 0
                  } else {
                    cleanData.liftDescription = ""
                    cleanData.liftPrice = 0
                  }
                  
                  // Set addsPrice for backward compatibility
                  cleanData.addsPrice = additions.totalPrice
                }
  
                onSubmit(cleanData)
                handleClose()
              }}
              onCancel={handleClose}
              onLiftEdit={() => onLiftEdit(vehicle)}
            />
          )
        ) : (
          <>
            <VehicleDetailsView
              vehicle={vehicle}
              depositDetails={vehicle.status === "DEPOSIT" ? vehicle.statusData?.depositDetails : undefined}
              soldDetails={vehicle.status === "SOLD" ? vehicle.statusData?.soldDetails : undefined}
            />
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              {!isViewOnly && (
                <Button onClick={handleEditClick}>
                  Edit
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}