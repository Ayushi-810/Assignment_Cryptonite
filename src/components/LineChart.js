'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHistoricalData } from '../redux/slices/historicalDataSlice';
import { Chart, LineController, LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend, CategoryScale } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(LineController, LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend, CategoryScale);

const LineChart = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const { data, status, error } = useSelector((state) => state.historicalData);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchHistoricalData());
    }
  }, [status, dispatch]);

  const filterDataByTimeRange = (data, range) => {
    const now = new Date();
    const pastDate = new Date(now.getTime());

    switch (range) {
      case '24h':
        pastDate.setDate(pastDate.getDate() - 1);
        break;
      case '7d':
        pastDate.setDate(pastDate.getDate() - 7);
        break;
      case '30d':
        pastDate.setMonth(pastDate.getMonth() - 1);
        break;
      default:
        pastDate.setMonth(pastDate.getMonth() - 1);
    }

    return data.map(coin => ({
      ...coin,
      prices: coin.prices.filter(price => new Date(price[0]) >= pastDate)
    }));
  };

  useEffect(() => {
    if (status === 'succeeded' && chartRef.current) {
      const ctx = chartRef.current.getContext('2d');

      const filteredData = filterDataByTimeRange(data, timeRange);

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: filteredData.map((coin) => ({
            label: coin.name,
            data: coin.prices.map((price) => ({ x: new Date(price[0]), y: price[1] })),
            fill: false,
            borderColor: coin.name === 'bitcoin' ? 'rgb(58, 134, 255)' :
                         coin.name === 'ethereum' ? 'rgb(255, 140, 0)' :
                         'rgb(255, 105, 180)',
            tension: 0.1,
            borderWidth: 1.5,
            pointRadius: 0,
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false, // Make chart responsive
          scales: {
            x: {
              type: 'time',
              time: {
                unit: timeRange === '24h' ? 'hour' : 'day'
              },
              title: {
                display: true,
                text: 'Date'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Price (USD)'
              },
              beginAtZero: false
            }
          },
          plugins: {
            title: {
              display: true,
              text: `Price Chart - ${timeRange}`
            },
            legend: {
              display: true
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          }
        }
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data, status, timeRange]);

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  if (status === 'loading') {
    return <div className="text-center text-gray-600">Loading Graphics...</div>;
  }

  if (status === 'failed') {
    return <div className="text-center text-red-500">Error loading graphics: {error}</div>;
  }

  return (
    <div className='w-full'>
      <div className="relative w-full min-h-[400px]"> {/* Ensure container height for responsiveness */}
        <canvas ref={chartRef} />
      </div>
      <div className={`theme-transition ${isDarkMode ? "text-white" : "text-black"} flex flex-col md:flex-row justify-center gap-2 text-xs py-2`}>
        <button 
          onClick={() => handleTimeRangeChange('24h')} 
          className={`theme-transition ${isDarkMode ? timeRange === '24h' ? "bg-gray-600" : "bg-gray-800 hover:bg-gray-700" : timeRange === '24h' ? "bg-gray-400" : "bg-gray-300 hover:bg-gray-200"} py-1 px-3 rounded-md`}
        >
          24h
        </button>
        <button 
          onClick={() => handleTimeRangeChange('7d')} 
          className={`theme-transition ${isDarkMode ? timeRange === '7d' ? "bg-gray-600" : "bg-gray-800 hover:bg-gray-700" : timeRange === '7d' ? "bg-gray-400" : "bg-gray-300 hover:bg-gray-200"} py-1 px-3 rounded-md`}
        >
          7d
        </button>
        <button 
          onClick={() => handleTimeRangeChange('30d')} 
          className={`theme-transition ${isDarkMode ? timeRange === '30d' ? "bg-gray-600" : "bg-gray-800 hover:bg-gray-700" : timeRange === '30d' ? "bg-gray-400" : "bg-gray-300 hover:bg-gray-200"} py-1 px-3 rounded-md`}
        >
          30d
        </button>
      </div>
    </div>
  );
};

export default LineChart;
