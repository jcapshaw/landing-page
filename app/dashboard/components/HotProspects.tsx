'use client';

import { useEffect, useState } from 'react';

interface Prospect {
  id: string;
  name: string;
  potentialValue: number;
  probability: number;
  nextFollowUp: string;
}

export default function HotProspects() {
  const [prospects, setProspects] = useState<Prospect[]>([]);

  // TODO: Fetch real data from API
  useEffect(() => {
    // Simulated data for now
    setProspects([
      {
        id: '1',
        name: 'ABC Corporation',
        potentialValue: 75000,
        probability: 80,
        nextFollowUp: '2024-02-10',
      },
      {
        id: '2',
        name: 'XYZ Industries',
        potentialValue: 120000,
        probability: 65,
        nextFollowUp: '2024-02-08',
      },
      {
        id: '3',
        name: 'Global Enterprises',
        potentialValue: 95000,
        probability: 75,
        nextFollowUp: '2024-02-12',
      },
    ]);
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Hot Prospects</h2>
      <div className="space-y-4">
        {prospects.map((prospect) => (
          <div
            key={prospect.id}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{prospect.name}</h3>
              <span className="text-green-600 font-medium">
                ${prospect.potentialValue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Probability: {prospect.probability}%</span>
              <span>Follow-up: {new Date(prospect.nextFollowUp).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Potential Value:</span>
          <span className="text-xl font-bold">
            ${prospects.reduce((sum, p) => sum + p.potentialValue, 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}