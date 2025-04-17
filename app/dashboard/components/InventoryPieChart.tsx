'use client';

import { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LocationSelector from './LocationSelector';
import { getAllVehicles } from '@/lib/vehicles';
import { Vehicle } from '@/app/inventory/types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface InventoryData {
  available: number;
  deposit: number;
  sold: number;
  pendingRecon: number;
}

export default function InventoryPieChart() {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [inventoryData, setInventoryData] = useState<InventoryData>({
    available: 0,
    deposit: 0,
    sold: 0,
    pendingRecon: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInventoryData() {
      setLoading(true);
      try {
        const vehicles = await getAllVehicles();
        
        // Filter by location if needed
        const filteredVehicles = selectedLocation === 'all' 
          ? vehicles 
          : vehicles.filter(vehicle => vehicle.location === selectedLocation);
        
        // Count vehicles by status
        const counts = filteredVehicles.reduce((acc: InventoryData, vehicle: Vehicle) => {
          switch (vehicle.status) {
            case 'AVAILABLE':
              acc.available++;
              break;
            case 'DEPOSIT':
              acc.deposit++;
              break;
            case 'SOLD':
              acc.sold++;
              break;
            case 'PENDING_RECON':
              acc.pendingRecon++;
              break;
          }
          return acc;
        }, {
          available: 0,
          deposit: 0,
          sold: 0,
          pendingRecon: 0,
        });
        
        setInventoryData(counts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching inventory data:', error);
        setLoading(false);
      }
    }

    fetchInventoryData();
  }, [selectedLocation]);

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
  };

  const chartData = {
    labels: ['Available', 'Deposit', 'Sold', 'Pending Recon'],
    datasets: [
      {
        data: [
          inventoryData.available,
          inventoryData.deposit,
          inventoryData.sold,
          inventoryData.pendingRecon,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',  // Green for available
          'rgba(255, 206, 86, 0.6)',  // Yellow for deposit
          'rgba(54, 162, 235, 0.6)',  // Blue for sold
          'rgba(255, 159, 64, 0.6)',  // Orange for pending recon
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="dashboard-title">Inventory Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <LocationSelector 
          onLocationChange={handleLocationChange}
          selectedLocation={selectedLocation}
        />
        
        {loading ? null : (
          <div className="h-64">
            <Pie data={chartData} options={options} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}