import { useState, useCallback, useEffect } from 'react';

interface UseAiSummaryProps {
  year?: number;
  themeCategory?: string;
  initialAutoFetch?: boolean;
}

export function useAiSummary({ year = 2026, themeCategory, initialAutoFetch = true }: UseAiSummaryProps = {}) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year,
          theme_category: themeCategory,
          max_calls: 30
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      setSummary(data.summary || data.result || data.text || "Summary generated.");
    } catch (err) {
      console.error(err);
      setError('Failed to load AI summary');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialAutoFetch) {
      fetchSummary();
    }
  }, [fetchSummary, initialAutoFetch]);

  return { summary, loading, error, regenerate: fetchSummary };
}
