"use client"

import { useState } from "react"
import { DatePicker } from "@/components/ui/date-picker"
import { DailyLogEntry } from "../types"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

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
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<DailyLogEntry | null>(null)

  const handleStatusChange = (entry: DailyLogEntry, value: DailyLogEntry["status"]) => {
    if (value === "SOLD!") {
      setSelectedEntry(entry)
      setDialogOpen(true)
    } else {
      onEntryUpdate({ ...entry, status: value })
    }
  }

  const handleBoardDeal = () => {
    if (selectedEntry) {
      onEntryUpdate({ ...selectedEntry, status: "SOLD!" })
      router.push(`/sold-log?entry=${selectedEntry.id}`)
    }
    setDialogOpen(false)
  }

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
          <div className="max-w-[240px]">
            <DatePicker
              date={selectedDate}
              onSelect={onDateChange}
              className="h-8 text-xs"
            />
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {isLoading ? null : (
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
              <th className="px-4 py-2 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">Manager</th>
              <th className="px-4 py-2 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">Stock #</th>
              <th className="px-4 py-2 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
              <th className="px-4 py-2 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-4 py-2 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">Trade</th>
              <th className="px-4 py-2 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-2 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">Comments</th>
              <th className="px-4 py-2 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? null : (
              <>
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className={
                      entry.status === "SOLD!"
                        ? "bg-green-50"
                        : entry.status === "DEPOSIT"
                        ? "bg-yellow-50"
                        : ""
                    }
                  >
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-center">
                      {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <div className="text-xs">
                        <div>{entry.hasAppointment}</div>
                        <div className="flex flex-col gap-1">
                          {entry.isBeBack && (
                            <div className="text-gray-500 text-[10px]">Be Back</div>
                          )}
                          {entry.isBDC && (
                            <div className="text-blue-500 text-[10px]">BDC</div>
                          )}
                        </div>
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
                      {entry.salesManager || "-"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-center">
                      {entry.stockNumber}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-center">
                      {entry.voi}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <div className="text-xs">
                        <div>{entry.customerName}</div>
                        <div className="text-gray-500 text-[10px]">{entry.customerPhone}</div>
                      </div>
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
                          handleStatusChange(entry, value)
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
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-center">
                      {entry.comments || "-"}
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
                    <td colSpan={11} className="px-4 py-2 text-center text-xs text-gray-500">
                      No entries found for this date
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent aria-describedby="dialog-description">
          <p id="dialog-description" className="text-sm text-gray-500 mb-4">
            Click Yes to proceed to the sales log entry form.
          </p>
          <DialogHeader>
            <DialogTitle>Want to board the deal now?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              No
            </Button>
            <Button onClick={handleBoardDeal}>
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}