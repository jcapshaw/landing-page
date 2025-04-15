'use client';

import { useState } from 'react';
import EnhancedMTDStats from './EnhancedMTDStats';
import ProjectedStats from './ProjectedStats';
import HotProspects from './HotProspects';
import InventorySummary from './InventorySummary';
import InventoryPieChart from './InventoryPieChart';
import GoogleReviews from './GoogleReviews';

export default function DashboardContent() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-1">
          <EnhancedMTDStats />
        </div>
        <div className="col-span-1">
          <ProjectedStats />
        </div>
        <div className="col-span-1">
          <HotProspects />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1">
          <InventoryPieChart />
        </div>
        <div className="col-span-1">
          <GoogleReviews />
        </div>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow-md">
        <InventorySummary />
      </div>
    </div>
  );
}