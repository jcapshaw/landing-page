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
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">
        {vehicle.stock || "N/A"} {vehicle.year} {vehicle.make} {vehicle.model} ${vehicle.totalPrice.toLocaleString()}
      </h2>
      {depositDetails && (
        <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Deposit Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Location Sold:</span>
              <p className="text-gray-600">{depositDetails.locationSold}</p>
            </div>
            <div>
              <span className="font-medium">Desk Manager:</span>
              <p className="text-gray-600">{depositDetails.deskManagerName}</p>
            </div>
            <div>
              <span className="font-medium">Deal Number:</span>
              <p className="text-gray-600">{depositDetails.dealNumber}</p>
            </div>
            <div>
              <span className="font-medium">Deposit Amount:</span>
              <p className="text-gray-600">${depositDetails.depositAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        {/* Column 1 */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div>
              <span className="font-medium">VIN:</span>
              <p className="text-gray-600">{vehicle.vin}</p>
            </div>
            <div>
              <span className="font-medium">Trim:</span>
              <p className="text-gray-600">{vehicle.trim || "N/A"}</p>
            </div>
            <div>
              <span className="font-medium">Exterior Color:</span>
              <p className="text-gray-600">{vehicle.exteriorColor}</p>
            </div>
            <div>
              <span className="font-medium">Mileage:</span>
              <p className="text-gray-600">{vehicle.mileage.toLocaleString()} miles</p>
            </div>
            <div>
              <span className="font-medium">Transmission:</span>
              <p className="text-gray-600">{vehicle.transmission}</p>
            </div>
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div>
              <span className="font-medium">Fuel Type:</span>
              <p className="text-gray-600">{vehicle.fuelType}</p>
            </div>
            <div>
              <span className="font-medium">Engine Size:</span>
              <p className="text-gray-600">{vehicle.engineSize || "N/A"}</p>
            </div>
            <div>
              <span className="font-medium">Location:</span>
              <p className="text-gray-600">{vehicle.location}</p>
            </div>
          </div>
        </div>
      </div>

     {/* Additional Details */}
     <div className="mt-6 space-y-4 text-sm">
       <div>
         <span className="font-medium">Description:</span>
         <p className="text-gray-600">{vehicle.description || "N/A"}</p>
       </div>
       <div>
         <span className="font-medium">Addendum:</span>
         <p className="text-gray-600">
           {vehicle.hasLift || vehicle.hasWheels || vehicle.hasTires || vehicle.hasPaintMatch || vehicle.hasLeather || vehicle.hasOther ? (
             <>Yes</>
           ) : "No"}
         </p>
         {(vehicle.hasLift || vehicle.hasWheels || vehicle.hasTires || vehicle.hasPaintMatch || vehicle.hasLeather || vehicle.hasOther) && (
           <div className="pl-4 space-y-1 text-sm text-gray-600">
             {/* Display lift description if available */}
             {vehicle.liftDescription && (
               <p>Lift: {vehicle.liftDescription}</p>
             )}
             {/* Display other additions based on boolean flags */}
             {vehicle.hasWheels && <p>• Wheels</p>}
             {vehicle.hasTires && <p>• Tires</p>}
             {vehicle.hasPaintMatch && <p>• Paint Match</p>}
             {vehicle.hasLeather && <p>• Leather</p>}
             {vehicle.hasOther && <p>• Other</p>}
             <p className="font-medium">Total Addendum: ${(vehicle.additions?.totalPrice || vehicle.addsPrice || 0).toLocaleString()}</p>
           </div>
         )}
       </div>
     </div>
   </div>
 )
}