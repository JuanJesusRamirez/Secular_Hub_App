"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { TrueWordRain } from "@/components/charts/word-rain-true";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CloudRain, Hash, Calendar, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WordRainWord {
  text: string;
  semanticX: number;
  avgTfidf: number;
  yearData: Record<number, { frequency: number; tfidf: number; sentiment?: number }>;
}

interface WordRainResponse {
  years: number[];
  words: WordRainWord[];
  serviceStatus: 'connected' | 'fallback';
}

interface SentimentResult {
  label: 'positive' | 'negative' | 'neutral';
  score: number;
  normalizedScore: number;
}

export default function WordRainPage() {
  const [wordLimit, setWordLimit] = useState<string>("300");
  const [data, setData] = useState<WordRainResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sentimentData, setSentimentData] = useState<Record<string, number>>({});
  const [sentimentLoading, setSentimentLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [panelWidth, setPanelWidth] = useState(900);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive panel width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth - 48;
        setPanelWidth(Math.min(1100, Math.max(600, width)));
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Fetch Word Rain data
  const fetchData = useCallback(async (limit: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", limit);
      const res = await fetch(`/api/stats/wordrain?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch word rain data");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch sentiment for words
  const fetchSentiment = useCallback(async (words: WordRainWord[]) => {
    if (words.length === 0) return;

    setSentimentLoading(true);
    try {
      const terms = words.map(w => w.text);
      const res = await fetch('/api/stats/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ terms }),
      });

      if (!res.ok) throw new Error("Failed to fetch sentiment");

      const json = await res.json();
      const newSentimentData: Record<string, number> = {};

      Object.entries(json.results).forEach(([term, result]) => {
        const r = result as SentimentResult;
        newSentimentData[term] = r.normalizedScore;
      });

      setSentimentData(newSentimentData);
    } catch (err) {
      console.error("Sentiment fetch error:", err);
    } finally {
      setSentimentLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(wordLimit);
  }, [wordLimit, fetchData]);

  // Fetch sentiment when words change
  useEffect(() => {
    if (data?.words && data.words.length > 0) {
      fetchSentiment(data.words);
    }
  }, [data?.words, fetchSentiment]);

  // Find peak word (highest average TF-IDF)
  const peakWord = data?.words?.reduce((max, w) =>
    w.avgTfidf > (max?.avgTfidf || 0) ? w : max
  , data?.words?.[0]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500" ref={containerRef}>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CloudRain className="h-6 w-6 text-primary" />
            Word Rain
          </h1>
          <p className="text-muted-foreground mt-1">
            Semantic evolution of Wall Street narratives over time.
            <span className="hidden sm:inline"> Position reflects semantic similarity.</span>
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Year Selector */}
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years (Aggregated)</SelectItem>
              {data?.years?.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Word Limit Selector */}
          <Select value={wordLimit} onValueChange={setWordLimit}>
            <SelectTrigger className="w-[140px]">
              <Hash className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Words" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="100">100 words</SelectItem>
              <SelectItem value="150">150 words</SelectItem>
              <SelectItem value="200">200 words</SelectItem>
              <SelectItem value="300">300 words</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Terms Analyzed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terms Analyzed</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{data?.words?.length || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">semantic positions</p>
          </CardContent>
        </Card>

        {/* Years Covered */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Years</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{data?.years?.length || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {data?.years?.[0]} - {data?.years?.[data.years.length - 1]}
            </p>
          </CardContent>
        </Card>

        {/* Peak Term */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dominant Term</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold capitalize">
                {peakWord?.text || "-"}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              avg TF-IDF {peakWord?.avgTfidf?.toFixed(1) || 0}
            </p>
          </CardContent>
        </Card>

        {/* Service Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Semantic Engine</CardTitle>
            {data?.serviceStatus === 'connected' ? (
              <div className="h-2 w-2 rounded-full bg-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-500" />
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className={cn(
                "text-lg font-semibold",
                data?.serviceStatus === 'connected' ? "text-green-600" : "text-amber-600"
              )}>
                {data?.serviceStatus === 'connected' ? 'Word2Vec' : 'Fallback'}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {data?.serviceStatus === 'connected' ? 't-SNE positions' : 'hash-based positions'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status indicators */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Sentiment Loading */}
        {sentimentLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing sentiment...
          </div>
        )}

        {/* Fallback Warning */}
        {data?.serviceStatus === 'fallback' && (
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <AlertCircle className="h-4 w-4" />
            Python service unavailable - using fallback positioning
          </div>
        )}
      </div>

      {/* Word Rain Visualization */}
      <Card className="relative overflow-hidden">
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex flex-col items-center gap-4 min-h-[400px] justify-center">
              <Skeleton className="h-[350px] w-full rounded-lg" />
              <p className="text-sm text-muted-foreground">Generating word rain...</p>
            </div>
          ) : error ? (
            <div className="text-destructive text-center min-h-[400px] flex flex-col justify-center">
              <p className="font-medium">Error loading data</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : data?.words && data.words.length > 0 ? (
            <TrueWordRain
              words={data.words}
              years={selectedYear === "all" ? data.years : [parseInt(selectedYear)]}
              panelWidth={panelWidth}
              panelHeight={700}
            />
          ) : (
            <p className="text-muted-foreground text-center min-h-[400px] flex items-center justify-center">
              No data available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Top Terms by Year */}
      {!loading && data?.words && data.words.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top Terms by Semantic Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {data.words.slice(0, 24).map((word) => {
                const sentiment = sentimentData[word.text];
                let sentimentColor = 'bg-slate-50';
                if (sentiment !== undefined) {
                  if (sentiment > 0.3) sentimentColor = 'bg-green-50 border-green-200';
                  else if (sentiment < -0.3) sentimentColor = 'bg-red-50 border-red-200';
                }

                return (
                  <div
                    key={word.text}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-md border hover:bg-muted/50 transition-colors",
                      sentimentColor
                    )}
                  >
                    <span className="font-medium capitalize truncate text-sm">{word.text}</span>
                    <Badge variant="outline" className="ml-1 flex-shrink-0 text-xs">
                      {(word.semanticX * 100).toFixed(0)}%
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
