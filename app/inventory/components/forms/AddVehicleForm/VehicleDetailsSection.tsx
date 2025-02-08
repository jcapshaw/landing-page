"use client"

import { UseFormReturn } from "react-hook-form"
import { Truck } from "lucide-react"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { VehicleFormData } from "@/app/inventory/schemas/vehicle.schema"
import { useVinDecoder } from "./useVinDecoder"

interface VehicleDetailsSectionProps {
  form: UseFormReturn<VehicleFormData>
}

export function VehicleDetailsSection({ form }: VehicleDetailsSectionProps) {
  const { isDecoding, handleDecodeVin } = useVinDecoder(form)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Vehicle Details</h3>

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
                  <Truck className="h-4 w-4 animate-bounce" />
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
  )
}