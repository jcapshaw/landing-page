import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  Timestamp,
  serverTimestamp,
  FieldValue,
  arrayUnion,
} from 'firebase/firestore';
import firebase_app, { auth } from './firebase';

if (!firebase_app) {
  throw new Error('Firebase app not initialized');
}

const db = getFirestore(firebase_app);
const PROSPECTS_COLLECTION = 'prospects';

// Helper function to check auth
function checkAuth() {
  if (!auth) {
    throw new Error('Auth instance not initialized');
  }
  if (!auth.currentUser) {
    throw new Error('User must be authenticated');
  }
  return auth.currentUser;
}

export interface Note {
  text: string;
  timestamp: Timestamp;
  userName: string;
}

export interface ProspectData {
  customerName: string;
  dealType: string;
  salesperson: string;
  deskManager: string;
  date: Timestamp;
  hasDeposit: boolean;
  depositAmount?: string;
  isOOS: boolean;
  disposition: string;
  status: 'active' | 'archived';
  updatedAt: FieldValue | Timestamp;
  archivedAt?: FieldValue | Timestamp;
  notes?: Note[];
}

export interface Prospect extends Omit<ProspectData, 'updatedAt' | 'archivedAt'> {
  id: string;
  updatedAt: Timestamp;
  archivedAt?: Timestamp;
}

export async function addProspect(prospectData: Omit<ProspectData, 'status' | 'updatedAt' | 'archivedAt'>) {
  try {
    checkAuth();
    const docRef = await addDoc(collection(db, PROSPECTS_COLLECTION), {
      ...prospectData,
      date: prospectData.date,
      status: 'active',
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding prospect:', error);
    throw error;
  }
}

export async function addNote(id: string, text: string, userName: string) {
  try {
    checkAuth();
    const docRef = doc(db, PROSPECTS_COLLECTION, id);
    const note: Note = {
      text,
      timestamp: Timestamp.fromDate(new Date()),
      userName
    };

    await updateDoc(docRef, {
      notes: arrayUnion(note),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding note:', error);
    throw error;
  }
}

export async function updateProspect(id: string, prospectData: Partial<ProspectData>) {
  try {
    checkAuth();
    const docRef = doc(db, PROSPECTS_COLLECTION, id);
    const updateData: Partial<ProspectData> & { updatedAt: FieldValue } = {
      ...prospectData,
      updatedAt: serverTimestamp(),
    };

    // Convert date to Timestamp if it exists in the update data
    if (prospectData.date) {
      updateData.date = prospectData.date;
    }

    // If disposition is changed to SOLD or LOST, set archivedAt timestamp
    if (prospectData.disposition && ['SOLD', 'LOST'].includes(prospectData.disposition)) {
      updateData.archivedAt = serverTimestamp();
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating prospect:', error);
    throw error;
  }
}

export async function getActiveProspects(): Promise<Prospect[]> {
  try {
    checkAuth();
    const q = query(
      collection(db, PROSPECTS_COLLECTION),
      where('status', '==', 'active')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<ProspectData, 'id'>,
    })) as Prospect[];
  } catch (error) {
    console.error('Error getting active prospects:', error);
    throw error;
  }
}

export async function archiveProspect(id: string): Promise<void> {
  try {
    const docRef = doc(db, PROSPECTS_COLLECTION, id);
    await updateDoc(docRef, {
      status: 'archived',
      archivedAt: serverTimestamp(),
    });
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

    // First get all active prospects
    const q = query(
      collection(db, PROSPECTS_COLLECTION),
      where('status', '==', 'active')
    );

    const querySnapshot = await getDocs(q);
    const archivePromises: Promise<void>[] = [];
    const oneHourAgoTimestamp = Timestamp.fromDate(oneHourAgo);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Check if the prospect should be archived
      if (
        ['SOLD', 'LOST'].includes(data.disposition) &&
        data.archivedAt &&
        data.archivedAt <= oneHourAgoTimestamp
      ) {
        archivePromises.push(archiveProspect(doc.id));
      }
    });

    if (archivePromises.length > 0) {
      await Promise.all(archivePromises);
    }
  } catch (error) {
    console.error('Error checking and archiving prospects:', error);
    throw error;
  }
}