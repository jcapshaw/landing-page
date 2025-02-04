"use client"

import { useState } from 'react'
import DailyLogForm from './components/DailyLogForm'
import { DailyLogTable } from './components/DailyLogTable'
import { DailyLogEntry } from './types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function DailyLogPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [editingEntry, setEditingEntry] = useState<DailyLogEntry | null>(null)
  // TODO: Replace with actual data fetching
  const [entries, setEntries] = useState<DailyLogEntry[]>([
    {
      id: '1',
      date: new Date().toISOString(),
      hasAppointment: "NO",
      salesperson: "John Doe",
      isSplit: false,
      stockNumber: "12345",
      voi: "2024 Toyota Camry",
      hasTrade: "NO",
      customerPhone: "(555) 555-5555",
      status: "PENDING",
      createdAt: new Date().toISOString()
    }
  ])

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
    // TODO: Fetch entries for the selected date
  }

  const handleNewEntry = (formData: Omit<DailyLogEntry, 'id' | 'createdAt'>) => {
    const newEntry: DailyLogEntry = {
      ...formData,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString()
    }
    setEntries(prev => [...prev, newEntry])
  }

  const handleEntryUpdate = (updatedEntry: DailyLogEntry) => {
    setEntries(prev => 
      prev.map(entry => 
        entry.id === updatedEntry.id ? updatedEntry : entry
      )
    )
  }

  const handleEditEntry = (entry: DailyLogEntry) => {
    setEditingEntry(entry)
  }

  const handleEditSubmit = (formData: Omit<DailyLogEntry, 'id' | 'createdAt'>) => {
    if (editingEntry) {
      const updatedEntry: DailyLogEntry = {
        ...formData,
        id: editingEntry.id,
        createdAt: editingEntry.createdAt
      }
      handleEntryUpdate(updatedEntry)
      setEditingEntry(null)
    }
  }

  return (
    <div className="container mx-auto py-10 space-y-10">
      <h1 className="text-3xl font-bold">Daily Customer Log</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-6">Add New Entry</h2>
        <DailyLogForm onSubmit={handleNewEntry} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <DailyLogTable 
          entries={entries}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          onEntryUpdate={handleEntryUpdate}
          onEditEntry={handleEditEntry}
        />
      </div>

      <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Entry</DialogTitle>
          </DialogHeader>
          {editingEntry && (
            <DailyLogForm
              onSubmit={handleEditSubmit}
              initialData={editingEntry}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}