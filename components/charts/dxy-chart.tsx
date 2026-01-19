"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
);

interface DXYData {
  date: string;
  DXY?: number | null;
  Median?: number | null;
  High?: number | null;
  Low?: number | null;
  [key: string]: number | string | null | undefined;
}

interface DXYResponse {
  headers: string[];
  data: DXYData[];
  comments: { [key: string]: string };
}

export function DXYChart() {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef<Chart<'line'> | null>(null);
  const [labelPositions, setLabelPositions] = useState<Array<{ text: string, x: number, y: number, color: string }>>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/dxy');
        const result: DXYResponse = await response.json();

        const endOfMonthData = (() => {
          const lastByMonth = new Map<string, DXYData>();
          result.data.forEach((d) => {
            const dateObj = new Date(d.date);
            if (isNaN(dateObj.getTime())) return;
            const key = `${dateObj.getFullYear()}-${dateObj.getMonth()}`;
            lastByMonth.set(key, d);
          });

          const filtered = result.data.filter((d) => {
            const dateObj = new Date(d.date);
            if (isNaN(dateObj.getTime())) return false;
            const key = `${dateObj.getFullYear()}-${dateObj.getMonth()}`;
            return lastByMonth.get(key) === d;
          });

          return filtered.length ? filtered : result.data;
        })();

        const normalizedData = (() => {
          const data = [...endOfMonthData];
          const anchorDate = new Date("2025-12-31");
          const anchorKey = anchorDate.toISOString().slice(0, 10);

          const lastHistorical = [...data]
            .filter(d => {
              const dateObj = new Date(d.date);
              return !isNaN(dateObj.getTime()) && dateObj <= anchorDate && d.DXY !== null && d.DXY !== undefined;
            })
            .at(-1)?.DXY ?? null;

          const hasAnchor = data.some(d => d.date === anchorKey);
          const hasProjection = data.some(d => d.Median !== null || d.High !== null || d.Low !== null);

          if (!hasAnchor && lastHistorical !== null && hasProjection) {
            data.push({
              date: anchorKey,
              DXY: lastHistorical,
              Median: lastHistorical,
              High: lastHistorical,
              Low: lastHistorical
            });
          } else if (hasAnchor && lastHistorical !== null) {
            data.forEach(d => {
              if (d.date === anchorKey) {
                d.Median = d.Median ?? lastHistorical;
                d.High = d.High ?? lastHistorical;
                d.Low = d.Low ?? lastHistorical;
              }
            });
          }

          return data.sort((a, b) => {
            const da = new Date(a.date).getTime();
            const db = new Date(b.date).getTime();
            return da - db;
          });
        })();

        // Parse dates YYYY-MM-DD
        const labels = normalizedData.map(d => {
            const dateObj = new Date(d.date);
            if (isNaN(dateObj.getTime())) return d.date;
            
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthName = monthNames[dateObj.getMonth()];
            const year = dateObj.getFullYear();
            
             // Return format: Mon YYYY
            return `${monthName} ${year}`;
        });

        const datasets = [];

        // Historical DXY
        const dxyData = normalizedData.map(d => d.DXY);
        datasets.push({
          label: 'DXY Historical',
          data: dxyData,
          borderColor: '#1e40af', // Blue like S&P/Fed
          backgroundColor: 'rgba(30, 64, 175, 0.1)',
          borderWidth: 3,
          pointRadius: 0,
          tension: 0.1,
          fill: false,
          datalabels: { display: false }
        });

        // Projections
        // Median
        const medianData = normalizedData.map(d => d.Median);
        datasets.push({
            label: 'Median Consensus',
            data: medianData,
            borderColor: '#DAA520', // Gold/Neutral
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            tension: 0.1,
            fill: false,
            datalabels: { display: false }
        });

        // High
        const highData = normalizedData.map(d => d.High);
        datasets.push({
            label: 'High Estimate',
            data: highData,
            borderColor: '#16a34a', // Green
            borderWidth: 2,
            borderDash: [2, 2],
            pointRadius: 0,
            tension: 0.1,
            fill: false,
            datalabels: { display: false }
        });
        
         // Low
        const lowData = normalizedData.map(d => d.Low);
        datasets.push({
            label: 'Low Estimate',
            data: lowData,
            borderColor: '#dc2626', // Red
            borderWidth: 2,
            borderDash: [2, 2],
            pointRadius: 0,
            tension: 0.1,
            fill: false,
            datalabels: { display: false }
        });

        // Capture last values for custom labels
        const lasts = [];
        
        // Helper to find last valid
        const findLast = (arr: (number|null|undefined)[]) => {
            for(let i=arr.length-1; i>=0; i--) {
                if(arr[i] !== null && arr[i] !== undefined) return arr[i];
            }
            return null;
        }

        const lastMedian = findLast(medianData);
        if (lastMedian) lasts.push({ label: 'Median', value: lastMedian, color: '#DAA520' });
        
        const lastHigh = findLast(highData);
        if (lastHigh) lasts.push({ label: 'High', value: lastHigh, color: '#16a34a' });
        
        const lastLow = findLast(lowData);
        if (lastLow) lasts.push({ label: 'Low', value: lastLow, color: '#dc2626' });

        setChartData({
          labels,
          datasets,
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching DXY data:', error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const updateLabelPositions = useCallback(() => {
    if (chartRef.current) {
        const chart = chartRef.current;
        const positions: Array<{ text: string, x: number, y: number, color: string }> = [];
        
        chart.data.datasets.forEach((dataset: any, i: number) => {
             const meta = chart.getDatasetMeta(i);
             // Find last index within the dataset that has a value
             const data = dataset.data as (number|null)[];
             let lastIndex = data.length - 1;
             while(lastIndex >= 0 && (data[lastIndex] === null || data[lastIndex] === undefined)) {
                 lastIndex--;
             }

             if (lastIndex >= 0 && !meta.hidden) {
                 const point = meta.data[lastIndex];
                 if (point) {
                     let text = '';
                     let color = dataset.borderColor as string;
                     
                     if (dataset.label?.includes('Median')) text = 'Median Consensus';
                     if (dataset.label?.includes('High')) text = 'High Estimate';
                     if (dataset.label?.includes('Low')) text = 'Low Estimate';
                     
                     if (text) {
                         positions.push({
                             text,
                             x: point.x,
                             y: point.y,
                             color
                         });
                     }
                 }
             }
        });
        setLabelPositions(positions);
    }
  }, []);
  
  // Trigger update on data load and resize
  useEffect(() => {
    // Initial delay then updates
    const timers = [
        setTimeout(updateLabelPositions, 100),
        setTimeout(updateLabelPositions, 500),
        setTimeout(updateLabelPositions, 1000)
    ];
    
    const handleResize = () => setTimeout(updateLabelPositions, 100);
    window.addEventListener('resize', handleResize);
    
    return () => {
        timers.forEach(t => clearTimeout(t));
        window.removeEventListener('resize', handleResize);
    };
  }, [chartData, updateLabelPositions]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
        duration: 300,
        onComplete: () => {
            updateLabelPositions();
        }
    },
    layout: {
      padding: {
        top: 20,
        right: 150, // More space for long labels like "Median Consensus"
        bottom: 10,
        left: 10
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      datalabels: {
        display: false,
      },
      legend: {
        display: false, // Hidden as requested
      },
      title: {
        display: true,
        text: 'Outlooks 2026 DXY',
        font: {
          size: 18,
          weight: 'bold' as const,
        },
        padding: {
          top: 10,
          bottom: 15,
        },
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grace: '5%',
        ticks: {
          font: {
            size: 11,
          },
          padding: 5
        },
        title: {
          display: true,
          text: 'DXY Index',
          font: {
            size: 12,
            weight: 'bold' as const,
          },
          padding: { top: 5, bottom: 5 }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          autoSkipPadding: 20,
          maxTicksLimit: 20,
          font: {
            size: 9,
          },
          padding: 5,
        },
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 12,
            weight: 'bold' as const,
          },
          padding: { top: 5, bottom: 5 }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          display: true
        }
      }
    }
  }), []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading data...</div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Error loading data</div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col p-6">
      <div className="w-full mb-8 relative" style={{ height: '500px' }}>
        <Line
          ref={chartRef}
          data={chartData}
          options={options}
        />
        
        {/* Inline labels relative to the canvas lines */}
        {labelPositions.map((pos, i) => (
            <div
                key={i}
                className="absolute pointer-events-none text-xs font-bold px-2 py-0.5 rounded bg-white/80 shadow-sm border border-gray-100"
                style={{
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    color: pos.color,
                    transform: 'translate(5px, -50%)', // Shift right of the point, vertically centered
                    whiteSpace: 'nowrap'
                }}
            >
                {pos.text}
            </div>
        ))}
      </div>
    </div>
  );
}
