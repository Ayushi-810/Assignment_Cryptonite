'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Chart, LineController, LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend, CategoryScale } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';

Chart.register(LineController, LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend, CategoryScale);

const CoinPriceChart = ({ isDarkMode, coinId, historicalData }) => {
  const chartRef = useRef(null);
  const [timeRange, setTimeRange] = useState('24h');
  const chartInstanceRef = useRef(null);

  const filterDataByTimeRange = (data, range) => {
    const now = new Date();
    const pastDate = new Date();
    switch (range) {
      case '24h':
        pastDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        pastDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        pastDate.setMonth(now.getMonth() - 1);
        break;
      default:
        pastDate.setDate(now.getDate() - 1);
    }
    return data.filter(d => new Date(d.date) >= pastDate);
  };

  useEffect(() => {
    const createChart = () => {
      if (chartRef.current && historicalData) {
        const filteredData = filterDataByTimeRange(historicalData, timeRange);

        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        chartInstanceRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: filteredData.map(d => d.date),
            datasets: [{
              label: 'Price',
              data: filteredData.map(d => d.price),
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.4,
              borderWidth: 1.5,
              pointRadius: 0,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                type: 'time',
                time: {
                  unit: 'day',
                  tooltipFormat: 'MMM d',
                },
                ticks: {
                  color: isDarkMode ? 'white' : 'black',
                },
                grid: {
                  color: isDarkMode ? '#444' : '#ccc',
                },
              },
              y: {
                ticks: {
                  color: isDarkMode ? 'white' : 'black',
                },
                grid: {
                  color: isDarkMode ? '#444' : '#ccc',
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: (context) => `$${context.parsed.y.toFixed(2)}`,
                },
              },
            },
          },
        });
      }
    };

    createChart();

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [historicalData, isDarkMode, timeRange]);

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  return (
    <div className="relative w-full h-[350px]">
      <canvas ref={chartRef} className="w-full h-full"></canvas>
      <div className="absolute top-0 right-0 mt-2 mr-2">
        <button onClick={() => handleTimeRangeChange('24h')} className={`px-2 py-1 text-xs font-semibold ${timeRange === '24h' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>24h</button>
        <button onClick={() => handleTimeRangeChange('7d')} className={`ml-2 px-2 py-1 text-xs font-semibold ${timeRange === '7d' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>7d</button>
        <button onClick={() => handleTimeRangeChange('30d')} className={`ml-2 px-2 py-1 text-xs font-semibold ${timeRange === '30d' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>30d</button>
      </div>
    </div>
  );
};

export default CoinPriceChart;
