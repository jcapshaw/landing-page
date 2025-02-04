"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { Truck } from "lucide-react"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { LiftDetailsModal } from "./LiftDetailsModal"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { decodeVIN } from "@/TestingCode/vinDecoderService"
import DecodedVehicle from "@/TestingCode/DecodedVehicle"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Vehicle } from "../types"

const vehicleSchema = z.object({
  location: z.string().min(1, "Location is required"),
  stock: z.string().default(""),
  year: z.string().min(1, "Year is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  trim: z.string().optional(),
  totalPrice: z.number().min(0, "Price must be positive"),
  mileage: z.number().min(0, "Mileage must be positive"),
  vin: z.string().min(17, "VIN must be 17 characters").max(17, "VIN must be 17 characters"),
  exteriorColor: z.string().min(1, "Exterior color is required"),
  engineSize: z.string().optional(),
  transmission: z.enum(["Automatic", "Manual", "CVT", "Other"]),
  fuelType: z.enum(["Gasoline", "Diesel", "Electric", "Hybrid", "Other"]),
  hasLift: z.boolean().default(false),
  hasWheels: z.boolean().default(false),
  hasTires: z.boolean().default(false),
  hasPaintMatch: z.boolean().default(false),
  hasLeather: z.boolean().default(false),
  hasOther: z.boolean().default(false),
  liftDescription: z.string().optional(),
  liftPrice: z.number().optional(),
  description: z.string().optional(),
  additions: z.object({
    lift: z.object({
      description: z.string(),
      price: z.number(),
      installed: z.boolean()
    }).optional(),
    wheels: z.object({
      description: z.string(),
      price: z.number(),
      installed: z.boolean()
    }).optional(),
    tires: z.object({
      description: z.string(),
      price: z.number(),
      installed: z.boolean()
    }).optional(),
    paintMatch: z.object({
      description: z.string(),
      price: z.number(),
      completed: z.boolean()
    }).optional(),
    leather: z.object({
      description: z.string(),
      price: z.number(),
      installed: z.boolean()
    }).optional(),
    other: z.array(z.object({
      description: z.string(),
      price: z.number(),
      completed: z.boolean()
    })).optional(),
    totalPrice: z.number()
  }).default({
    totalPrice: 0
  })
})

type VehicleFormData = z.infer<typeof vehicleSchema>

interface EditVehicleFormProps {
  vehicle: Vehicle
  onSubmit: (data: VehicleFormData) => void
  onCancel: () => void
}

export function EditVehicleForm({ vehicle, onSubmit, onCancel }: EditVehicleFormProps) {
  const [isDecoding, setIsDecoding] = useState(false)
  const [isLiftModalOpen, setIsLiftModalOpen] = useState(false)
  const [liftDetails, setLiftDetails] = useState({
    liftDescription: vehicle.liftDescription || "",
    liftPrice: vehicle.liftPrice || 0,
    hasLift: vehicle.hasLift || false,
    hasWheels: vehicle.hasWheels || false,
    hasTires: vehicle.hasTires || false,
    hasPaintMatch: vehicle.hasPaintMatch || false,
    hasLeather: vehicle.hasLeather || false,
    hasOther: vehicle.hasOther || false
  })

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      location: vehicle.location,
      stock: vehicle.stock,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      trim: vehicle.trim,
      totalPrice: vehicle.totalPrice,
      mileage: vehicle.mileage,
      vin: vehicle.vin,
      exteriorColor: vehicle.exteriorColor,
      engineSize: vehicle.engineSize,
      transmission: vehicle.transmission,
      fuelType: vehicle.fuelType,
      description: vehicle.description,
      hasLift: vehicle.hasLift,
      hasWheels: vehicle.hasWheels,
      hasTires: vehicle.hasTires,
      hasPaintMatch: vehicle.hasPaintMatch,
      hasLeather: vehicle.hasLeather,
      hasOther: vehicle.hasOther,
      liftDescription: vehicle.liftDescription,
      liftPrice: vehicle.liftPrice,
      additions: vehicle.additions
    },
  })

  const handleLiftDetailsSubmit = (data: {
    liftDescription: string
    liftPrice: number
    hasLift: boolean
    hasWheels: boolean
    hasTires: boolean
    hasPaintMatch: boolean
    hasLeather: boolean
    hasOther: boolean
  }) => {
    setLiftDetails(data)
    
    // Set the basic lift fields
    form.setValue("liftDescription", data.liftDescription)
    form.setValue("liftPrice", data.liftPrice)
    form.setValue("hasLift", data.hasLift)
    form.setValue("hasWheels", data.hasWheels)
    form.setValue("hasTires", data.hasTires)
    form.setValue("hasPaintMatch", data.hasPaintMatch)
    form.setValue("hasLeather", data.hasLeather)
    form.setValue("hasOther", data.hasOther)

    // Set up the additions object with all selected addendums
    const additions = {
      lift: data.hasLift ? {
        description: data.liftDescription,
        price: data.liftPrice,
        installed: true
      } : undefined,
      wheels: data.hasWheels ? {
        description: "Custom Wheels",
        price: 0,
        installed: true
      } : undefined,
      tires: data.hasTires ? {
        description: "Custom Tires",
        price: 0,
        installed: true
      } : undefined,
      paintMatch: data.hasPaintMatch ? {
        description: "Paint Match",
        price: 0,
        completed: true
      } : undefined,
      leather: data.hasLeather ? {
        description: "Leather Interior",
        price: 0,
        installed: true
      } : undefined,
      other: data.hasOther ? [{
        description: "Other Modifications",
        price: 0,
        completed: true
      }] : undefined,
      totalPrice: data.liftPrice
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
      form.setValue("liftPrice", 0)
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
        liftPrice: 0,
        hasLift: false,
        hasWheels: false,
        hasTires: false,
        hasPaintMatch: false,
        hasLeather: false,
        hasOther: false
      })
    }
  }

  const handleDecodeVin = async () => {
    const vin = form.getValues("vin")

    if (!vin || vin.length !== 17) {
      form.setError("vin", { message: "Valid VIN required for decoding" })
      return
    }

    try {
      setIsDecoding(true)
      const response = await decodeVIN(vin)
      const decodedVehicle = new DecodedVehicle(response.Results)
      const attributeMap = DecodedVehicle.getAttributeMap()

      // Update form fields with decoded information
      const year = decodedVehicle.getAttributeValue(attributeMap.model_year)
      if (year) form.setValue("year", year)

      const make = decodedVehicle.getAttributeValue(attributeMap.make)
      if (make) form.setValue("make", make)

      const model = decodedVehicle.getAttributeValue(attributeMap.model)
      if (model) form.setValue("model", model)

      const trim = decodedVehicle.getAttributeValue(attributeMap.trim)
      if (trim) form.setValue("trim", trim)

      const fuelType = decodedVehicle.getAttributeValue(attributeMap.fuel_type)
      if (fuelType) {
        const mappedFuelType = mapFuelType(fuelType)
        form.setValue("fuelType", mappedFuelType)
      }

      const displacement = decodedVehicle.getAttributeValue(attributeMap.displacement_l)
      if (displacement) {
        form.setValue("engineSize", `${displacement}L`)
      }

    } catch (error) {
      console.error("Error decoding VIN:", error)
      form.setError("vin", { message: "Error decoding VIN. Please try again." })
    } finally {
      setIsDecoding(false)
    }
  }

  const mapFuelType = (apiFuelType: string): "Gasoline" | "Diesel" | "Electric" | "Hybrid" | "Other" => {
    const fuelTypeMap: { [key: string]: "Gasoline" | "Diesel" | "Electric" | "Hybrid" | "Other" } = {
      "Gasoline": "Gasoline",
      "Diesel": "Diesel",
      "Electric": "Electric",
      "Hybrid": "Hybrid"
    }
    
    return fuelTypeMap[apiFuelType] || "Other"
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter stock number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl>
                    <Input placeholder="YYYY" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="make"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Make</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter make" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter model" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trim"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trim</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter trim" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="exteriorColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exterior Color</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter exterior color" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Vehicle Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Vehicle Details</h3>
            
            <FormField
              control={form.control}
              name="totalPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Price</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter total price" 
                      {...field} 
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mileage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mileage</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter mileage" 
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VIN</FormLabel>
                  <div className="flex space-x-2">
                    <FormControl>
                      <Input
                        placeholder="Enter 17-character VIN"
                        maxLength={17}
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="default"
                      onClick={handleDecodeVin}
                      disabled={isDecoding}
                      className="hover:bg-orange-500 hover:border-orange-500 transition-colors flex gap-2 items-center"
                    >
                      {isDecoding ? (
                        <>
                          <Truck className="h-4 w-4 animate-bounce" />
                        </>
                      ) : (
                        "Decode"
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transmission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transmission</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transmission type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Automatic">Automatic</SelectItem>
                      <SelectItem value="Manual">Manual</SelectItem>
                      <SelectItem value="CVT">CVT</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fuelType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuel Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Gasoline">Gasoline</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Electric">Electric</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="engineSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Engine Size</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Engine size in liters"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Details</h3>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter vehicle description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hasLift"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={handleHasLiftChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Addendum
                    </FormLabel>
                    <FormDescription>
                      Check if the vehicle has any dealer installed equipment.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Save Changes
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
  )
}