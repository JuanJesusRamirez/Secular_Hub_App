"use client";

import { useEffect, useState } from 'react';
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

interface FEDRateData {
  date: string;
  [key: string]: number | string | null;
}

interface FEDRateResponse {
  headers: string[];
  data: FEDRateData[];
  comments: { [key: string]: string };
}

const FIRM_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
];

export function FEDRateChart() {
  const [chartData, setChartData] = useState<any>(null);
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/fed-rate');
        const result: FEDRateResponse = await response.json();
        
        const labels = result.data.map(d => d.date);
        const datasets = [];
        
        const fedData = result.data.map(d => d['DFEDTARU']);
        
        let lastFEDValue = null;
        let lastFEDIndex = -1;
        for (let i = fedData.length - 1; i >= 0; i--) {
          if (fedData[i] !== null) {
            lastFEDValue = fedData[i];
            lastFEDIndex = i;
            break;
          }
        }
        
        datasets.push({
          label: 'FED Rate (Actual)',
          data: fedData,
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
        
        const firms = result.headers.filter(h => h !== 'DFEDTARU');
        
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
          
          if (lastFirmValue !== null && lastFEDValue !== null && lastFirmIndex > lastFEDIndex) {
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
        
        let colorIndex = 0;
        sortedFirms.forEach((firm) => {
          const { value: lastFirmValue, index: lastFirmIndex } = firmProjections[firm];
          
          const projectionData = result.data.map((d, idx) => {
            if (idx === lastFEDIndex) {
              return lastFEDValue;
            } else if (idx === lastFirmIndex) {
              return lastFirmValue;
            } else if (idx > lastFEDIndex && idx < lastFirmIndex) {
              return null;
            }
            return null;
          });
          
          const groupedFirms = firmsByValue[lastFirmValue];
          const isFirstInGroup = groupedFirms[0] === firm;
          
          datasets.push({
            label: firm,
            data: projectionData,
            borderColor: FIRM_COLORS[colorIndex % FIRM_COLORS.length],
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            pointHoverRadius: 6,
            tension: 0.1,
            fill: false,
            spanGaps: true,
            datalabels: {
              align: 'right',
              anchor: 'end',
              offset: 4,
              color: FIRM_COLORS[colorIndex % FIRM_COLORS.length],
              font: {
                size: 9,
                weight: 'bold'
              },
              formatter: (value: any, context: any) => {
                if (value !== null && context.dataIndex === lastFirmIndex && isFirstInGroup) {
                  if (groupedFirms.length > 1) {
                    return `${groupedFirms.join(', ')} ${value.toFixed(2)}%`;
                  } else {
                    return `${firm} ${value.toFixed(2)}%`;
                  }
                }
                return '';
              }
            }
          });
          
          colorIndex++;
        });
        
        setChartData({
          labels,
          datasets,
        });
        setComments(result.comments || {});
        setLoading(false);
      } catch (error) {
        console.error('Error fetching FED Rate data:', error);
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        right: 150,
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
        text: 'Outlooks 2026 FED Rate',
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
        position: 'nearest' as const,
        yAlign: 'center' as const,
        xAlign: 'left' as const,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#fff',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2) + '%';
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grace: '5%',
        ticks: {
          callback: function(value: any) {
            return value.toFixed(2) + '%';
          },
          font: {
            size: 11,
          },
          padding: 5
        },
        title: {
          display: true,
          text: 'Tasa de Interés (%)',
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
          maxTicksLimit: 15,
          font: {
            size: 9,
          },
          padding: 5
        },
        title: {
          display: true,
          text: 'Fecha',
          font: {
            size: 12,
            weight: 'bold' as const,
          },
          padding: { top: 5, bottom: 5 }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      }
    }
  };

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
      <div className="w-full mb-8" style={{ height: '500px' }}>
        <Line data={chartData} options={options} />
      </div>
      
      <div className="w-full">
        <h3 className="text-xl font-bold mb-6 text-gray-900">Comentarios de las Firmas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(comments).map(([firm, comment]) => (
            <div
              key={firm}
              className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <h4 className="font-bold text-base mb-3 text-gray-900">{firm}</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{comment}</p>
            </div>
          ))}
        </div>
        
        {/* Metodological Note */}
        <div className="mt-8 p-4 bg-gray-50 border-l-4 border-blue-500 rounded">
          <p className="text-xs text-gray-600 italic">
            <strong>Nota Metodológica:</strong> Tomamos las 10 firmas de mayor convicción con datos disponibles que daba el ranking de outlooks 2026 de Bloomberg.
          </p>
        </div>
      </div>
    </div>
  );
}