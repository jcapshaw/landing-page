"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface SoldModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (soldDetails: {
    locationSold: string
    salesManagerName: string
    salespersonName: string
    dealNumber: string
    dateSold: string
  }) => void
}

const salespeople = [
  "Tom White",
  "Mary Black",
  "James Green",
  "Patricia Gray"
]

export function SoldModal({ isOpen, onClose, onConfirm }: SoldModalProps) {
  const [formData, setFormData] = useState({
    locationSold: "",
    salesManagerName: "",
    salespersonName: "",
    dealNumber: "",
    dateSold: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.locationSold.trim()) {
      newErrors.locationSold = "Location Sold is required"
    }
    if (!formData.salesManagerName.trim()) {
      newErrors.salesManagerName = "Sales Manager Name is required"
    }
    if (!formData.salespersonName) {
      newErrors.salespersonName = "Salesperson Name is required"
    }
    if (!formData.dealNumber.trim()) {
      newErrors.dealNumber = "Deal Number is required"
    }
    if (!formData.dateSold) {
      newErrors.dateSold = "Date Sold is required"
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
          <DialogTitle>Confirm Sale</DialogTitle>
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
              type="date"
              value={formData.dateSold}
              onChange={(e) =>
                setFormData({ ...formData, dateSold: e.target.value })
              }
              className={errors.dateSold ? "border-red-500" : ""}
            />
            {errors.dateSold && (
              <span className="text-xs text-red-500">{errors.dateSold}</span>
            )}
          </div>
          <div className="grid gap-2">
            <Input
              placeholder="Sales Manager Name"
              value={formData.salesManagerName}
              onChange={(e) =>
                setFormData({ ...formData, salesManagerName: e.target.value })
              }
              className={errors.salesManagerName ? "border-red-500" : ""}
            />
            {errors.salesManagerName && (
              <span className="text-xs text-red-500">
                {errors.salesManagerName}
              </span>
            )}
          </div>
          <div className="grid gap-2">
            <Select
              value={formData.salespersonName}
              onValueChange={(value) =>
                setFormData({ ...formData, salespersonName: value })
              }
            >
              <SelectTrigger className={errors.salespersonName ? "border-red-500" : ""}>
                <SelectValue placeholder="Select Salesperson" />
              </SelectTrigger>
              <SelectContent>
                {salespeople.map((person) => (
                  <SelectItem key={person} value={person}>
                    {person}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.salespersonName && (
              <span className="text-xs text-red-500">
                {errors.salespersonName}
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-500 text-white"
          >
            Confirm Sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}