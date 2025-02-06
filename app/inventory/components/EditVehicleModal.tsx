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

interface EditVehicleModalProps {
  isOpen: boolean
  onClose: () => void
  vehicle: Vehicle | null
  onSubmit: (updatedVehicle: Vehicle) => void
  onLiftEdit: (vehicle: Vehicle) => void
}

export function EditVehicleModal({
  isOpen,
  onClose,
  vehicle,
  onSubmit,
  onLiftEdit,
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
          <EditVehicleForm
            vehicle={vehicle}
            onSubmit={(data) => {
              onSubmit({
                ...vehicle,
                ...data,
                id: vehicle.id,
                metadata: vehicle.metadata,
                searchIndex: vehicle.searchIndex,
                dateAdded: vehicle.dateAdded,
                lastStatusUpdate: vehicle.lastStatusUpdate,
              })
              handleClose()
            }}
            onCancel={handleClose}
            onLiftEdit={() => onLiftEdit(vehicle)}
          />
        ) : (
          <>
            <VehicleDetailsView vehicle={vehicle} />
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={handleEditClick}>
                Edit
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}