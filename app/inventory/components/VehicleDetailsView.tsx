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
  soldDetails?: {
    locationSold: string
    deskManagerName: string
    financeManagerName: string
    salespersonName: string
    dealNumber: string
    dateSold: string
  }
}

export function VehicleDetailsView({ vehicle, depositDetails, soldDetails }: VehicleDetailsViewProps) {
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
        
        {/* Vehicle Image */}
        {vehicle.images && vehicle.images.length > 0 && (
          <div className="mb-4">
            <img
              src={vehicle.images[0]}
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              className="w-full h-auto max-h-64 object-cover rounded-md"
            />
          </div>
        )}
        
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

          {/* Sold Information - if available */}
          {soldDetails && (
            <div className="bg-green-50 rounded p-3 text-xs border mb-2">
              <h3 className="font-medium mb-2 text-sm">Sold Information</h3>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <span className="font-medium block">Location:</span>
                  <span className="text-gray-600">{soldDetails.locationSold}</span>
                </div>
                <div>
                  <span className="font-medium block">Desk Manager:</span>
                  <span className="text-gray-600">{soldDetails.deskManagerName}</span>
                </div>
                <div>
                  <span className="font-medium block">Finance Manager:</span>
                  <span className="text-gray-600">{soldDetails.financeManagerName}</span>
                </div>
                <div>
                  <span className="font-medium block">Salesperson:</span>
                  <span className="text-gray-600">{soldDetails.salespersonName}</span>
                </div>
                <div>
                  <span className="font-medium block">Deal #:</span>
                  <span className="text-gray-600">{soldDetails.dealNumber}</span>
                </div>
                <div>
                  <span className="font-medium block">Date Sold:</span>
                  <span className="text-gray-600">{formatDate(soldDetails.dateSold)}</span>
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
                    ${(vehicle.additions?.totalPrice || vehicle.addsPrice || vehicle.liftPrice || 0).toLocaleString()}
                  </span>
                }
              </summary>
              
              {(vehicle.hasLift || vehicle.hasWheels || vehicle.hasTires || vehicle.hasPaintMatch || vehicle.hasLeather || vehicle.hasOther) ? (
                <div className="pl-2 mt-1 grid grid-cols-2 gap-x-2 text-gray-600">
                  {/* Show lift description from either source */}
                  {(vehicle.liftDescription || vehicle.additions?.lift?.description) && (
                    <p className="col-span-2">✓ Description: {vehicle.liftDescription || vehicle.additions?.lift?.description}</p>
                  )}
                  <div className="flex flex-wrap gap-x-4">
                    {vehicle.hasWheels && <span>✓ Wheels{vehicle.additions?.wheels?.description ? `: ${vehicle.additions.wheels.description}` : ''}</span>}
                    {vehicle.hasTires && <span>✓ Tires{vehicle.additions?.tires?.description ? `: ${vehicle.additions.tires.description}` : ''}</span>}
                    {vehicle.hasPaintMatch && <span>✓ Paint Match{vehicle.additions?.paintMatch?.description ? `: ${vehicle.additions.paintMatch.description}` : ''}</span>}
                    {vehicle.hasLeather && <span>✓ Leather{vehicle.additions?.leather?.description ? `: ${vehicle.additions.leather.description}` : ''}</span>}
                    {vehicle.hasOther && <span>✓ Other{vehicle.additions?.other?.[0]?.description ? `: ${vehicle.additions.other[0].description}` : ''}</span>}
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