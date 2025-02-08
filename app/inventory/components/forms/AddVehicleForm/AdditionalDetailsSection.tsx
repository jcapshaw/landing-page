"use client"

import { UseFormReturn } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { VehicleFormData } from "@/app/inventory/schemas/vehicle.schema"

interface AdditionalDetailsSectionProps {
  form: UseFormReturn<VehicleFormData>
  onHasLiftChange: (checked: boolean) => void
}

export function AdditionalDetailsSection({ 
  form,
  onHasLiftChange
}: AdditionalDetailsSectionProps) {
  return (
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
                onCheckedChange={onHasLiftChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Lift, Wheels, Tires...?
              </FormLabel>
              <FormDescription>
                Check if the vehicle has any dealer installed equipment.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="needsSmog"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Emissions
              </FormLabel>
            </div>
          </FormItem>
        )}
      />
    </div>
  )
}