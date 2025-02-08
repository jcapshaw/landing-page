import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Vehicle } from '@/app/inventory/types';

const COLLECTION_NAME = 'vehicles';

export async function addVehicle(vehicleData: Omit<Vehicle, 'id'>) {
  try {
    console.log('Adding vehicle with data:', JSON.stringify(vehicleData, null, 2));
    
    // Validate required fields
    const requiredFields = ['location', 'year', 'make', 'model', 'totalPrice', 'mileage', 'vin', 'exteriorColor'];
    const missingFields = requiredFields.filter(field => !vehicleData[field as keyof typeof vehicleData]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const docData = {
      ...vehicleData,
      dateAdded: serverTimestamp(),
      lastStatusUpdate: serverTimestamp(),
      metadata: {
        ...vehicleData.metadata,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      }
    };

    console.log('Attempting to add document with data:', JSON.stringify(docData, null, 2));
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
    console.log('Vehicle added successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding vehicle:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
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