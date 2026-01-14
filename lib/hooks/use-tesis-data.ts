import { useState, useEffect } from 'react';
import { TesisRecord } from '@/app/api/tesis/route';

interface UseTesisDataOptions {
  year?: number;
}

export function useTesisData(options: UseTesisDataOptions = {}) {
  const [data, setData] = useState<TesisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch('/api/tesis');
        
        if (!response.ok) {
          throw new Error('Failed to fetch tesis data');
        }

        const result = await response.json();
        
        // Filter by year if specified
        const filteredData = options.year
          ? result.filter((record: TesisRecord) => record.year === options.year)
          : result;
        
        setData(filteredData);
        setError(null);
      } catch (err) {
        console.error('Error fetching tesis data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [options.year]);

  // Get unique years
  const years = Array.from(new Set(data.map(record => record.year)))
    .sort((a, b) => b - a);

  // Get unique themes
  const themes = Array.from(new Set(data.map(record => record.themesAssets)));

  return {
    data,
    loading,
    error,
    years,
    themes,
  };
}
