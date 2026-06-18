import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartOptions,
  ChartData
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type ChartType = 'bar' | 'donut';

type ChartComponentProps = {
  type: ChartType;
  data: any[];
  height?: number;
  width?: number;
  className?: string;
  options?: ChartOptions<'bar' | 'doughnut'>;
};

const ChartComponent = ({
  type,
  data,
  height = 300,
  width = 500,
  className = '',
  options
}: ChartComponentProps) => {
  const getBarChartData = (): ChartData<'bar'> => {
    return {
      labels: data.map(item => item.name),
      datasets: [
        {
          label: 'Value',
          data: data.map(item => item.value),
          backgroundColor: data.map(item => item.color || '#5EC8FF'),
          borderColor: data.map(item => item.borderColor || 'transparent'),
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 40,
          barPercentage: 0.6,
        },
      ],
    };
  };

  const getDonutChartData = (): ChartData<'doughnut'> => {
    return {
      labels: data.map(item => item.name),
      datasets: [
        {
          data: data.map(item => item.value),
          backgroundColor: data.map(item => item.color || '#5EC8FF'),
          borderColor: data.map(item => item.borderColor || 'transparent'),
          borderWidth: 1,
          hoverOffset: 4,
        },
      ],
    };
  };

  const defaultBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#000',
        padding: 10,
        cornerRadius: 6,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        beginAtZero: true,
      },
    },
  };

  const defaultDonutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: '#000',
        padding: 10,
        cornerRadius: 6,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
      },
    },
    cutout: '70%',
  };

  const chartOptions = options || (type === 'bar' ? defaultBarOptions : defaultDonutOptions);

  return (
    <div className={`chart-container ${className}`} style={{ height, width }}>
      {type === 'bar' && <Bar data={getBarChartData()} options={chartOptions as ChartOptions<'bar'>} />}
      {type === 'donut' && <Doughnut data={getDonutChartData()} options={chartOptions as ChartOptions<'doughnut'>} />}
    </div>
  );
};

export default ChartComponent; 