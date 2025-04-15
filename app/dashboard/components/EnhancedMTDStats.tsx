'use client';

import { useEffect, useState } from 'react';
import LocationSelector from './LocationSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SalesStats {
  totalSales: number;
  totalLeads: number;
  conversionRate: number;
}

export default function EnhancedMTDStats() {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'mtd' | 'today'>('mtd');
  const [mtdStats, setMtdStats] = useState<SalesStats>({
    totalSales: 0,
    totalLeads: 0,
    conversionRate: 0,
  });
  const [todayStats, setTodayStats] = useState<SalesStats>({
    totalSales: 0,
    totalLeads: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch stats based on selected location
  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        // TODO: Replace with actual API calls to get data by location
        // This is simulated data for now
        
        // Simulate different data for different locations
        let mtdSales = 44;
        let mtdLeads = 315;
        let todaySales = 3;
        let todayLeads = 12;
        
        if (selectedLocation !== 'all') {
          // Generate different numbers based on location name
          const locationHash = selectedLocation.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          mtdSales = Math.max(5, Math.round(mtdSales * (0.5 + (locationHash % 100) / 100)));
          mtdLeads = Math.max(20, Math.round(mtdLeads * (0.5 + (locationHash % 100) / 100)));
          todaySales = Math.max(0, Math.round(todaySales * (0.5 + (locationHash % 100) / 100)));
          todayLeads = Math.max(1, Math.round(todayLeads * (0.5 + (locationHash % 100) / 100)));
        }
        
        setMtdStats({
          totalSales: mtdSales,
          totalLeads: mtdLeads,
          conversionRate: parseFloat((mtdSales / mtdLeads * 100).toFixed(1)),
        });
        
        setTodayStats({
          totalSales: todaySales,
          totalLeads: todayLeads,
          conversionRate: parseFloat((todaySales / todayLeads * 100).toFixed(1)),
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    }

    fetchStats();
  }, [selectedLocation]);

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Sales Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <LocationSelector 
          onLocationChange={handleLocationChange}
          selectedLocation={selectedLocation}
        />
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="flex mb-4 border-b">
              <button
                className={`px-4 py-2 ${activeTab === 'mtd' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
                onClick={() => setActiveTab('mtd')}
              >
                Month to Date
              </button>
              <button
                className={`px-4 py-2 ${activeTab === 'today' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
                onClick={() => setActiveTab('today')}
              >
                Today
              </button>
            </div>
            
            {activeTab === 'mtd' ? (
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600">Total Sold</p>
                  <p className="text-2xl font-bold">{mtdStats.totalSales.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Leads</p>
                  <p className="text-2xl font-bold">{mtdStats.totalLeads}</p>
                </div>
                <div>
                  <p className="text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold">{mtdStats.conversionRate}%</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600">Total Sold</p>
                  <p className="text-2xl font-bold">{todayStats.totalSales.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Leads</p>
                  <p className="text-2xl font-bold">{todayStats.totalLeads}</p>
                </div>
                <div>
                  <p className="text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold">{todayStats.conversionRate}%</p>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}