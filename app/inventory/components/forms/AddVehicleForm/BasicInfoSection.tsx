"use client"

import { UseFormReturn } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { VehicleFormData } from "@/app/inventory/schemas/vehicle.schema"

interface BasicInfoSectionProps {
  form: UseFormReturn<VehicleFormData>
}

export function BasicInfoSection({ form }: BasicInfoSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Decode the VIN First</h3>

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
  )
}