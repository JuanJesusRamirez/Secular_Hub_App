"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { WordCloud, WordData, SentimentData } from "@/components/charts/word-cloud";
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
import { Button } from "@/components/ui/button";
import { Cloud, FileText, Calendar, TrendingUp, Building2, Loader2, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface WordCloudResponse {
  year: number | 'all';
  wordCount: number;
  totalDocuments: number;
  uniqueInstitutions: number;
  words: WordData[];
  availableYears: number[];
  mode: 'words' | 'phrases';
  scoring: 'frequency' | 'importance';
}

interface SentimentResult {
  label: 'positive' | 'negative' | 'neutral';
  score: number;
  normalizedScore: number;
}

export default function WordCloudPage() {
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [wordLimit, setWordLimit] = useState<string>("100");
  const [mode, setMode] = useState<'words' | 'phrases'>('words');
  const [scoring, setScoring] = useState<'frequency' | 'importance'>('frequency');
  const [data, setData] = useState<WordCloudResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sentimentData, setSentimentData] = useState<SentimentData>({});
  const [sentimentLoading, setSentimentLoading] = useState(false);
  const [sentimentEnabled, setSentimentEnabled] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Fetch word cloud data
  const fetchData = useCallback(async (year: string, limit: string, m: string, s: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (year !== "all") params.set("year", year);
      params.set("limit", limit);
      params.set("mode", m);
      params.set("scoring", s);
      const query = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`/api/stats/wordcloud${query}`);
      if (!res.ok) throw new Error("Failed to fetch word cloud data");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch sentiment data for current words
  const fetchSentiment = useCallback(async (words: WordData[]) => {
    if (words.length === 0) return;

    setSentimentLoading(true);
    try {
      const terms = words.map((w: WordData) => w.text);
      const res = await fetch('/api/stats/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ terms }),
      });

      if (!res.ok) throw new Error("Failed to fetch sentiment");

      const json = await res.json();
      const newSentimentData: SentimentData = {};

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
    fetchData(selectedYear, wordLimit, mode, scoring);
  }, [selectedYear, wordLimit, mode, scoring, fetchData]);

  // Fetch sentiment when words change (only if enabled)
  useEffect(() => {
    if (data?.words && data.words.length > 0 && sentimentEnabled) {
      fetchSentiment(data.words);
    } else if (!sentimentEnabled) {
      setSentimentData({});
    }
  }, [data?.words, fetchSentiment, sentimentEnabled]);

  // Responsive dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(rect.width - 48, 400),
          height: Math.max(Math.min(rect.width * 0.6, 600), 400),
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const handleWordClick = (word: string) => {
    console.log("Clicked word:", word);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500" ref={containerRef}>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Cloud className="h-6 w-6 text-primary" />
            Word Cloud Analysis
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualize the most frequent terms in Wall Street&apos;s consensus narratives.
            <span className="hidden sm:inline"> Word size indicates {scoring === 'frequency' ? 'frequency' : 'importance'}.</span>
          </p>
        </div>

        {/* Year Selector */}
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[150px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {data?.availableYears?.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Unique Words - con selector */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {mode === 'words' ? 'Unique Words' : 'Unique Phrases'}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{data?.wordCount || 0}</div>
              )}
              <Select value={wordLimit} onValueChange={setWordLimit}>
                <SelectTrigger className="w-[100px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50 {mode}</SelectItem>
                  <SelectItem value="100">100 {mode}</SelectItem>
                  <SelectItem value="150">150 {mode}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground mt-1">distinct terms analyzed</p>
          </CardContent>
        </Card>

        {/* Outlooks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outlooks</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{data?.uniqueInstitutions || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {data?.totalDocuments || 0} views processed
            </p>
          </CardContent>
        </Card>

        {/* Top Term */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Top {mode === 'words' ? 'Term' : 'Phrase'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold capitalize">
                {data?.words?.[0]?.text || "-"}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {data?.words?.[0]?.value || 0} {scoring === 'frequency' ? 'mentions' : 'score'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mode Toggles */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Words vs Phrases Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Mode:</span>
          <div className="flex rounded-lg border p-1">
            <Button
              variant={mode === 'words' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setMode('words')}
            >
              Words
            </Button>
            <Button
              variant={mode === 'phrases' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setMode('phrases')}
            >
              Phrases
            </Button>
          </div>
        </div>

        {/* Frequency vs Importance Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Scoring:</span>
          <div className="flex rounded-lg border p-1">
            <Button
              variant={scoring === 'frequency' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setScoring('frequency')}
            >
              Frequency
            </Button>
            <Button
              variant={scoring === 'importance' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setScoring('importance')}
            >
              TF-IDF
            </Button>
          </div>
        </div>

        {/* Sentiment Toggle with FinBERT info */}
        <div className="flex items-center gap-3 ml-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <Switch
                    id="sentiment-toggle"
                    checked={sentimentEnabled}
                    onCheckedChange={setSentimentEnabled}
                  />
                  <label
                    htmlFor="sentiment-toggle"
                    className="text-sm font-medium cursor-pointer flex items-center gap-1"
                  >
                    Sentiment Colors
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </label>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="font-medium mb-1">FinBERT Sentiment Analysis</p>
                <p className="text-xs text-muted-foreground">
                  Colors are powered by <span className="font-semibold">FinBERT</span>, a BERT model
                  fine-tuned on financial text. It classifies terms as bullish (green),
                  bearish (red), or neutral (gray) based on their financial sentiment.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Sentiment Loading Indicator */}
          {sentimentLoading && sentimentEnabled && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Analyzing...</span>
            </div>
          )}

          {/* Sentiment Legend - only show when enabled */}
          {sentimentEnabled && (
            <div className="flex items-center gap-3 border-l pl-3">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">Bullish</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-slate-400" />
                <span className="text-xs text-muted-foreground">Neutral</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-xs text-muted-foreground">Bearish</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Word Cloud */}
      <Card className="relative">
        <CardContent className="flex justify-center items-center min-h-[500px] pt-6">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-[400px] w-full max-w-[700px] rounded-lg" />
              <p className="text-sm text-muted-foreground">Generating word cloud...</p>
            </div>
          ) : error ? (
            <div className="text-destructive text-center">
              <p className="font-medium">Error loading data</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : data?.words && data.words.length > 0 ? (
            <WordCloud
              words={data.words}
              width={dimensions.width}
              height={dimensions.height}
              onWordClick={handleWordClick}
              sentimentData={sentimentData}
              showSentiment={sentimentEnabled && Object.keys(sentimentData).length > 0}
            />
          ) : (
            <p className="text-muted-foreground">No data available for this year</p>
          )}
        </CardContent>
      </Card>

      {/* Top Words Table */}
      {!loading && data?.words && data.words.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Top 20 {mode === 'words' ? 'Terms' : 'Phrases'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {data.words.slice(0, 20).map((word) => {
                const sentiment = sentimentData[word.text];
                let sentimentColor = 'bg-slate-100';
                if (sentimentEnabled && sentiment !== undefined) {
                  if (sentiment > 0.3) sentimentColor = 'bg-green-50 border-green-200';
                  else if (sentiment < -0.3) sentimentColor = 'bg-red-50 border-red-200';
                }

                return (
                  <div
                    key={word.text}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-md border hover:bg-muted/50 transition-colors cursor-pointer",
                      sentimentColor
                    )}
                    onClick={() => handleWordClick(word.text)}
                  >
                    <span className="font-medium capitalize truncate">{word.text}</span>
                    <Badge variant="outline" className="ml-2 flex-shrink-0">
                      {typeof word.value === 'number' && word.value % 1 !== 0
                        ? word.value.toFixed(1)
                        : word.value}
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
