import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Vehicle } from '@/app/inventory/types';

const COLLECTION_NAME = 'vehicles';

export async function addVehicle(vehicleData: Omit<Vehicle, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...vehicleData,
      dateAdded: serverTimestamp(),
      lastStatusUpdate: serverTimestamp(),
      metadata: {
        ...vehicleData.metadata,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      }
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding vehicle:', error);
    throw error;
  }
}

export async function updateVehicle(id: string, vehicleData: Partial<Vehicle>) {
  try {
    const vehicleRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(vehicleRef, {
      ...vehicleData,
      'metadata.lastUpdated': serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }
}

export async function deleteVehicle(id: string) {
  try {
    const vehicleRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(vehicleRef);
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw error;
  }
}

export async function getAllVehicles(): Promise<Vehicle[]> {
  try {
    const vehiclesQuery = query(
      collection(db, COLLECTION_NAME),
      orderBy('dateAdded', 'desc')
    );
    
    const querySnapshot = await getDocs(vehiclesQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Vehicle));
  } catch (error) {
    console.error('Error getting vehicles:', error);
    throw error;
  }
}