'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface SalesChartProps {
  data: {
    mtdSold: number
    mtdAppointments: number
    mtdOpportunities: number
    mtdOutboundCalls: number
  }
}

export default function SalesChart({ data }: SalesChartProps) {
  const chartData = {
    labels: ['MTD Sold', 'MTD Appointments', 'MTD Opportunities', 'MTD Outbound Calls'],
    datasets: [
      {
        label: 'Performance Metrics',
        data: [
          data.mtdSold,
          data.mtdAppointments,
          data.mtdOpportunities,
          data.mtdOutboundCalls,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Sales Performance Metrics',
      },
    },
  }

  return <Bar data={chartData} options={options} />
}