"use client"

import { useState } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { DailyLogEntry } from "../types"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DailyLogTableProps {
  entries: DailyLogEntry[]
  selectedDate: Date
  onDateChange: (date: Date) => void
  onEntryUpdate: (updatedEntry: DailyLogEntry) => void
  onEditEntry: (entry: DailyLogEntry) => void
  isLoading: boolean
}

export function DailyLogTable({ 
  entries, 
  selectedDate, 
  onDateChange,
  onEntryUpdate,
  onEditEntry,
  isLoading
}: DailyLogTableProps) {
  // Filter entries for selected date
  const filteredEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date)
    return (
      entryDate.getFullYear() === selectedDate.getFullYear() &&
      entryDate.getMonth() === selectedDate.getMonth() &&
      entryDate.getDate() === selectedDate.getDate()
    )
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h2 className="text-base font-semibold mb-2">Daily Log Entries</h2>
          <DatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => date && onDateChange(date)}
            className="flex h-8 w-full max-w-[160px] rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="text-xs text-gray-500">
          {isLoading ? (
            "Loading entries..."
          ) : (
            `Showing ${filteredEntries.length} entries for ${selectedDate.toLocaleDateString()}`
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-4 py-2 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">Appointment</th>
              <th className="px-4 py-2 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">Salesperson</th>
              <th className="px-4 py-2 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">Stock #</th>
              <th className="px-4 py-2 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
              <th className="px-4 py-2 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-4 py-2 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">Trade</th>
              <th className="px-4 py-2 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-2 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">
                  Loading entries...
                </td>
              </tr>
            ) : (
              <>
                {filteredEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-center">
                      {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <div className="text-xs">
                        <div>{entry.hasAppointment}</div>
                        {entry.isBeBack && (
                          <div className="text-gray-500 text-[10px]">Be Back</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <div className="text-xs">
                        <div>{entry.salesperson}</div>
                        {entry.isSplit && entry.secondSalesperson && (
                          <div className="text-gray-500 text-[10px]">Split w/ {entry.secondSalesperson}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-center">
                      {entry.stockNumber}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-center">
                      {entry.voi}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-center">
                      {entry.customerPhone}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="text-xs">
                        <div>{entry.hasTrade}</div>
                        {entry.hasTrade === "YES" && entry.tradeDetails && (
                          <div className="text-gray-500 text-[10px]">{entry.tradeDetails}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <Select
                        value={entry.status}
                        onValueChange={(value: DailyLogEntry["status"]) =>
                          onEntryUpdate({ ...entry, status: value })
                        }
                      >
                        <SelectTrigger className="w-[100px] h-7 text-xs">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING" className="text-xs">PENDING</SelectItem>
                          <SelectItem value="SOLD!" className="text-xs">SOLD!</SelectItem>
                          <SelectItem value="DEPOSIT" className="text-xs">DEPOSIT</SelectItem>
                          <SelectItem value="NO DEAL" className="text-xs">NO DEAL</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 px-2"
                        onClick={() => onEditEntry(entry)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
                {!isLoading && filteredEntries.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-2 text-center text-xs text-gray-500">
                      No entries found for this date
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}