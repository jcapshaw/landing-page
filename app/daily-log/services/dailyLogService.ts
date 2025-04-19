import { db } from '@/lib/firebase';
import { DailyLogEntry } from '../types';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  getDoc,
} from 'firebase/firestore';

const COLLECTION_NAME = 'dailyLogs';

export const addDailyLogEntry = async (entry: Omit<DailyLogEntry, 'id' | 'createdAt'>) => {
  try {
    console.log('Adding entry to Firestore:', entry);
    const entryWithTimestamp = {
      ...entry,
      createdAt: new Date().toISOString(),
    };
    console.log('Entry with timestamp:', entryWithTimestamp);
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), entryWithTimestamp);
    console.log('Document written with ID:', docRef.id);
    
    const newEntry = {
      id: docRef.id,
      ...entryWithTimestamp,
    };
    console.log('Returning new entry:', newEntry);
    return newEntry;
  } catch (error) {
    console.error('Error adding daily log entry:', error);
    throw error;
  }
};

export const getDailyLogEntries = async (date: Date) => {
  try {
    console.log('Fetching entries for date:', date);
    
    // Create start and end of the selected date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const startISO = startOfDay.toISOString();
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    const endISO = endOfDay.toISOString();

    console.log('Date range:', { startISO, endISO });

    // Use a query that doesn't require a composite index
    // Just get all entries and filter client-side
    const q = query(
      collection(db, COLLECTION_NAME)
    );

    const querySnapshot = await getDocs(q);
    console.log('Query returned', querySnapshot.size, 'documents');
    
    // Filter the results client-side based on the date
    const entries = querySnapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data
        } as DailyLogEntry;
      })
      .filter(entry => {
        if (!entry.date) return false;
        
        const entryDate = new Date(entry.date);
        return entryDate >= startOfDay && entryDate <= endOfDay;
      });
    
    console.log('Filtered entries:', entries.length, 'out of', querySnapshot.size);
    return entries;
  } catch (error) {
    console.error('Error getting daily log entries:', error);
    throw error;
  }
};

export const updateDailyLogEntry = async (entryId: string, updates: Partial<DailyLogEntry>) => {
  try {
    const entryRef = doc(db, COLLECTION_NAME, entryId);
    await updateDoc(entryRef, updates);
    return {
      id: entryId,
      ...updates,
    };
  } catch (error) {
    console.error('Error updating daily log entry:', error);
    throw error;
  }
};

export const getDailyLogEntryById = async (entryId: string) => {
  try {
    const entryRef = doc(db, COLLECTION_NAME, entryId);
    const docSnap = await getDoc(entryRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as DailyLogEntry;
    }
    return null;
  } catch (error) {
    console.error('Error getting daily log entry:', error);
    throw error;
  }
};