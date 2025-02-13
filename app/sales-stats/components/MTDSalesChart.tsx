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

interface MTDSalesChartProps {
  salesData: Array<{
    name: string
    mtdSold: number
  }>
}

export default function MTDSalesChart({ salesData }: MTDSalesChartProps) {
  const chartData = {
    labels: salesData.map(person => person.name),
    datasets: [
      {
        label: 'MTD Sales',
        data: salesData.map(person => person.mtdSold),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
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
        ticks: {
          stepSize: 1,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'MTD Sales Comparison',
      },
    },
  }

  return <Bar data={chartData} options={options} />
}