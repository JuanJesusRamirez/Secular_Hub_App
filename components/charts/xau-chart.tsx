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

interface XAUData {
  date: string;
  [key: string]: number | string | null;
}

interface XAUResponse {
  headers: string[];
  data: XAUData[];
  comments: { [key: string]: string };
}

const FIRM_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
];

export function XAUChart() {
  const [chartData, setChartData] = useState<any>(null);
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  const [firmProjectionsList, setFirmProjectionsList] = useState<Array<{firm: string, value: number, color: string, dataIndex: number}>>([]);
  const [loading, setLoading] = useState(true);
  const [labelPositions, setLabelPositions] = useState<Array<{firm: string, x: number, y: number, value: number, color: string}>>([]);
  const chartRef = useRef<ChartJSOrUndefined<'line'>>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/xau');
        const result: XAUResponse = await response.json();

        const labels = result.data.map(d => d.date);
        const datasets = [];

        const xauData = result.data.map(d => d['AUX/USD']);

        let lastXAUValue = null;
        let lastXAUIndex = -1;
        for (let i = xauData.length - 1; i >= 0; i--) {
          if (xauData[i] !== null) {
            lastXAUValue = xauData[i];
            lastXAUIndex = i;
            break;
          }
        }

        datasets.push({
          label: 'XAU/USD (Actual)',
          data: xauData,
          borderColor: '#DAA520',
          backgroundColor: 'rgba(218, 165, 32, 0.1)',
          borderWidth: 3,
          pointRadius: 0,
          tension: 0.1,
          fill: false,
          datalabels: {
            display: false
          }
        });

        const firms = result.headers.filter(h => h !== 'AUX/USD');

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

          if (lastFirmValue !== null && lastXAUValue !== null && lastFirmIndex > lastXAUIndex) {
            firmProjections[firm] = { value: lastFirmValue, index: lastFirmIndex };

            if (!firmsByValue[lastFirmValue]) {
              firmsByValue[lastFirmValue] = [];
            }
            firmsByValue[lastFirmValue].push(firm);
          }
        });

        const sortedFirms = Object.keys(firmProjections).sort((a, b) => {
          return firmProjections[b].value - firmProjections[a].value;
        });

        const projectionsList: Array<{firm: string, value: number, color: string, dataIndex: number}> = [];
        let colorIndex = 0;
        sortedFirms.forEach((firm) => {
          const { value: lastFirmValue, index: lastFirmIndex } = firmProjections[firm];

          const projectionData = result.data.map((d, idx) => {
            if (idx === lastXAUIndex) {
              return lastXAUValue;
            } else if (idx === lastFirmIndex) {
              return lastFirmValue;
            } else if (idx > lastXAUIndex && idx < lastFirmIndex) {
              return null;
            }
            return null;
          });

          datasets.push({
            label: firm,
            data: projectionData,
            borderColor: FIRM_COLORS[colorIndex % FIRM_COLORS.length],
            backgroundColor: FIRM_COLORS[colorIndex % FIRM_COLORS.length],
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: (context: any) => {
              return context.dataIndex === lastFirmIndex ? 5 : 0;
            },
            pointHoverRadius: 8,
            pointStyle: 'circle',
            tension: 0.1,
            fill: false,
            spanGaps: true,
            datalabels: {
              display: false
            }
          });

          projectionsList.push({
            firm: firm,
            value: lastFirmValue,
            color: FIRM_COLORS[colorIndex % FIRM_COLORS.length],
            dataIndex: lastFirmIndex
          });

          colorIndex++;
        });

        setFirmProjectionsList(projectionsList);

        setChartData({
          labels,
          datasets,
        });
        setComments(result.comments || {});
        setLoading(false);
      } catch (error) {
        console.error('Error fetching XAU data:', error);
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
        display: false,
        clip: false,
      },
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Outlooks 2026 XAU/USD',
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
          text: 'XAU/USD',
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
          maxTicksLimit: 20,
          font: {
            size: 9,
          },
          padding: 5
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
  }), []);

  // Calculate label positions when chart updates
  const updateLabelPositions = useCallback(() => {
    if (chartRef.current && firmProjectionsList.length > 0) {
      const chart = chartRef.current;
      const positions: Array<{firm: string, x: number, y: number, value: number, color: string}> = [];
      
      // Group firms by value
      const firmsByValue: { [key: number]: Array<{firm: string, color: string, dataIndex: number}> } = {};
      firmProjectionsList.forEach(fp => {
        if (!firmsByValue[fp.value]) {
          firmsByValue[fp.value] = [];
        }
        firmsByValue[fp.value].push({ firm: fp.firm, color: fp.color, dataIndex: fp.dataIndex });
      });
      
      // For each unique value, create one label position
      Object.entries(firmsByValue).forEach(([value, firms]) => {
        const firstFirm = firms[0];
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
  }, [firmProjectionsList]);

  useEffect(() => {
    const timers = [
      setTimeout(updateLabelPositions, 100),
      setTimeout(updateLabelPositions, 300),
      setTimeout(updateLabelPositions, 500),
      setTimeout(updateLabelPositions, 1000),
    ];
    
    const handleResize = () => {
      setTimeout(updateLabelPositions, 100);
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      timers.forEach(t => clearTimeout(t));
      window.removeEventListener('resize', handleResize);
    };
  }, [chartData, updateLabelPositions]);

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
      <div className="w-full mb-8 relative" style={{ height: '500px' }}>
        <Line 
          ref={chartRef} 
          data={chartData} 
          options={options}
        />
        
        {/* Interactive HTML labels for each firm */}
        {labelPositions.map(({ firm, x, y, value, color }) => {
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
