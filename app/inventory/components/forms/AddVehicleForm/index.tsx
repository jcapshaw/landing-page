"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { vehicleSchema, type VehicleFormData } from "@/app/inventory/schemas/vehicle.schema"
import { BasicInfoSection } from "./BasicInfoSection"
import { VehicleDetailsSection } from "./VehicleDetailsSection"
import { AdditionalDetailsSection } from "./AdditionalDetailsSection"
import { LiftDetailsModal } from "../../forms/AddendumForm/LiftDetailsModal"
import { useState } from "react"

interface AddVehicleFormProps {
  onSubmit: (data: VehicleFormData) => void
  onCancel: () => void
}

export function AddVehicleForm({ onSubmit, onCancel }: AddVehicleFormProps) {
  const [isLiftModalOpen, setIsLiftModalOpen] = useState(false)
  const [liftDetails, setLiftDetails] = useState({
    liftDescription: "",
    hasLift: false,
    hasWheels: false,
    hasTires: false,
    hasPaintMatch: false,
    hasLeather: false,
    hasOther: false,
    addsPrice: 0
  })

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      stock: "",
      location: "",
      year: "",
      make: "",
      model: "",
      trim: "",
      totalPrice: 0,
      mileage: 0,
      vin: "",
      exteriorColor: "",
      engineSize: "",
      transmission: "Automatic",
      fuelType: "Gasoline",
      hasLift: false,
      hasWheels: false,
      hasTires: false,
      hasPaintMatch: false,
      hasLeather: false,
      hasOther: false,
      needsSmog: false,
      liftDescription: "",
      description: "",
      additions: {
        totalPrice: 0
      }
    },
  })

  const handleLiftDetailsSubmit = (data: {
    liftDescription: string
    hasLift: boolean
    hasWheels: boolean
    hasTires: boolean
    hasPaintMatch: boolean
    hasLeather: boolean
    hasOther: boolean
    addsPrice: number
  }) => {
    setLiftDetails(data)
    
    // Set the basic lift fields
    form.setValue("liftDescription", data.liftDescription)
    form.setValue("hasLift", data.hasLift)
    form.setValue("hasWheels", data.hasWheels)
    form.setValue("hasTires", data.hasTires)
    form.setValue("hasPaintMatch", data.hasPaintMatch)
    form.setValue("hasLeather", data.hasLeather)
    form.setValue("hasOther", data.hasOther)

    // Set up the additions object with the total price
    const additions: any = {
      totalPrice: data.addsPrice
    }
    
    // Add selected modifications with their descriptions
    if (data.hasLift) {
      additions.lift = {
        description: data.liftDescription,
        installed: true
      }
    }
    
    if (data.hasWheels) {
      additions.wheels = {
        description: "Custom Wheels",
        installed: true
      }
    }
    
    if (data.hasTires) {
      additions.tires = {
        description: "Custom Tires",
        installed: true
      }
    }
    
    if (data.hasPaintMatch) {
      additions.paintMatch = {
        description: "Paint Match",
        completed: true
      }
    }
    
    if (data.hasLeather) {
      additions.leather = {
        description: "Leather Interior",
        installed: true
      }
    }
    
    if (data.hasOther) {
      additions.other = [{
        description: "Other Modifications",
        completed: true
      }]
    }
    form.setValue("additions", additions)
  }

  const handleHasLiftChange = (checked: boolean) => {
    form.setValue("hasLift", checked)
    if (checked) {
      setIsLiftModalOpen(true)
    } else {
      // Reset all addendum-related fields
      form.setValue("liftDescription", "")
      form.setValue("hasWheels", false)
      form.setValue("hasTires", false)
      form.setValue("hasPaintMatch", false)
      form.setValue("hasLeather", false)
      form.setValue("hasOther", false)
      
      // Reset the entire additions object
      form.setValue("additions", {
        lift: undefined,
        wheels: undefined,
        tires: undefined,
        paintMatch: undefined,
        leather: undefined,
        other: undefined,
        totalPrice: 0
      })
      
      setLiftDetails({
        liftDescription: "",
        hasLift: false,
        hasWheels: false,
        hasTires: false,
        hasPaintMatch: false,
        hasLeather: false,
        hasOther: false,
        addsPrice: 0
      })
    }
  }

  const handleSubmit = async (data: VehicleFormData) => {
    if (isLiftModalOpen) {
      alert('Please complete the lift details before submitting')
      return
    }

    try {
      // Let zod handle the validation through the resolver
      console.log('Form validation passed, submitting data...')
      onSubmit(data)
    } catch (error) {
      console.error('Error in form submission:', error)
      alert('Error submitting form. Please check all required fields are filled correctly.')
    }
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <BasicInfoSection form={form} />
            <VehicleDetailsSection form={form} />
            <AdditionalDetailsSection 
              form={form}
              onHasLiftChange={handleHasLiftChange}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Add Vehicle
            </Button>
          </div>
        </form>
        <LiftDetailsModal
          isOpen={isLiftModalOpen}
          onClose={() => setIsLiftModalOpen(false)}
          onSave={handleLiftDetailsSubmit}
          initialData={liftDetails}
        />
      </Form>
    </div>
  )
}