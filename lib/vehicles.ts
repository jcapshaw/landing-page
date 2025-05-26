import { supabase } from './supabase';
import { Vehicle } from '@/app/inventory/types';

const TABLE_NAME = 'vehicles';

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
      dateAdded: new Date().toISOString(),
      lastStatusUpdate: new Date().toISOString(),
      metadata: {
        ...vehicleData.metadata,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      }
    };

    console.log('Attempting to add document with data:', JSON.stringify(docData, null, 2));
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(docData)
      .select()
      .single();

    if (error) throw error;
    
    console.log('Vehicle added successfully with ID:', data.id);
    return data.id;
  } catch (error) {
    console.error('Error adding vehicle:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    throw error;
  }
}

export async function updateVehicle(id: string, vehicleData: Partial<Vehicle>) {
  try {
    // Create update object
    const updateData: Record<string, any> = {
      ...vehicleData,
      lastStatusUpdate: new Date().toISOString(),
    };

    // Handle metadata updates
    if (vehicleData.metadata) {
      updateData.metadata = {
        ...vehicleData.metadata,
        lastUpdated: new Date().toISOString(),
      };
    } else {
      updateData.metadata = { lastUpdated: new Date().toISOString() };
    }
    
    // Handle status data updates
    if (vehicleData.statusData) {
      updateData.statusData = {
        ...vehicleData.statusData,
        updatedAt: new Date().toISOString(),
      };
    }

    const { error } = await supabase
      .from(TABLE_NAME)
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }
}

export async function deleteVehicle(id: string) {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw error;
  }
}

export async function getAllVehicles(): Promise<Vehicle[]> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('dateAdded', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting vehicles:', error);
    throw error;
  }
}