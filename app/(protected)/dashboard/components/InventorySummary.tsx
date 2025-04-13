"use client"

import { useEffect, useState } from 'react'
import { Vehicle } from '@/app/inventory/types'
import { getAllVehicles } from '@/lib/vehicles'

interface LocationSummary {
  total: number
  available: number
  deposit: number
  sold: number
  pendingRecon: number
}

interface InventorySummaries {
  [location: string]: LocationSummary
}

export default function InventorySummary() {
  const [summaries, setSummaries] = useState<InventorySummaries>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const vehicles = await getAllVehicles()
        const summariesByLocation = vehicles.reduce((acc: InventorySummaries, vehicle: Vehicle) => {
          // Initialize location if not exists
          if (!acc[vehicle.location]) {
            acc[vehicle.location] = {
              total: 0,
              available: 0,
              deposit: 0,
              sold: 0,
              pendingRecon: 0
            }
          }

          // Increment total count
          acc[vehicle.location].total++

          // Increment specific status count
          switch (vehicle.status) {
            case 'AVAILABLE':
              acc[vehicle.location].available++
              break
            case 'DEPOSIT':
              acc[vehicle.location].deposit++
              break
            case 'SOLD':
              acc[vehicle.location].sold++
              break
            case 'PENDING_RECON':
              acc[vehicle.location].pendingRecon++
              break
          }

          return acc
        }, {})

        setSummaries(summariesByLocation)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching inventory summary:', err)
        setError('Failed to load inventory summary')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div>Loading inventory summary...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Inventory by Location</h2>
      <div className="space-y-4">
        {Object.entries(summaries).map(([location, summary]) => (
          <div key={location} className="border-b pb-2">
            <h3 className="font-medium text-sm mb-2">{location}</h3>
            <div className="grid grid-cols-5 gap-4 text-sm">
              <div className="text-center">
                <div className="text-gray-600 mb-1">Total</div>
                <div className="font-medium">{summary.total}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600 mb-1">Available</div>
                <div className="font-medium text-green-600">{summary.available}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600 mb-1">Deposit</div>
                <div className="font-medium text-yellow-600">{summary.deposit}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600 mb-1">Sold</div>
                <div className="font-medium text-blue-600">{summary.sold}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600 mb-1">Pending Recon</div>
                <div className="font-medium text-orange-600">{summary.pendingRecon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}