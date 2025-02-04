"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
    liftPrice: number
    hasLift: boolean
    hasWheels: boolean
    hasTires: boolean
    hasPaintMatch: boolean
    hasLeather: boolean
    hasOther: boolean
  }) => void
  initialData?: {
    liftDescription?: string
    liftPrice?: number
    hasLift?: boolean
    hasWheels?: boolean
    hasTires?: boolean
    hasPaintMatch?: boolean
    hasLeather?: boolean
    hasOther?: boolean
  }
}

export function LiftDetailsModal({
  isOpen,
  onClose,
  onSave,
  initialData
}: LiftDetailsModalProps) {
  const [liftDescription, setLiftDescription] = useState("")
  const [liftPrice, setLiftPrice] = useState(0)
  const [hasLift, setHasLift] = useState(false)
  const [hasWheels, setHasWheels] = useState(false)
  const [hasTires, setHasTires] = useState(false)
  const [hasPaintMatch, setHasPaintMatch] = useState(false)
  const [hasLeather, setHasLeather] = useState(false)
  const [hasOther, setHasOther] = useState(false)

  useEffect(() => {
    if (initialData) {
      setLiftDescription(initialData.liftDescription || "")
      setLiftPrice(initialData.liftPrice || 0)
      setHasLift(initialData.hasLift || false)
      setHasWheels(initialData.hasWheels || false)
      setHasTires(initialData.hasTires || false)
      setHasPaintMatch(initialData.hasPaintMatch || false)
      setHasLeather(initialData.hasLeather || false)
      setHasOther(initialData.hasOther || false)
    }
  }, [initialData])

  const resetForm = () => {
    setLiftDescription("")
    setLiftPrice(0)
    setHasLift(false)
    setHasWheels(false)
    setHasTires(false)
    setHasPaintMatch(false)
    setHasLeather(false)
    setHasOther(false)
  }

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  const handleSave = () => {
    onSave({
      liftDescription,
      liftPrice,
      hasLift,
      hasWheels,
      hasTires,
      hasPaintMatch,
      hasLeather,
      hasOther
    })
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
                onCheckedChange={(checked) => setHasLift(checked as boolean)}
              />
              <label htmlFor="hasLift" className="text-sm font-medium">
                Lift
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasWheels"
                checked={hasWheels}
                onCheckedChange={(checked) => setHasWheels(checked as boolean)}
              />
              <label htmlFor="hasWheels" className="text-sm font-medium">
                Wheels
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasTires"
                checked={hasTires}
                onCheckedChange={(checked) => setHasTires(checked as boolean)}
              />
              <label htmlFor="hasTires" className="text-sm font-medium">
                Tires
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasPaintMatch"
                checked={hasPaintMatch}
                onCheckedChange={(checked) => setHasPaintMatch(checked as boolean)}
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
            <label htmlFor="liftPrice" className="text-sm font-medium">
              Price
            </label>
            <Input
              id="liftPrice"
              type="number"
              value={liftPrice}
              onChange={(e) => setLiftPrice(Number(e.target.value))}
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