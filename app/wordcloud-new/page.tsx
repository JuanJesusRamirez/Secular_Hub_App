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
import { Cloud, FileText, Calendar, TrendingUp, Building2, Loader2, Info, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrueWordRain } from "@/components/charts/word-rain-true";
import { CloudRain } from "lucide-react";

interface WordCloudResponse {
    year: number | 'all';
    wordCount: number;
    totalDocuments: number;
    uniqueInstitutions: number;
    words: WordData[];
    wordRainWords: any[];
    availableYears: number[];
    mode: 'words' | 'phrases';
    scoring: 'frequency' | 'importance';
}

interface SentimentResult {
    label: 'positive' | 'negative' | 'neutral';
    score: number;
    normalizedScore: number;
}

export default function WordCloudNewPage() {
    const [selectedYear, setSelectedYear] = useState<string>("2022");
    const [wordLimit, setWordLimit] = useState<string>("100");
    const [mode, setMode] = useState<'words' | 'phrases'>('words');
    const [scoring, setScoring] = useState<'frequency' | 'importance'>('importance');
    const [data, setData] = useState<WordCloudResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sentimentData, setSentimentData] = useState<SentimentData>({});
    const [sentimentLoading, setSentimentLoading] = useState(false);
    const [sentimentEnabled, setSentimentEnabled] = useState(true);
    const [view, setView] = useState<'cloud' | 'rain'>('cloud');
    const [layout, setLayout] = useState<'free' | 'lanes'>('free');
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

    // Fetch word cloud data from CSV
    const fetchData = useCallback(async (limit: string, s: string) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.set("limit", limit);
            params.set("scoring", s);
            const query = params.toString() ? `?${params.toString()}` : "";

            // For this demo, we use the specific CSV endpoint
            const res = await fetch(`/api/stats/wordcloud-csv${query}`);
            if (!res.ok) throw new Error("Failed to fetch word cloud data from CSV");
            const json = await res.json();
            setData(json);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch sentiment data from CSV
    const fetchSentiment = useCallback(async (words: WordData[]) => {
        if (words.length === 0) return;

        setSentimentLoading(true);
        try {
            const terms = words.map((w: WordData) => w.text);
            const res = await fetch('/api/stats/sentiment-csv', {
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
        fetchData(wordLimit, scoring);
    }, [wordLimit, scoring, fetchData]);

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
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Cloud className="h-6 w-6 text-primary" />
                            Word Cloud Analysis
                        </h1>
                        <Badge variant="secondary" className="bg-blue-500 text-white hover:bg-blue-600 animate-pulse">
                            <Sparkles className="h-3 w-3 mr-1" />
                            NEW: From CSV
                        </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1">
                        Visualizing pre-calculated data from <code className="bg-muted px-1 rounded">word_rain_data_2022.csv</code>.
                        <span className="hidden sm:inline"> Word size indicates importance (TF-IDF).</span>
                    </p>
                </div>

                {/* Year Selector (Locked for demo) */}
                <Select value={selectedYear} disabled>
                    <SelectTrigger className="w-[150px]">
                        <Calendar className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="2022" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="2022">2022 (Static)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Stats Row */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unique Words</CardTitle>
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
                                    <SelectItem value="50">50 words</SelectItem>
                                    <SelectItem value="100">100 words</SelectItem>
                                    <SelectItem value="200">200 words</SelectItem>
                                    <SelectItem value="300">300 words</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">distinct terms analyzed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Source</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">CSV File</div>
                        <p className="text-xs text-muted-foreground">
                            word_rain_data_2022.csv
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Term</CardTitle>
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
                            {data?.words?.[0]?.value ? data.words[0].value.toFixed(4) : 0} TF-IDF score
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Mode Toggles (Indicators only for demo) */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Mode:</span>
                    <Badge variant="outline">Words Only</Badge>
                </div>

                {view === 'cloud' && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Scoring:</span>
                        <div className="flex rounded-lg border p-1 bg-background">
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
                )}

                {/* Sentiment & Layout Toggles */}
                <div className="flex items-center gap-3 ml-auto">
                    {view === 'rain' && (
                        <div className="flex items-center gap-2 mr-4 border-r pr-4">
                            <span className="text-sm text-muted-foreground">Layout:</span>
                            <div className="flex rounded-lg border p-1 bg-background">
                                <Button
                                    variant={layout === 'free' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="h-7 px-3 text-xs"
                                    onClick={() => setLayout('free')}
                                >
                                    Drop
                                </Button>
                                <Button
                                    variant={layout === 'lanes' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="h-7 px-3 text-xs"
                                    onClick={() => setLayout('lanes')}
                                >
                                    Lanes
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Sentiment Toggle - Only for Cloud View */}
                    {view === 'cloud' && (
                        <div className="flex items-center gap-3">
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
                                        <p className="font-medium mb-1">Pre-calculated Sentiment</p>
                                        <p className="text-xs text-muted-foreground">
                                            Colors are based on the <code className="bg-muted px-0.5">sentiment_label</code> field in the CSV.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            {sentimentLoading && sentimentEnabled && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="hidden sm:inline">Loading Colors...</span>
                                </div>
                            )}

                            {sentimentEnabled && (
                                <div className="flex items-center gap-3 border-l pl-3">
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-3 w-3 rounded-full bg-green-500" />
                                        <span className="text-xs text-muted-foreground">Positive</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-3 w-3 rounded-full bg-slate-400" />
                                        <span className="text-xs text-muted-foreground">Neutral</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-3 w-3 rounded-full bg-red-500" />
                                        <span className="text-xs text-muted-foreground">Negative</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Visualizations */}
            <Tabs value={view} onValueChange={(v) => setView(v as 'cloud' | 'rain')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="cloud" className="flex items-center gap-2">
                        <Cloud className="h-4 w-4" />
                        Word Cloud
                    </TabsTrigger>
                    <TabsTrigger value="rain" className="flex items-center gap-2">
                        <CloudRain className="h-4 w-4" />
                        Word Rain
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="cloud" className="mt-6">
                    <Card className="relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                        <CardContent className="flex justify-center items-center min-h-[500px] pt-6">
                            {loading ? (
                                <div className="flex flex-col items-center gap-4">
                                    <Skeleton className="h-[400px] w-full max-w-[700px] rounded-lg" />
                                    <p className="text-sm text-muted-foreground">Rendering from CSV...</p>
                                </div>
                            ) : error ? (
                                <div className="text-destructive text-center">
                                    <p className="font-medium">Error loading CSV data</p>
                                    <p className="text-sm">{error}</p>
                                </div>
                            ) : data?.words && data.words.length > 0 ? (
                                <WordCloud
                                    words={data.words}
                                    width={dimensions.width}
                                    height={dimensions.height}
                                    title="Word Rain - WordCloud"
                                    onWordClick={handleWordClick}
                                    sentimentData={sentimentData}
                                    showSentiment={sentimentEnabled && Object.keys(sentimentData).length > 0}
                                />
                            ) : (
                                <p className="text-muted-foreground">No data found in CSV</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="rain" className="mt-6">
                    <Card className="relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500" />
                        <CardContent className="pt-6">
                            {loading ? (
                                <div className="flex flex-col items-center gap-4 min-h-[500px] justify-center">
                                    <Skeleton className="h-[450px] w-full rounded-lg" />
                                    <p className="text-sm text-muted-foreground">Mapping semantic positions...</p>
                                </div>
                            ) : error ? (
                                <div className="text-destructive text-center min-h-[500px] flex flex-col justify-center">
                                    <p className="font-medium">Error loading data</p>
                                    <p className="text-sm">{error}</p>
                                </div>
                            ) : data?.wordRainWords && data.wordRainWords.length > 0 ? (
                                <TrueWordRain
                                    words={data.wordRainWords}
                                    years={[2022]}
                                    panelWidth={dimensions.width}
                                    panelHeight={600}
                                    layout={layout}
                                />
                            ) : (
                                <p className="text-muted-foreground text-center min-h-[500px] flex items-center justify-center">
                                    No semantic data found in CSV
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Top Words Table */}
            {!loading && data?.words && data.words.length > 0 && (
                <Card>
                    <CardHeader className="pb-3 border-b mb-4">
                        <CardTitle className="text-base flex items-center justify-between">
                            Detailed Breakdown (CSV)
                            <Badge variant="outline">{data.words.length} terms</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                            {data.words.map((word) => {
                                const sentiment = sentimentData[word.text];
                                let sentimentColor = 'bg-slate-50';
                                if (sentimentEnabled && sentiment !== undefined) {
                                    if (sentiment > 0.1) sentimentColor = 'bg-green-50 border-green-200';
                                    else if (sentiment < -0.1) sentimentColor = 'bg-red-50 border-red-200';
                                }

                                return (
                                    <div
                                        key={word.text}
                                        className={cn(
                                            "flex items-center justify-between p-2 rounded-md border hover:bg-muted/50 transition-all cursor-pointer group",
                                            sentimentColor
                                        )}
                                        onClick={() => handleWordClick(word.text)}
                                    >
                                        <span className="font-medium capitalize truncate group-hover:text-primary">{word.text}</span>
                                        <Badge variant="outline" className="ml-2 flex-shrink-0 text-[10px] px-1 h-5">
                                            {word.value.toFixed(3)}
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
