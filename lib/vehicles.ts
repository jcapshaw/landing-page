import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import { Vehicle } from '@/app/inventory/types';

const COLLECTION_NAME = 'vehicles';

function getDb(): Firestore {
  if (!db) throw new Error('Firestore instance not initialized');
  return db;
}

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
    
    const docRef = await addDoc(collection(getDb(), COLLECTION_NAME), docData);
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
    const vehicleRef = doc(getDb(), COLLECTION_NAME, id);
    
    // Create update object with proper field paths
    const updateData: Record<string, any> = {};
    
    // Handle basic fields
    Object.entries(vehicleData).forEach(([key, value]) => {
      if (key !== 'statusData' && key !== 'metadata' && key !== 'additions') {
        updateData[key] = value;
      }
    });

    // Handle metadata updates
    updateData['metadata.lastUpdated'] = serverTimestamp();
    
    // Handle status data updates
    if (vehicleData.statusData) {
      Object.entries(vehicleData.statusData).forEach(([key, value]) => {
        updateData[`statusData.${key}`] = value;
      });
      // Override timestamp fields with server timestamps
      updateData['statusData.updatedAt'] = serverTimestamp();
    }

    // Handle additions object - filter out undefined values
    if (vehicleData.additions) {
      // Handle totalPrice separately
      if (vehicleData.additions.totalPrice !== undefined) {
        updateData['additions.totalPrice'] = vehicleData.additions.totalPrice;
      }
      
      // Handle lift
      if (vehicleData.additions.lift !== undefined) {
        if (vehicleData.additions.lift === null) {
          // Use deleteField() to remove the field if it's explicitly set to null
          updateData['additions.lift'] = null;
        } else {
          updateData['additions.lift'] = vehicleData.additions.lift;
        }
      }
      
      // Handle wheels
      if (vehicleData.additions.wheels !== undefined) {
        if (vehicleData.additions.wheels === null) {
          updateData['additions.wheels'] = null;
        } else {
          updateData['additions.wheels'] = vehicleData.additions.wheels;
        }
      }
      
      // Handle tires
      if (vehicleData.additions.tires !== undefined) {
        if (vehicleData.additions.tires === null) {
          updateData['additions.tires'] = null;
        } else {
          updateData['additions.tires'] = vehicleData.additions.tires;
        }
      }
      
      // Handle paintMatch
      if (vehicleData.additions.paintMatch !== undefined) {
        if (vehicleData.additions.paintMatch === null) {
          updateData['additions.paintMatch'] = null;
        } else {
          updateData['additions.paintMatch'] = vehicleData.additions.paintMatch;
        }
      }
      
      // Handle leather
      if (vehicleData.additions.leather !== undefined) {
        if (vehicleData.additions.leather === null) {
          updateData['additions.leather'] = null;
        } else {
          updateData['additions.leather'] = vehicleData.additions.leather;
        }
      }
      
      // Handle other
      if (vehicleData.additions.other !== undefined) {
        if (vehicleData.additions.other === null) {
          updateData['additions.other'] = null;
        } else {
          updateData['additions.other'] = vehicleData.additions.other;
        }
      }
    }

    // Always update lastStatusUpdate with server timestamp if it's being modified
    if ('lastStatusUpdate' in vehicleData) {
      updateData.lastStatusUpdate = serverTimestamp();
    }

    await updateDoc(vehicleRef, updateData);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }
}

export async function deleteVehicle(id: string) {
  try {
    const vehicleRef = doc(getDb(), COLLECTION_NAME, id);
    await deleteDoc(vehicleRef);
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw error;
  }
}

export async function getAllVehicles(): Promise<Vehicle[]> {
  try {
    const vehiclesQuery = query(
      collection(getDb(), COLLECTION_NAME),
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