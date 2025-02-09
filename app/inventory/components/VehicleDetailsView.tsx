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
  return (
    <div className="space-y-6">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        {/* Basic Information */}
        <div className="space-y-4">
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

        {/* Dates */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div>
              <span className="font-medium">Date Added:</span>
              <p className="text-gray-600">
                {(() => {
                  try {
                    // Parse the date string and handle timezone offset
                    const match = vehicle.dateAdded.match(
                      /^([A-Za-z]+ \d+, \d+) at (\d+:\d+:\d+ [AP]M) UTC([+-]\d+)$/
                    );
                    if (!match) return 'Invalid Date';

                    const [_, datePart, timePart, tzOffset] = match;
                    const dateStr = `${datePart} ${timePart} GMT${tzOffset}`;
                    const timestamp = new Date(dateStr);

                    if (isNaN(timestamp.getTime())) {
                      return 'Invalid Date';
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
                })()}
              </p>
            </div>
            <div>
              <span className="font-medium">Last Status Update:</span>
              <p className="text-gray-600">
                {(() => {
                  try {
                    // Parse the date string and handle timezone offset
                    const match = vehicle.lastStatusUpdate.match(
                      /^([A-Za-z]+ \d+, \d+) at (\d+:\d+:\d+ [AP]M) UTC([+-]\d+)$/
                    );
                    if (!match) return 'Invalid Date';

                    const [_, datePart, timePart, tzOffset] = match;
                    const dateStr = `${datePart} ${timePart} GMT${tzOffset}`;
                    const timestamp = new Date(dateStr);

                    if (isNaN(timestamp.getTime())) {
                      return 'Invalid Date';
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
                })()}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold">Additional Details</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Description:</span>
              <p className="text-gray-600">{vehicle.description || "N/A"}</p>
            </div>
            <div>
              <span className="font-medium">Addendum:</span>
              <p className="text-gray-600">
                {vehicle.hasLift || vehicle.hasWheels || vehicle.hasTires || vehicle.hasPaintMatch || vehicle.hasLeather || vehicle.hasOther ? (
                  <>
                    Yes - Last Updated: {(() => {
                      try {
                        const timestamp = new Date(vehicle.metadata.lastUpdated);
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
                    })()}
                  </>
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
      </div>
    </div>
  )
}