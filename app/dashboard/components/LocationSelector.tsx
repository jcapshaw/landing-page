'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAllVehicles } from '@/lib/vehicles';

interface LocationSelectorProps {
  onLocationChange: (location: string) => void;
  selectedLocation: string;
}

export default function LocationSelector({
  onLocationChange,
  selectedLocation,
}: LocationSelectorProps) {
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const vehicles = await getAllVehicles();
        // Extract unique locations
        const uniqueLocations = Array.from(
          new Set(vehicles.map((vehicle) => vehicle.location))
        ).filter(Boolean);
        
        setLocations(uniqueLocations);
        
        // Set default location if none selected
        if (!selectedLocation && uniqueLocations.length > 0) {
          onLocationChange(uniqueLocations[0]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setLoading(false);
      }
    }

    fetchLocations();
  }, [onLocationChange, selectedLocation]);

  if (loading) {
    return <div>Loading locations...</div>;
  }

  return (
    <div className="w-full mb-4">
      <Select value={selectedLocation} onValueChange={onLocationChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Locations</SelectItem>
          {locations.map((location) => (
            <SelectItem key={location} value={location}>
              {location}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}