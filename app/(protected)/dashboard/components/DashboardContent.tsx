'use client';

import { useEffect } from 'react';
import MTDStats from './MTDStats';
import ProjectedStats from './ProjectedStats';
import HotProspects from './HotProspects';
import InventorySummary from './InventorySummary';

export default function DashboardContent() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <MTDStats />
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <ProjectedStats />
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <HotProspects />
        </div>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow-md">
        <InventorySummary />
      </div>
    </div>
  );
}