'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { ProspectsTable } from '@/app/components/ProspectsTable';
import { getActiveProspects, updateProspect, addNote, type Prospect } from '@/lib/prospects';
import { Timestamp } from 'firebase/firestore';

const HotProspects: FC = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [currentUser, setCurrentUser] = useState<string>("Unknown User");

  useEffect(() => {
    const fetchProspects = async () => {
      try {
        const allProspects = await getActiveProspects();
        // Sort by date (newest first) and take top 5
        const sortedProspects = allProspects
          .sort((a, b) => b.date.toMillis() - a.date.toMillis())
          .slice(0, 5);
        setProspects(sortedProspects);
      } catch (error) {
        console.error('Error fetching prospects:', error);
      }
    };

    fetchProspects();
  }, []);

  const handleEditClick = (prospect: Prospect) => {
    // This is a placeholder for edit functionality
    console.log('Edit clicked for prospect:', prospect);
  };

  const handleDispositionChange = async (id: string, disposition: string) => {
    try {
      await updateProspect(id, { disposition });
      // Refresh prospects after update
      const allProspects = await getActiveProspects();
      const sortedProspects = allProspects
        .sort((a, b) => b.date.toMillis() - a.date.toMillis())
        .slice(0, 5);
      setProspects(sortedProspects);
    } catch (error) {
      console.error('Error updating disposition:', error);
    }
  };

  const handleAddNote = async (id: string, note: string) => {
    try {
      await addNote(id, note, currentUser);
      // Refresh prospects after adding note
      const allProspects = await getActiveProspects();
      const sortedProspects = allProspects
        .sort((a, b) => b.date.toMillis() - a.date.toMillis())
        .slice(0, 5);
      setProspects(sortedProspects);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Recently Added Hot Prospects</h2>
      <ProspectsTable
        prospects={prospects}
        onEditClick={handleEditClick}
        onDispositionChange={handleDispositionChange}
        onAddNote={handleAddNote}
        currentUser={currentUser}
      />
    </div>
  );
};

export default HotProspects;