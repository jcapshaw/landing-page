"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { HotProspects } from "../components/HotProspects";
import { ProspectsTable } from "../components/ProspectsTable";
import {
  Prospect,
  ProspectData,
  getActiveProspects,
  addProspect,
  updateProspect,
  checkAndArchiveProspects,
  addNote
} from "@/lib/prospects";

type NewProspectData = Omit<ProspectData, 'status' | 'updatedAt' | 'archivedAt'>;

export default function HotProspectsPage() {
  const router = useRouter();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication
  useEffect(() => {
    if (!auth) {
      console.error("Auth instance not initialized");
      router.push('/auth');
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/auth');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch active prospects
  useEffect(() => {
    const loadProspects = async () => {
      try {
        const activeProspects = await getActiveProspects();
        setProspects(activeProspects);
      } catch (error) {
        console.error("Error loading prospects:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProspects();
  }, []);

  // Check for prospects to archive every minute
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await checkAndArchiveProspects();
        // Refresh the prospects list after checking archives
        const activeProspects = await getActiveProspects();
        setProspects(activeProspects);
      } catch (error) {
        console.error("Error checking archives:", error);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (values: NewProspectData | Prospect) => {
    try {
      if ('id' in values) {
        // It's an update operation
        await updateProspect(values.id, values);
      } else {
        // It's an add operation
        await addProspect(values);
      }
      // Refresh the prospects list
      const activeProspects = await getActiveProspects();
      setProspects(activeProspects);
      if ('id' in values) {
        setEditingProspect(null);
      }
    } catch (error) {
      console.error("Error saving prospect:", error);
    }
  };

  const handleEditClick = (prospect: Prospect) => {
    setEditingProspect(prospect);
  };

  const handleCancelEdit = () => {
    setEditingProspect(null);
  };

  const handleDispositionChange = async (id: string, disposition: string) => {
    try {
      await updateProspect(id, { disposition });
      // Refresh the prospects list
      const activeProspects = await getActiveProspects();
      setProspects(activeProspects);
    } catch (error) {
      console.error("Error updating disposition:", error);
    }
  };

  const handleAddNote = async (id: string, text: string) => {
    try {
      if (!auth) {
        throw new Error('Auth instance not initialized');
      }
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User must be authenticated to add notes');
      }
      await addNote(id, text, user.displayName || user.email || 'Unknown User');
      // Refresh the prospects list
      const activeProspects = await getActiveProspects();
      setProspects(activeProspects);
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  if (loading) {
    return null; // Return empty instead of loading spinner
  }

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <HotProspects
          onSubmit={handleSubmit}
          initialData={editingProspect}
          onCancel={handleCancelEdit}
          mode={editingProspect ? "edit" : "add"}
        />
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Hot Opportunities</h2>
          <ProspectsTable
            prospects={prospects}
            onEditClick={handleEditClick}
            onDispositionChange={handleDispositionChange}
            onAddNote={handleAddNote}
            currentUser={auth?.currentUser?.displayName || auth?.currentUser?.email || 'Unknown User'}
          />
        </div>
      </div>
    </main>
  );
}