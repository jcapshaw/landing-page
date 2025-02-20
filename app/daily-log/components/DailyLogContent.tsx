"use client"

import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase'
import DailyLogForm from './DailyLogForm'
import { DailyLogTable } from './DailyLogTable'
import { DailyLogEntry } from '../types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { addDailyLogEntry, getDailyLogEntries, updateDailyLogEntry } from '../services/dailyLogService'

export default function DailyLogContent() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [editingEntry, setEditingEntry] = useState<DailyLogEntry | null>(null)
  const [entries, setEntries] = useState<DailyLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch entries when date changes
  useEffect(() => {
    const fetchEntries = async () => {
      setIsLoading(true)
      try {
        const fetchedEntries = await getDailyLogEntries(selectedDate)
        setEntries(fetchedEntries)
      } catch (error) {
        console.error('Error fetching entries:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEntries()
  }, [selectedDate])

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
  }

  const handleNewEntry = async (formData: Omit<DailyLogEntry, 'id' | 'createdAt'>) => {
    console.log('handleNewEntry called with formData:', formData);
    
    if (!auth.currentUser) {
      console.error('User is not authenticated');
      return;
    }

    try {
      console.log('Current user:', auth.currentUser.uid);
      console.log('Attempting to add entry to Firestore...');
      const newEntry = await addDailyLogEntry(formData);
      console.log('Successfully added entry:', newEntry);
      setEntries(prev => [...prev, newEntry]);
    } catch (error) {
      console.error('Error adding new entry:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    }
  }

  const handleEntryUpdate = async (updatedEntry: DailyLogEntry) => {
    try {
      await updateDailyLogEntry(updatedEntry.id, updatedEntry)
      setEntries(prev => 
        prev.map(entry => 
          entry.id === updatedEntry.id ? updatedEntry : entry
        )
      )
    } catch (error) {
      console.error('Error updating entry:', error)
    }
  }

  const handleEditEntry = (entry: DailyLogEntry) => {
    setEditingEntry(entry)
  }

  const handleEditSubmit = async (formData: Omit<DailyLogEntry, 'id' | 'createdAt'>) => {
    if (editingEntry) {
      try {
        const updatedEntry: DailyLogEntry = {
          ...formData,
          id: editingEntry.id,
          createdAt: editingEntry.createdAt
        }
        await updateDailyLogEntry(updatedEntry.id, updatedEntry)
        setEntries(prev => 
          prev.map(entry => 
            entry.id === updatedEntry.id ? updatedEntry : entry
          )
        )
        setEditingEntry(null)
      } catch (error) {
        console.error('Error updating entry:', error)
      }
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
          isLoading={isLoading}
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