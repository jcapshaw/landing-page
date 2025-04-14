"use client"

import { Vehicle } from "../types"

interface VehicleDetailsViewProps {
  vehicle: Vehicle
  depositDetails?: {
    locationSold: string
    deskManagerName: string
    dealNumber: string
    depositAmount: number
  }
}

export function VehicleDetailsView({ vehicle, depositDetails }: VehicleDetailsViewProps) {
  const formatDate = (date: { seconds: number; nanoseconds: number } | string) => {
    try {
      let timestamp: Date;
      
      if (typeof date === 'string') {
        timestamp = new Date(date);
      } else if (date && 'seconds' in date) {
        timestamp = new Date(date.seconds * 1000);
      } else {
        throw new Error('Invalid date format');
      }

      if (isNaN(timestamp.getTime())) {
        throw new Error('Invalid timestamp');
      }

      return timestamp.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZoneName: 'short'
      });
    } catch (error) {
      console.error('Date parsing error:', error);
      return 'Invalid Date';
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm overflow-auto max-h-[80vh]">
      <div className="p-4">
        {/* Header with vehicle info */}
        <h2 className="text-lg font-semibold border-b pb-2 mb-3">
          {vehicle.stock || "N/A"} {vehicle.year} {vehicle.make} {vehicle.model}
          <span className="ml-1 text-blue-600">${vehicle.totalPrice.toLocaleString()}</span>
        </h2>
        
        {/* Main content in a compact layout */}
        <div className="space-y-3">
          {/* Deposit Information - if available */}
          {depositDetails && (
            <div className="bg-gray-50 rounded p-3 text-xs border mb-2">
              <h3 className="font-medium mb-2 text-sm">Deposit Information</h3>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <span className="font-medium block">Location:</span>
                  <span className="text-gray-600">{depositDetails.locationSold}</span>
                </div>
                <div>
                  <span className="font-medium block">Manager:</span>
                  <span className="text-gray-600">{depositDetails.deskManagerName}</span>
                </div>
                <div>
                  <span className="font-medium block">Deal #:</span>
                  <span className="text-gray-600">{depositDetails.dealNumber}</span>
                </div>
                <div>
                  <span className="font-medium block">Amount:</span>
                  <span className="text-gray-600">${depositDetails.depositAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Vehicle Details - 3 column grid for more compact layout */}
          <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-xs">
            <div>
              <span className="font-medium block">VIN:</span>
              <span className="text-gray-600">{vehicle.vin}</span>
            </div>
            <div>
              <span className="font-medium block">Trim:</span>
              <span className="text-gray-600">{vehicle.trim || "N/A"}</span>
            </div>
            <div>
              <span className="font-medium block">Exterior Color:</span>
              <span className="text-gray-600">{vehicle.exteriorColor}</span>
            </div>
            <div>
              <span className="font-medium block">Mileage:</span>
              <span className="text-gray-600">{vehicle.mileage.toLocaleString()} miles</span>
            </div>
            <div>
              <span className="font-medium block">Transmission:</span>
              <span className="text-gray-600">{vehicle.transmission}</span>
            </div>
            <div>
              <span className="font-medium block">Fuel Type:</span>
              <span className="text-gray-600">{vehicle.fuelType}</span>
            </div>
            <div>
              <span className="font-medium block">Engine Size:</span>
              <span className="text-gray-600">{vehicle.engineSize || "N/A"}</span>
            </div>
            <div>
              <span className="font-medium block">Location:</span>
              <span className="text-gray-600">{vehicle.location}</span>
            </div>
          </div>
          
          {/* Description - Collapsible section */}
          <div className="mt-2 text-xs border-t pt-2">
            <details>
              <summary className="font-medium cursor-pointer">Description</summary>
              <p className="text-gray-600 mt-1 pl-2">{vehicle.description || "N/A"}</p>
            </details>
          </div>
          
          {/* Addendum - Compact display */}
          <div className="text-xs border-t pt-2">
            <details>
              <summary className="font-medium cursor-pointer">
                Addendum
                {(vehicle.hasLift || vehicle.hasWheels || vehicle.hasTires || vehicle.hasPaintMatch || vehicle.hasLeather || vehicle.hasOther) &&
                  <span className="ml-2 text-blue-600">
                    ${(vehicle.additions?.totalPrice || vehicle.addsPrice || 0).toLocaleString()}
                  </span>
                }
              </summary>
              
              {(vehicle.hasLift || vehicle.hasWheels || vehicle.hasTires || vehicle.hasPaintMatch || vehicle.hasLeather || vehicle.hasOther) ? (
                <div className="pl-2 mt-1 grid grid-cols-2 gap-x-2 text-gray-600">
                  {vehicle.liftDescription && (
                    <p className="col-span-2">Lift: {vehicle.liftDescription}</p>
                  )}
                  <div className="flex flex-wrap gap-x-4">
                    {vehicle.hasWheels && <span>• Wheels</span>}
                    {vehicle.hasTires && <span>• Tires</span>}
                    {vehicle.hasPaintMatch && <span>• Paint Match</span>}
                    {vehicle.hasLeather && <span>• Leather</span>}
                    {vehicle.hasOther && <span>• Other</span>}
                  </div>
                </div>
              ) : (
                <p className="pl-2 mt-1 text-gray-600">No addendum items</p>
              )}
            </details>
          </div>
        </div>
      </div>
    </div>
 )
}