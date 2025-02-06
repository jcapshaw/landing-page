"use client"

import { Vehicle } from "../types"

interface VehicleDetailsViewProps {
  vehicle: Vehicle
}

export function VehicleDetailsView({ vehicle }: VehicleDetailsViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Stock Number:</span>
              <p className="text-gray-600">{vehicle.stock || "N/A"}</p>
            </div>
            <div>
              <span className="font-medium">Year:</span>
              <p className="text-gray-600">{vehicle.year}</p>
            </div>
            <div>
              <span className="font-medium">Make:</span>
              <p className="text-gray-600">{vehicle.make}</p>
            </div>
            <div>
              <span className="font-medium">Model:</span>
              <p className="text-gray-600">{vehicle.model}</p>
            </div>
            <div>
              <span className="font-medium">Trim:</span>
              <p className="text-gray-600">{vehicle.trim || "N/A"}</p>
            </div>
            <div>
              <span className="font-medium">Exterior Color:</span>
              <p className="text-gray-600">{vehicle.exteriorColor}</p>
            </div>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Vehicle Details</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium">VIN:</span>
              <p className="text-gray-600">{vehicle.vin}</p>
            </div>
            <div>
              <span className="font-medium">Location:</span>
              <p className="text-gray-600">{vehicle.location}</p>
            </div>
            <div>
              <span className="font-medium">Total Price:</span>
              <p className="text-gray-600">${vehicle.totalPrice.toLocaleString()}</p>
            </div>
            <div>
              <span className="font-medium">Mileage:</span>
              <p className="text-gray-600">{vehicle.mileage.toLocaleString()} miles</p>
            </div>
            <div>
              <span className="font-medium">Transmission:</span>
              <p className="text-gray-600">{vehicle.transmission}</p>
            </div>
            <div>
              <span className="font-medium">Fuel Type:</span>
              <p className="text-gray-600">{vehicle.fuelType}</p>
            </div>
            <div>
              <span className="font-medium">Engine Size:</span>
              <p className="text-gray-600">{vehicle.engineSize || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Additional Details</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Description:</span>
              <p className="text-gray-600">{vehicle.description || "N/A"}</p>
            </div>
            <div>
              <span className="font-medium">Addendum:</span>
              <p className="text-gray-600">{vehicle.hasLift ? "Yes" : "No"}</p>
              {vehicle.hasLift && (
                <div className="pl-4 space-y-1 text-sm text-gray-600">
                  {vehicle.additions?.lift && (
                    <p>Lift: {vehicle.additions.lift.description}</p>
                  )}
                  {vehicle.additions?.wheels && <p>• Wheels</p>}
                  {vehicle.additions?.tires && <p>• Tires</p>}
                  {vehicle.additions?.paintMatch && <p>• Paint Match</p>}
                  {vehicle.additions?.leather && <p>• Leather</p>}
                  {vehicle.additions?.other && vehicle.additions.other.length > 0 && <p>• Other</p>}
                  <p className="font-medium">Total Addendum: ${vehicle.additions?.totalPrice.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}