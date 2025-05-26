import { supabase } from '@/lib/supabase';
import { DailyLogEntry } from '../types';

const TABLE_NAME = 'daily_logs';

export const addDailyLogEntry = async (entry: Omit<DailyLogEntry, 'id' | 'createdAt'>) => {
  try {
    console.log('Adding entry to Supabase:', entry);
    const entryWithTimestamp = {
      ...entry,
      created_at: new Date().toISOString(),
    };
    console.log('Entry with timestamp:', entryWithTimestamp);
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(entryWithTimestamp)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('Document written with ID:', data.id);
    
    const newEntry = {
      id: data.id,
      ...entry,
      createdAt: entryWithTimestamp.created_at,
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

    // Query Supabase for entries within the date range
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .gte('date', startISO)
      .lte('date', endISO);
    
    if (error) throw error;
    
    console.log('Query returned', data.length, 'documents');
    
    // Map the results to the expected format
    const entries = data.map(entry => ({
      id: entry.id,
      ...entry
    })) as DailyLogEntry[];
    
    console.log('Entries:', entries.length);
    return entries;
  } catch (error) {
    console.error('Error getting daily log entries:', error);
    throw error;
  }
};

export const updateDailyLogEntry = async (entryId: string, updates: Partial<DailyLogEntry>) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq('id', entryId)
      .select()
      .single();
    
    if (error) throw error;
    
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
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', entryId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found
        return null;
      }
      throw error;
    }
    
    return {
      id: data.id,
      ...data
    } as DailyLogEntry;
  } catch (error) {
    console.error('Error getting daily log entry:', error);
    throw error;
  }
};