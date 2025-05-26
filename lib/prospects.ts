import { supabase } from './supabase';

export interface Note {
  text: string;
  timestamp: string;
  userName: string;
}

export interface ProspectData {
  customerName: string;
  dealType: string;
  salesperson: string;
  deskManager: string;
  date: string;
  hasDeposit: boolean;
  depositAmount?: string;
  isOOS: boolean;
  disposition: string;
  status: 'active' | 'archived';
  updatedAt: string;
  archivedAt?: string;
  notes?: Note[];
}

export interface Prospect extends ProspectData {
  id: string;
}

export async function addProspect(prospectData: Omit<ProspectData, 'status' | 'updatedAt' | 'archivedAt'>) {
  try {
    const { data, error } = await supabase
      .from('prospects')
      .insert({
        ...prospectData,
        status: 'active',
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Error adding prospect:', error);
    throw error;
  }
}

export async function addNote(id: string, text: string, userName: string) {
  try {
    // First get the current prospect to append to notes array
    const { data: prospect, error: fetchError } = await supabase
      .from('prospects')
      .select('notes')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const note: Note = {
      text,
      timestamp: new Date().toISOString(),
      userName
    };

    const updatedNotes = [...(prospect.notes || []), note];

    const { error } = await supabase
      .from('prospects')
      .update({
        notes: updatedNotes,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error adding note:', error);
    throw error;
  }
}

export async function updateProspect(id: string, prospectData: Partial<ProspectData>) {
  try {
    const updateData: Partial<ProspectData> & { updatedAt: string } = {
      ...prospectData,
      updatedAt: new Date().toISOString(),
    };

    // If disposition is changed to SOLD or LOST, set archivedAt timestamp
    if (prospectData.disposition && ['SOLD', 'LOST'].includes(prospectData.disposition)) {
      updateData.archivedAt = new Date().toISOString();
    }

    const { error } = await supabase
      .from('prospects')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating prospect:', error);
    throw error;
  }
}

export async function getActiveProspects(): Promise<Prospect[]> {
  try {
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .eq('status', 'active');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting active prospects:', error);
    throw error;
  }
}

export async function archiveProspect(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('prospects')
      .update({
        status: 'archived',
        archivedAt: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error archiving prospect:', error);
    throw error;
  }
}

// Function to check and archive prospects that have been SOLD or LOST for more than 1 hour
export async function checkAndArchiveProspects(): Promise<void> {
  try {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    // Get all active prospects that should be archived
    const { data: prospects, error } = await supabase
      .from('prospects')
      .select('*')
      .eq('status', 'active')
      .in('disposition', ['SOLD', 'LOST'])
      .not('archivedAt', 'is', null)
      .lt('archivedAt', oneHourAgo.toISOString());

    if (error) throw error;

    if (prospects && prospects.length > 0) {
      const archivePromises = prospects.map(prospect => archiveProspect(prospect.id));
      await Promise.all(archivePromises);
    }
  } catch (error) {
    console.error('Error checking and archiving prospects:', error);
    throw error;
  }
}