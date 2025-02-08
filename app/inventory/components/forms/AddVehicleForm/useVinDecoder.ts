import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { decodeVIN } from "@/TestingCode/vinDecoderService"
import { VehicleFormData } from "@/app/inventory/schemas/vehicle.schema"
import DecodedVehicle from "@/TestingCode/DecodedVehicle"

export const useVinDecoder = (form: UseFormReturn<VehicleFormData>) => {
  const [isDecoding, setIsDecoding] = useState(false)

  const mapFuelType = (apiFuelType: string): "Gasoline" | "Diesel" | "Electric" | "Hybrid" | "Other" => {
    const fuelTypeMap: { [key: string]: "Gasoline" | "Diesel" | "Electric" | "Hybrid" | "Other" } = {
      "Gasoline": "Gasoline",
      "Diesel": "Diesel",
      "Electric": "Electric",
      "Hybrid": "Hybrid"
    }
    
    return fuelTypeMap[apiFuelType] || "Other"
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

  return {
    isDecoding,
    handleDecodeVin
  }
}