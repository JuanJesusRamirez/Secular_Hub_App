import { useState, useEffect } from 'react';
import { BumpChartData, ThemeRanking } from '@/lib/db/queries';

interface UseThemeRankingsOptions {
  startYear?: number;
  endYear?: number;
  topN?: number;
}

interface UseThemeRankingsResult {
  data: BumpChartData | null;
  loading: boolean;
  error: string | null;
  selectedTheme: string | null;
  setSelectedTheme: (theme: string | null) => void;
  getThemeData: (theme: string) => ThemeRanking[];
}

export function useThemeRankings(options: UseThemeRankingsOptions = {}): UseThemeRankingsResult {
  const { startYear = 2019, endYear = 2026, topN = 10 } = options;

  const [data, setData] = useState<BumpChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/themes/rankings?start=${startYear}&end=${endYear}&top=${topN}`
        );

        if (!res.ok) {
          throw new Error('Failed to fetch theme rankings');
        }

        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error('Theme rankings fetch error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startYear, endYear, topN]);

  const getThemeData = (theme: string): ThemeRanking[] => {
    if (!data) return [];
    return data.rankings.filter(r => r.theme === theme).sort((a, b) => a.year - b.year);
  };

  return {
    data,
    loading,
    error,
    selectedTheme,
    setSelectedTheme,
    getThemeData
  };
}
