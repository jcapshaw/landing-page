'use client';

import { useEffect, useState } from 'react';

interface ProjectedStats {
  projectedSales: number;
  projectedLeads: number;
  daysRemaining: number;
  dailyAverage: number;
}

export default function ProjectedStats() {
  const [stats, setStats] = useState<ProjectedStats>({
    projectedSales: 0,
    projectedLeads: 0,
    daysRemaining: 0,
    dailyAverage: 0,
  });

  useEffect(() => {
    // Calculate days remaining in the current month
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysRemaining = lastDay.getDate() - today.getDate();
    
    // Simulated data based on MTD performance
    const mtdSales = 23; // This should come from actual data
    const mtdLeads = 185; // This should come from actual data
    const daysPassed = today.getDate();
    
    const dailyAverage = mtdSales / daysPassed;
    const projectedSales = mtdSales + (dailyAverage * daysRemaining);
    const projectedLeads = Math.round(mtdLeads * (lastDay.getDate() / daysPassed));

    setStats({
      projectedSales,
      projectedLeads,
      daysRemaining,
      dailyAverage,
    });
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Projected Performance</h2>
      <div className="space-y-4">
        <div>
          <p className="text-gray-600">Projected Sales</p>
          <p className="text-2xl font-bold">{Math.round(stats.projectedSales).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-600">Projected Leads</p>
          <p className="text-2xl font-bold">{stats.projectedLeads}</p>
        </div>
        <div>
          <p className="text-gray-600">Days Remaining</p>
          <p className="text-2xl font-bold">{stats.daysRemaining}</p>
        </div>
        <div>
          <p className="text-gray-600">Daily Average</p>
          <p className="text-2xl font-bold">{Math.round(stats.dailyAverage).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}