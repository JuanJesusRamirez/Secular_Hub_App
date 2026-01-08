import { useState, useCallback, useEffect } from 'react';

interface UseAiSummaryProps {
  initialAutoFetch?: boolean;
}

export function useAiSummary({ initialAutoFetch = true }: UseAiSummaryProps = {}) {
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
          prompt: "Generate a concise executive summary of the consensus application for 2026, highlighting key themes like inflation, growth, and monetary policy. Limit to 150 words.",
          context: "snapshot_2026" 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      // Assuming API returns { result: string } or similar. Adjust based on actual API.
      // If the API returns the string directly or in a different field, we'd adjust here.
      // Based on common patterns:
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
