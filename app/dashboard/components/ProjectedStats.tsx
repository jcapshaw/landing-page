'use client';

import { useEffect, useState } from 'react';

interface ProjectedStats {
  projectedSales: number;
  projectedLeads: number;
  projectedAppts: number;
  daysRemaining: number;
  dailyAverage: number;
}

interface Benchmarks {
  sales: number;
  leads: number;
  appts: number;
}

const BENCHMARKS: Benchmarks = {
  sales: 95,
  leads: 800,
  appts: 175
};

export default function ProjectedStats() {
  const [stats, setStats] = useState<ProjectedStats>({
    projectedSales: 0,
    projectedLeads: 0,
    projectedAppts: 0,
    daysRemaining: 0,
    dailyAverage: 0,
  });

  useEffect(() => {
    // Calculate days remaining in the current month
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysRemaining = lastDay.getDate() - today.getDate();
    
    // Simulated data based on MTD performance
    const mtdSales = 13; // This should come from actual data
    const mtdLeads = 105; // This should come from actual data
    const mtdAppts = 35; // This should come from actual data
    const daysPassed = today.getDate();
    
    const dailyAverage = mtdSales / daysPassed;
    const projectedSales = mtdSales + (dailyAverage * daysRemaining);
    const projectedLeads = Math.round(mtdLeads * (lastDay.getDate() / daysPassed));
    const projectedAppts = Math.round(mtdAppts * (lastDay.getDate() / daysPassed));

    setStats({
      projectedSales,
      projectedLeads,
      projectedAppts,
      daysRemaining,
      dailyAverage,
    });
  }, []);

  const calculateProgress = (current: number, benchmark: number) => {
    const progress = (current / benchmark) * 100;
    return Math.min(progress, 100); // Cap at 100%
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-400';
    if (percentage >= 75) return 'bg-yellow-400';
    if (percentage >= 50) return 'bg-orange-400';
    return 'bg-red-400';
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Projections vs. Benchmark</h2>
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-1">
            <p className="text-gray-600">Projected Sales</p>
            <div className="text-right">
              <p className="text-gray-600">
                {Math.round(stats.projectedSales)} / {BENCHMARKS.sales}
                <span className="ml-2 font-medium">
                  ({Math.round(calculateProgress(stats.projectedSales, BENCHMARKS.sales))}%)
                </span>
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-[1500ms] delay-[1000ms] ${getProgressColor(calculateProgress(stats.projectedSales, BENCHMARKS.sales))}`}
              style={{ width: `${calculateProgress(stats.projectedSales, BENCHMARKS.sales)}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <p className="text-gray-600">Projected Leads</p>
            <div className="text-right">
              <p className="text-gray-600">
                {stats.projectedLeads} / {BENCHMARKS.leads}
                <span className="ml-2 font-medium">
                  ({Math.round(calculateProgress(stats.projectedLeads, BENCHMARKS.leads))}%)
                </span>
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-[1500ms] delay-[1000ms] ${getProgressColor(calculateProgress(stats.projectedLeads, BENCHMARKS.leads))}`}
              style={{ width: `${calculateProgress(stats.projectedLeads, BENCHMARKS.leads)}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <p className="text-gray-600">Projected Appointments</p>
            <div className="text-right">
              <p className="text-gray-600">
                {stats.projectedAppts} / {BENCHMARKS.appts}
                <span className="ml-2 font-medium">
                  ({Math.round(calculateProgress(stats.projectedAppts, BENCHMARKS.appts))}%)
                </span>
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-[1500ms] delay-[1000ms] ${getProgressColor(calculateProgress(stats.projectedAppts, BENCHMARKS.appts))}`}
              style={{ width: `${calculateProgress(stats.projectedAppts, BENCHMARKS.appts)}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
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
    </div>
  );
}