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
      totalSales: 44,
      totalLeads: 315,
      conversionRate: 11.9,
    });
  }, []);

  return (
    <div>
      <h2 className="dashboard-title mb-4">Month to Date Stats</h2>
      <div className="space-y-4">
        <div>
          <p className="dashboard-subtitle">Total Sold</p>
          <p className="dashboard-title">{stats.totalSales.toLocaleString()}</p>
        </div>
        <div>
          <p className="dashboard-subtitle">Total Leads</p>
          <p className="dashboard-title">{stats.totalLeads}</p>
        </div>
        <div>
          <p className="dashboard-subtitle">Conversion Rate</p>
          <p className="dashboard-title">{stats.conversionRate}%</p>
        </div>
      </div>
    </div>
  );
}