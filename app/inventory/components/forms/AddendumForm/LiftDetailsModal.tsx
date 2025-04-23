"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Vehicle } from "@/app/inventory/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface LiftDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    liftDescription: string
    hasLift: boolean
    hasWheels: boolean
    hasTires: boolean
    hasPaintMatch: boolean
    hasLeather: boolean
    hasOther: boolean
    addsPrice: number
    additions: {
      lift?: {
        description: string
        price: number
        installed: boolean
      }
      wheels?: {
        description: string
        price: number
        installed: boolean
      }
      tires?: {
        description: string
        price: number
        installed: boolean
      }
      paintMatch?: {
        description: string
        price: number
        completed: boolean
      }
      leather?: {
        description: string
        price: number
        installed: boolean
      }
      other?: Array<{
        description: string
        price: number
        completed: boolean
      }>
      totalPrice: number
    }
  }) => void
  initialData?: {
    liftDescription?: string
    hasLift?: boolean
    hasWheels?: boolean
    hasTires?: boolean
    hasPaintMatch?: boolean
    hasLeather?: boolean
    hasOther?: boolean
    addsPrice?: number
    additions?: {
      lift?: {
        description: string
        price: number
        installed: boolean
      }
      wheels?: {
        description: string
        price: number
        installed: boolean
      }
      tires?: {
        description: string
        price: number
        installed: boolean
      }
      paintMatch?: {
        description: string
        price: number
        completed: boolean
      }
      leather?: {
        description: string
        price: number
        installed: boolean
      }
      other?: Array<{
        description: string
        price: number
        completed: boolean
      }>
      totalPrice: number
    }
  }
}

export function LiftDetailsModal({
  isOpen,
  onClose,
  onSave,
  initialData
}: LiftDetailsModalProps) {
  const [liftDescription, setLiftDescription] = useState<string>("")
  const [hasLift, setHasLift] = useState<boolean>(false)
  const [hasWheels, setHasWheels] = useState<boolean>(false)
  const [hasTires, setHasTires] = useState<boolean>(false)
  const [hasPaintMatch, setHasPaintMatch] = useState<boolean>(false)
  const [hasLeather, setHasLeather] = useState<boolean>(false)
  const [hasOther, setHasOther] = useState<boolean>(false)
  const [addsPrice, setAddsPrice] = useState<number>(0)

  useEffect(() => {
    if (initialData) {
      // Initialize from additions structure if available
      if (initialData.additions) {
        const { additions } = initialData
        setLiftDescription(additions.lift?.description || "")
        setHasLift(!!additions.lift)
        setHasWheels(!!additions.wheels)
        setHasTires(!!additions.tires)
        setHasPaintMatch(!!additions.paintMatch)
        setHasLeather(!!additions.leather)
        setHasOther(!!additions.other)
        setAddsPrice(additions.totalPrice || 0)
      } else {
        // Fallback to legacy structure
        setLiftDescription(initialData.liftDescription || "")
        setHasLift(initialData.hasLift || false)
        setHasWheels(initialData.hasWheels || false)
        setHasTires(initialData.hasTires || false)
        setHasPaintMatch(initialData.hasPaintMatch || false)
        setHasLeather(initialData.hasLeather || false)
        setHasOther(initialData.hasOther || false)
        setAddsPrice(initialData.addsPrice || 0)
      }
    }
  }, [initialData])

  const resetForm = () => {
    setLiftDescription("")
    setHasLift(false)
    setHasWheels(false)
    setHasTires(false)
    setHasPaintMatch(false)
    setHasLeather(false)
    setHasOther(false)
    setAddsPrice(0)
  }

  // Only reset the form when opening a new modal with no initial data
  useEffect(() => {
    if (isOpen && !initialData) {
      resetForm()
    }
  }, [isOpen, initialData])

  const handleSave = () => {
    // Calculate total price from all additions
    const totalPrice = addsPrice || 0

    // Create the additions data structure with clean data (no undefined values)
    const additionsData: Vehicle['additions'] = {
      totalPrice,
    }
    
    // Only add properties that are checked/enabled
    if (hasLift) {
      additionsData.lift = {
        description: liftDescription,
        price: addsPrice,
        installed: true
      }
    }
    
    if (hasWheels) {
      additionsData.wheels = {
        description: "Custom Wheels",
        price: addsPrice / (hasLift ? 2 : 1),
        installed: true
      }
    }
    
    if (hasTires) {
      additionsData.tires = {
        description: "Custom Tires",
        price: addsPrice / (hasLift ? 2 : 1),
        installed: true
      }
    }
    
    if (hasPaintMatch) {
      additionsData.paintMatch = {
        description: "Paint Match",
        price: addsPrice / (hasLift ? 2 : 1),
        completed: true
      }
    }
    
    if (hasLeather) {
      additionsData.leather = {
        description: "Leather Interior",
        price: addsPrice / (hasLift ? 2 : 1),
        installed: true
      }
    }
    
    if (hasOther) {
      additionsData.other = [{
        description: "Other Modifications",
        price: addsPrice / (hasLift ? 2 : 1),
        completed: true
      }]
    }

    // Create the complete data object to save
    const dataToSave = {
      liftDescription,
      hasLift,
      hasWheels,
      hasTires,
      hasPaintMatch,
      hasLeather,
      hasOther,
      addsPrice: totalPrice,
      liftPrice: totalPrice, // Ensure liftPrice is also set
      additions: additionsData
    }

    // Save the data
    onSave(dataToSave)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Lift Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasLift"
                checked={hasLift}
                onCheckedChange={(checked: boolean) => setHasLift(checked)}
              />
              <label htmlFor="hasLift" className="text-sm font-medium">
                Lift
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasWheels"
                checked={hasWheels}
                onCheckedChange={(checked: boolean) => setHasWheels(checked)}
              />
              <label htmlFor="hasWheels" className="text-sm font-medium">
                Wheels
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasTires"
                checked={hasTires}
                onCheckedChange={(checked: boolean) => setHasTires(checked)}
              />
              <label htmlFor="hasTires" className="text-sm font-medium">
                Tires
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasPaintMatch"
                checked={hasPaintMatch}
                onCheckedChange={(checked: boolean) => setHasPaintMatch(checked)}
              />
              <label htmlFor="hasPaintMatch" className="text-sm font-medium">
                Paint Match
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasLeather"
                checked={hasLeather}
                onCheckedChange={(checked) => setHasLeather(checked as boolean)}
              />
              <label htmlFor="hasLeather" className="text-sm font-medium">
                Leather
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasOther"
                checked={hasOther}
                onCheckedChange={(checked) => setHasOther(checked as boolean)}
              />
              <label htmlFor="hasOther" className="text-sm font-medium">
                Other
              </label>
            </div>
          </div>
          <div className="grid gap-2">
            <label htmlFor="liftDescription" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="liftDescription"
              className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              value={liftDescription}
              onChange={(e) => setLiftDescription(e.target.value)}
              placeholder="Enter description..."
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="addsPrice" className="text-sm font-medium">
              Adds Price
            </label>
            <input
              type="number"
              id="addsPrice"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              value={addsPrice}
              onChange={(e) => setAddsPrice(Number(e.target.value))}
              min="0"
              step="0.01"
              placeholder="Enter price..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}