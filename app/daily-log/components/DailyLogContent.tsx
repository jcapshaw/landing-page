"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/components/LazyAuthProvider'
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
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [editingEntry, setEditingEntry] = useState<DailyLogEntry | null>(null)
  const [entries, setEntries] = useState<DailyLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch entries when date changes
  useEffect(() => {
    const fetchEntries = async () => {
      setIsLoading(true)
      try {
        console.log('Fetching entries for date:', selectedDate.toISOString())
        const fetchedEntries = await getDailyLogEntries(selectedDate)
        console.log('Entries fetched successfully:', fetchedEntries.length, 'entries')
        
        if (fetchedEntries.length === 0) {
          console.log('No entries found for the selected date')
        }
        
        setEntries(fetchedEntries)
      } catch (error) {
        console.error('Error fetching entries:', error)
        if (error instanceof Error) {
          console.error('Error details:', error.message, error.stack)
        }
        // Set empty array to avoid undefined errors
        setEntries([])
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
    
    if (!user) {
      console.error('User is not authenticated');
      return;
    }

    try {
      console.log('Current user:', user.id);
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

  // Add debug information to help troubleshoot
  console.log('Current entries state:', entries);
  
  return (
    <div className="container mx-auto py-10 space-y-10">
      <h1 className="text-3xl font-bold">Daily Customer Log</h1>
      
      {/* Debug information */}
      <div className="bg-yellow-100 p-4 rounded-lg text-sm">
        <h3 className="font-bold">Debug Info:</h3>
        <p>Total entries: {entries.length}</p>
        <p>Selected date: {selectedDate.toISOString()}</p>
        <p>Loading state: {isLoading ? 'Loading...' : 'Loaded'}</p>
      </div>
      
      <div className="flex justify-end mb-6">
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