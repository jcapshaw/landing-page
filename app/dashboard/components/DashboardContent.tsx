'use client';

import { useEffect, useState } from 'react';
import MTDStats from './MTDStats';
import ProjectedStats from './ProjectedStats';
import HotProspects from './HotProspects';
import MonthYearSelect from './MonthYearSelect';
import SalesTable from './SalesTable';

export default function DashboardContent() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState((currentDate.getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());

  return (
    <div className="flex flex-col gap-6">
      <MonthYearSelect
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
      />
      
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

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Sales Performance</h2>
        <SalesTable month={selectedMonth} year={selectedYear} />
      </div>
    </div>
  );
}