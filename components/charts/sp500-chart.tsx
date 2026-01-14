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
import type { ChartJSOrUndefined } from 'react-chartjs-2/dist/types';

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

interface SP500Data {
  date: string;
  [key: string]: number | string | null;
}

interface SP500Response {
  headers: string[];
  data: SP500Data[];
  comments: { [key: string]: string };
}

const FIRM_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
];

export function SP500Chart() {
  const [chartData, setChartData] = useState<any>(null);
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  const [firmProjections, setFirmProjections] = useState<Array<{firm: string, value: number, color: string, dataIndex: number}>>([]);
  const [loading, setLoading] = useState(true);
  const [labelPositions, setLabelPositions] = useState<Array<{firm: string, x: number, y: number, value: number, color: string}>>([]);
  const chartRef = useRef<ChartJSOrUndefined<'line'>>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/sp500');
        const result: SP500Response = await response.json();

        // Parse and format dates from D/MM/YYYY to Month YYYY for display
        const labels = result.data.map(d => {
          const parts = d.date.split('/');
          if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1];
            const year = parts[2];
            
            const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                               'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            const monthName = monthNames[parseInt(month) - 1];
            
            // Return format: DD Mon YYYY (e.g., "02 Ene 2025")
            return `${day} ${monthName} ${year}`;
          }
          return d.date;
        });

        const datasets = [];

        // Add SP500 actual data as solid line
        const sp500Data = result.data.map(d => d.SP500);

        // Find the last non-null SP500 value and its index
        let lastSP500Value = null;
        let lastSP500Index = -1;
        for (let i = sp500Data.length - 1; i >= 0; i--) {
          if (sp500Data[i] !== null) {
            lastSP500Value = sp500Data[i];
            lastSP500Index = i;
            break;
          }
        }

        datasets.push({
          label: 'S&P 500 (Actual)',
          data: sp500Data,
          borderColor: '#1e40af',
          backgroundColor: 'rgba(30, 64, 175, 0.1)',
          borderWidth: 3,
          pointRadius: 0,
          tension: 0.1,
          fill: false,
          datalabels: {
            display: false
          }
        });

        // Add firm projections as dashed lines
        const firms = result.headers.filter(h => h !== 'SP500');

        // Group firms by their projection value
        const firmsByValue: { [key: string]: string[] } = {};
        const firmProjections: { [key: string]: { value: any, index: number } } = {};

        firms.forEach((firm) => {
          const firmData = result.data.map(d => d[firm]);
          let lastFirmValue = null;
          let lastFirmIndex = -1;

          for (let i = firmData.length - 1; i >= 0; i--) {
            if (firmData[i] !== null) {
              lastFirmValue = firmData[i];
              lastFirmIndex = i;
              break;
            }
          }

          if (lastFirmValue !== null && lastSP500Value !== null && lastFirmIndex > lastSP500Index) {
            firmProjections[firm] = { value: lastFirmValue, index: lastFirmIndex };

            if (!firmsByValue[lastFirmValue]) {
              firmsByValue[lastFirmValue] = [];
            }
            firmsByValue[lastFirmValue].push(firm);
          }
        });

        // Sort firmProjections by value (highest to lowest)
        const sortedFirms = Object.keys(firmProjections).sort((a, b) => {
          return firmProjections[b].value - firmProjections[a].value;
        });

        // Create datasets with grouped labels, ordered by highest to lowest
        const firmProjectionsList: Array<{firm: string, value: number, color: string}> = [];
        let colorIndex = 0;
        sortedFirms.forEach((firm) => {
          const { value: lastFirmValue, index: lastFirmIndex } = firmProjections[firm];

          // Create data array that connects from last SP500 point to firm projection
          const projectionData = result.data.map((d, idx) => {
            if (idx === lastSP500Index) {
              return lastSP500Value;
            } else if (idx === lastFirmIndex) {
              return lastFirmValue;
            } else if (idx > lastSP500Index && idx < lastFirmIndex) {
              return null;
            }
            return null;
          });

          // Get all firms with same value for grouped label
          const groupedFirms = firmsByValue[lastFirmValue];
          const isFirstInGroup = groupedFirms[0] === firm;
          const groupLabel = groupedFirms.join(', ');

          datasets.push({
            label: firm,
            data: projectionData,
            borderColor: FIRM_COLORS[colorIndex % FIRM_COLORS.length],
            backgroundColor: FIRM_COLORS[colorIndex % FIRM_COLORS.length],
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: (context: any) => {
              // Show point only at the end of projection line
              return context.dataIndex === lastFirmIndex ? 5 : 0;
            },
            pointHoverRadius: 8,
            pointStyle: 'circle',
            tension: 0.1,
            fill: false,
            spanGaps: true,
            datalabels: {
              display: false  // We'll use HTML labels instead
            }
          });

          // Add to firm projections list for legend
          firmProjectionsList.push({
            firm: firm,
            value: lastFirmValue,
            color: FIRM_COLORS[colorIndex % FIRM_COLORS.length],
            dataIndex: lastFirmIndex
          });

          colorIndex++;
        });

        setFirmProjections(firmProjectionsList);

        setChartData({
          labels,
          datasets,
        });
        setComments(result.comments || {});
        console.log('Comments loaded:', result.comments);
        console.log('Firm projections:', firmProjectionsList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching SP500 data:', error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 300,
      onComplete: () => {
        // Positions will be updated by the effect
      }
    },
    layout: {
      padding: {
        top: 20,
        right: 200,
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
        display: true,
        clip: false,
      },
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Outlooks 2026 S&P500',
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
        enabled: false
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grace: '5%',
        ticks: {
          callback: function (value: any) {
            return value.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            });
          },
          font: {
            size: 11,
          },
          padding: 5
        },
        title: {
          display: true,
          text: 'Índice S&P 500',
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
          align: 'center' as const
        },
        title: {
          display: true,
          text: 'Fecha (Frecuencia Diaria)',
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
  }), [comments]);

  // Calculate label positions when chart updates
  const updateLabelPositions = useCallback(() => {
    if (chartRef.current && firmProjections.length > 0) {
      const chart = chartRef.current;
      const positions: Array<{firm: string, x: number, y: number, value: number, color: string}> = [];
      
      // Group firms by value
      const firmsByValue: { [key: number]: Array<{firm: string, color: string, dataIndex: number}> } = {};
      firmProjections.forEach(fp => {
        if (!firmsByValue[fp.value]) {
          firmsByValue[fp.value] = [];
        }
        firmsByValue[fp.value].push({ firm: fp.firm, color: fp.color, dataIndex: fp.dataIndex });
      });
      
      // For each unique value, create one label position
      Object.entries(firmsByValue).forEach(([value, firms]) => {
        const firstFirm = firms[0];
        // Find the dataset index for this firm
        const datasetIndex = chart.data.datasets.findIndex((ds: any) => ds.label === firstFirm.firm);
        if (datasetIndex !== -1) {
          const meta = chart.getDatasetMeta(datasetIndex);
          const point = meta.data[firstFirm.dataIndex];
          if (point) {
            positions.push({
              firm: firms.map(f => f.firm).join(', '),
              x: point.x,
              y: point.y,
              value: parseFloat(value),
              color: firstFirm.color
            });
          }
        }
      });
      
      setLabelPositions(positions);
    }
  }, [firmProjections]);

  useEffect(() => {
    // Update positions after chart renders with multiple attempts
    const timers = [
      setTimeout(updateLabelPositions, 100),
      setTimeout(updateLabelPositions, 300),
      setTimeout(updateLabelPositions, 500),
      setTimeout(updateLabelPositions, 1000),
    ];
    
    // Also update on window resize
    const handleResize = () => {
      setTimeout(updateLabelPositions, 100);
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      timers.forEach(t => clearTimeout(t));
      window.removeEventListener('resize', handleResize);
    };
  }, [chartData, updateLabelPositions]);

  // Update positions when chart reference changes
  useEffect(() => {
    if (chartRef.current) {
      const chart = chartRef.current;
      // Listen to chart animation complete
      const originalAfterRender = chart.options.animation?.onComplete;
      if (chart.options.animation) {
        chart.options.animation.onComplete = function(animation: any) {
          if (originalAfterRender) originalAfterRender.call(this, animation);
          updateLabelPositions();
        };
      }
    }
  }, [chartRef.current, updateLabelPositions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Cargando datos...</div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Error al cargar los datos</div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col p-6">
      {/* Chart Section with interactive labels */}
      <div className="w-full mb-8 relative" style={{ height: '500px' }}>
        <Line 
          ref={chartRef} 
          data={chartData} 
          options={options}
        />
        
        {/* Interactive HTML labels for each firm */}
        {labelPositions.map(({ firm, x, y, value, color }) => {
          // Get all firms in this group
          const firmsInGroup = firm.split(', ');
          
          return (
            <div
              key={firm}
              className="absolute pointer-events-auto"
              style={{
                left: `${x + 8}px`,
                top: `${y}px`,
                transform: 'translateY(-50%)',
                zIndex: 10
              }}
            >
              {/* Labels arranged horizontally for firms with same value */}
              <div className="flex flex-row items-center gap-1">
                {firmsInGroup.map((singleFirm, idx) => (
                  <div key={singleFirm} className="relative group">
                    <div 
                      className="text-[9px] font-bold cursor-pointer px-1 py-0.5 rounded whitespace-nowrap hover:bg-gray-100 transition-colors"
                      style={{ color: color }}
                    >
                      {singleFirm}{idx === firmsInGroup.length - 1 ? ` ${Math.round(value).toLocaleString()}` : ','} 
                    </div>
                    
                    {/* Tooltip */}
                    {comments[singleFirm] && (
                      <div className="absolute z-[100] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 left-full ml-2 top-1/2 -translate-y-1/2" style={{ width: '320px' }}>
                        <div className="bg-gray-900 text-white text-xs rounded-lg p-4 shadow-2xl">
                          <div className="font-bold mb-2 pb-2 border-b border-gray-600 flex justify-between items-center">
                            <span>💬 {singleFirm}</span>
                            <span className="text-gray-300">{Math.round(value).toLocaleString()}</span>
                          </div>
                          <p className="leading-relaxed mt-2 text-[11px]">{comments[singleFirm]}</p>
                          <div className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-full border-8 border-transparent border-r-gray-900"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
