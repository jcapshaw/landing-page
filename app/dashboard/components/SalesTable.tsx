'use client';

import { useEffect, useState } from 'react';

interface SalespersonData {
  id: string;
  name: string;
  totalSold: number;
  totalAppointments: number;
  totalCalls: number;
}

interface SalesTableProps {
  month: string;
  year: string;
}

export default function SalesTable({ month, year }: SalesTableProps) {
  const [salesData, setSalesData] = useState<SalespersonData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      try {
        // TODO: Implement actual data fetching from your backend
        // This is mock data for demonstration
        const mockData: SalespersonData[] = [
          {
            id: '1',
            name: 'John Doe',
            totalSold: 5,
            totalAppointments: 15,
            totalCalls: 45,
          },
          {
            id: '2',
            name: 'Jane Smith',
            totalSold: 7,
            totalAppointments: 20,
            totalCalls: 60,
          },
        ];
        setSalesData(mockData);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [month, year]);

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Sold
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Appointments
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Calls
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {salesData.map((person) => (
              <tr key={person.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {person.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {person.totalSold}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {person.totalAppointments}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {person.totalCalls}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}