'use client';

import { useEffect, useState } from 'react';

interface MTDStats {
  totalSales: number;
  totalLeads: number;
  conversionRate: number;
}

export default function MTDStats() {
  const [stats, setStats] = useState<MTDStats>({
    totalSales: 0,
    totalLeads: 0,
    conversionRate: 0,
  });

  // TODO: Fetch real data from API
  useEffect(() => {
    // Simulated data for now
    setStats({
      totalSales: 24,
      totalLeads: 175,
      conversionRate: 11.9,
    });
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Month to Date Stats</h2>
      <div className="space-y-4">
        <div>
          <p className="text-gray-600">Total Sold</p>
          <p className="text-2xl font-bold">{stats.totalSales.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-600">Total Leads</p>
          <p className="text-2xl font-bold">{stats.totalLeads}</p>
        </div>
        <div>
          <p className="text-gray-600">Conversion Rate</p>
          <p className="text-2xl font-bold">{stats.conversionRate}%</p>
        </div>
      </div>
    </div>
  );
}