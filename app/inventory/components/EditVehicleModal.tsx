"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Vehicle } from "../types"
import { EditVehicleForm } from "./EditVehicleForm"

interface EditVehicleModalProps {
  isOpen: boolean
  onClose: () => void
  vehicle: Vehicle | null
  onSubmit: (updatedVehicle: Vehicle) => void
}

export function EditVehicleModal({
  isOpen,
  onClose,
  vehicle,
  onSubmit,
}: EditVehicleModalProps) {
  if (!vehicle) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Vehicle</DialogTitle>
        </DialogHeader>
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
            onClose()
          }}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}