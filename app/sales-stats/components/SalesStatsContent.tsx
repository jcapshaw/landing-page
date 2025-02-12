'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import SalesChart from './SalesChart'

interface SalesPerson {
  id: string
  name: string
  mtdSold: number
  mtdAppointments: number
  mtdOpportunities: number
  mtdOutboundCalls: number
}

// Sample data - replace with actual data fetching
const salesData: SalesPerson[] = [
  {
    id: '1',
    name: 'John Doe',
    mtdSold: 8,
    mtdAppointments: 15,
    mtdOpportunities: 25,
    mtdOutboundCalls: 120,
  },
  {
    id: '2',
    name: 'Jane Smith',
    mtdSold: 12,
    mtdAppointments: 20,
    mtdOpportunities: 30,
    mtdOutboundCalls: 150,
  },
  // Add more sample data as needed
]

export default function SalesStatsContent() {
  const [selectedPerson, setSelectedPerson] = useState<SalesPerson | null>(null)

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Salesperson</TableHead>
              <TableHead className="text-right">MTD Sold</TableHead>
              <TableHead className="text-right">MTD Appt Set</TableHead>
              <TableHead className="text-right">MTD Opportunities</TableHead>
              <TableHead className="text-right">MTD Outbound Calls</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salesData.map((person) => (
              <TableRow
                key={person.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedPerson(person)}
              >
                <TableCell className="font-medium">{person.name}</TableCell>
                <TableCell className="text-right">{person.mtdSold}</TableCell>
                <TableCell className="text-right">{person.mtdAppointments}</TableCell>
                <TableCell className="text-right">{person.mtdOpportunities}</TableCell>
                <TableCell className="text-right">{person.mtdOutboundCalls}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {selectedPerson && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">{selectedPerson.name}'s Performance</h2>
          <div className="h-[400px]">
            <SalesChart data={selectedPerson} />
          </div>
        </Card>
      )}
    </div>
  )
}