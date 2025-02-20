"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { DailyLogEntry } from "../daily-log/types"
import { getDailyLogEntryById } from "../daily-log/services/dailyLogService"

export default function SoldLogPage() {
  const searchParams = useSearchParams()
  const entryId = searchParams.get("entry")
  const [entry, setEntry] = useState<DailyLogEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEntry() {
      if (!entryId) {
        setError("No entry ID provided")
        setLoading(false)
        return
      }

      try {
        const entryData = await getDailyLogEntryById(entryId)
        if (entryData) {
          setEntry(entryData)
        } else {
          setError("Entry not found")
        }
      } catch (err) {
        setError("Failed to load entry data")
        console.error("Error loading entry:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchEntry()
  }, [entryId])

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Sales Log Entry</h1>
      
      {entry ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-semibold mb-2">Customer Information</h3>
              <p className="text-sm">Name: {entry.customerName}</p>
              <p className="text-sm">Phone: {entry.customerPhone}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Vehicle Information</h3>
              <p className="text-sm">Stock #: {entry.stockNumber}</p>
              <p className="text-sm">Vehicle: {entry.voi}</p>
            </div>
          </div>
          
          {/* Add your sales log form fields here */}
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Additional sales log fields will be added here based on your requirements
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading entry data...</p>
        </div>
      )}
    </div>
  )
}