"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (depositDetails: {
    locationSold: string
    deskManagerName: string
    dealNumber: string
    depositAmount: number
  }) => void
}

export function DepositModal({ isOpen, onClose, onConfirm }: DepositModalProps) {
  const [formData, setFormData] = useState({
    locationSold: "",
    deskManagerName: "",
    dealNumber: "",
    depositAmount: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.locationSold.trim()) {
      newErrors.locationSold = "Location Sold is required"
    }
    if (!formData.deskManagerName.trim()) {
      newErrors.deskManagerName = "Desk Manager Name is required"
    }
    if (!formData.dealNumber.trim()) {
      newErrors.dealNumber = "Deal Number is required"
    }
    if (!formData.depositAmount || formData.depositAmount <= 0) {
      newErrors.depositAmount = "Deposit Amount must be greater than 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onConfirm(formData)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Deposit</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Input
              placeholder="Location Sold"
              value={formData.locationSold}
              onChange={(e) =>
                setFormData({ ...formData, locationSold: e.target.value })
              }
              className={errors.locationSold ? "border-red-500" : ""}
            />
            {errors.locationSold && (
              <span className="text-xs text-red-500">{errors.locationSold}</span>
            )}
          </div>
          <div className="grid gap-2">
            <Input
              placeholder="Desk Manager Name"
              value={formData.deskManagerName}
              onChange={(e) =>
                setFormData({ ...formData, deskManagerName: e.target.value })
              }
              className={errors.deskManagerName ? "border-red-500" : ""}
            />
            {errors.deskManagerName && (
              <span className="text-xs text-red-500">
                {errors.deskManagerName}
              </span>
            )}
          </div>
          <div className="grid gap-2">
            <Input
              placeholder="Deal Number"
              value={formData.dealNumber}
              onChange={(e) =>
                setFormData({ ...formData, dealNumber: e.target.value })
              }
              className={errors.dealNumber ? "border-red-500" : ""}
            />
            {errors.dealNumber && (
              <span className="text-xs text-red-500">{errors.dealNumber}</span>
            )}
          </div>
          <div className="grid gap-2">
            <Input
              type="number"
              placeholder="Deposit Amount"
              value={formData.depositAmount || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  depositAmount: parseFloat(e.target.value) || 0,
                })
              }
              className={errors.depositAmount ? "border-red-500" : ""}
            />
            {errors.depositAmount && (
              <span className="text-xs text-red-500">{errors.depositAmount}</span>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Confirm Deposit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}