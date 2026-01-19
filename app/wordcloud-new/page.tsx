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
    analysisData?: any[];
}

interface SentimentResult {
    label: 'positive' | 'negative' | 'neutral';
    score: number;
    normalizedScore: number;
}

export default function WordCloudNewPage() {
    const [selectedYear, setSelectedYear] = useState<string>("2026");
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

    // Fetch word analysis data from Database
    const fetchData = useCallback(async (limit: string, s: string, m: 'words' | 'phrases', y: string) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.set("limit", limit);
            params.set("scoring", s);
            params.set("mode", m);
            params.set("year", y);
            const query = params.toString() ? `?${params.toString()}` : "";

            const res = await fetch(`/api/stats/analysis${query}`);
            if (!res.ok) throw new Error("Failed to fetch word cloud data");
            const json = await res.json();

            if (json.error) throw new Error(json.error);

            setData(json);

            // Extract sentiment data directly from the response
            if (json.analysisData) {
                const newSentimentData: SentimentData = {};
                json.analysisData.forEach((row: any) => {
                    if (row.text) {
                        newSentimentData[row.text.toLowerCase()] = row.adjustedSentiment;
                    }
                });
                setSentimentData(newSentimentData);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        fetchData(wordLimit, scoring, mode, selectedYear);
    }, [wordLimit, scoring, mode, selectedYear, fetchData]);



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
        <div className="space-y-4 animate-in fade-in duration-500" ref={containerRef}>
            {/* Header */}
            <div className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-primary/10 via-background to-background p-6 md:p-8 shadow-sm mb-6">
                <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/20 p-2.5 rounded-lg text-primary">
                                <Cloud className="w-6 h-6" />
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl text-foreground">
                                Word Analysis
                            </h1>
                        </div>
                        <p className="text-lg text-muted-foreground ml-[3.25rem] max-w-2xl">
                            Which narratives and semantic signals dominate institutional outlooks over time?
                        </p>
                    </div>

                    <div className="flex items-center gap-4 ml-[3.25rem] md:ml-0">
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-[180px] bg-background/50 border-primary/20 backdrop-blur-sm">
                                <Calendar className="mr-2 h-4 w-4 opacity-50" />
                                <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {(data?.availableYears || [0, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]).map(year => (
                                    <SelectItem key={year} value={year === 0 ? "all" : year.toString()}>
                                        {year === 0 ? "All Years (2019-2026)" : year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-primary/5 blur-3xl"></div>
            </div>

            {/* Stats Row */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{mode === 'phrases' ? 'Unique Phrases' : 'Unique Terms'}</CardTitle>
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
                                    <SelectItem value="50">50 {mode === 'phrases' ? 'phrases' : 'terms'}</SelectItem>
                                    <SelectItem value="100">100 {mode === 'phrases' ? 'phrases' : 'terms'}</SelectItem>
                                    <SelectItem value="200">200 {mode === 'phrases' ? 'phrases' : 'terms'}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">distinct {mode === 'phrases' ? 'phrases' : 'terms'} analyzed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top {mode === 'phrases' ? 'Phrase' : 'Term'}</CardTitle>
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
                            {data?.words?.[0]?.value
                                ? (scoring === 'frequency'
                                    ? `${Math.round(data.words[0].value)} Mentions`
                                    : `${(data.words[0].value * 1000).toFixed(1)} TF-IDF Score`)
                                : "0 score"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Mode Toggles (Indicators only for demo) */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Mode:</span>
                    <div className="flex rounded-lg border p-1 bg-background">
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
                                            Colors are based on the <code className="bg-muted px-0.5">sentiment_label</code> field in the database.
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
                                    <p className="text-sm text-muted-foreground">Rendering from Database...</p>
                                </div>
                            ) : error ? (
                                <div className="min-h-[500px] flex flex-col items-center justify-center gap-2 text-destructive">
                                    <Info className="h-10 w-10" />
                                    <p className="font-medium">Error loading analysis data</p>
                                    <p className="text-sm opacity-80">{error}</p>
                                </div>
                            ) : data?.words && data.words.length > 0 ? (
                                <WordCloud
                                    words={data.words}
                                    width={dimensions.width}
                                    height={dimensions.height}
                                    title=""
                                    downloadFileName={`Word Cloud - ${selectedYear} - ${mode.charAt(0).toUpperCase() + mode.slice(1)}${sentimentEnabled ? ' - Sentiment' : ''}`}
                                    onWordClick={handleWordClick}
                                    sentimentData={sentimentData}
                                    showSentiment={sentimentEnabled && Object.keys(sentimentData).length > 0}
                                />
                            ) : (
                                <p className="text-muted-foreground">No analysis found</p>
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
                                    years={data.availableYears}
                                    panelWidth={dimensions.width}
                                    panelHeight={600}
                                    layout={layout}
                                    title=""
                                    downloadFileName={`Word Rain - ${selectedYear} - ${mode.charAt(0).toUpperCase() + mode.slice(1)} - Drop`}
                                    scoring={scoring}
                                />
                            ) : (
                                <p className="text-muted-foreground text-center min-h-[500px] flex items-center justify-center">
                                    No semantic data found in database
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
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base">Top {wordLimit} {mode === 'phrases' ? 'Phrases' : 'Terms'}</CardTitle>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {scoring === 'frequency'
                                        ? 'Scale: Mentions (counts)'
                                        : 'Scale: Importance (TF-IDF Score x 1000)'}
                                </p>
                            </div>
                            <Badge variant="outline">{data.words.length} {mode === 'phrases' ? 'phrases' : 'terms'}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                            {data.words.map((word) => {
                                const sentiment = sentimentData[word.text.toLowerCase()];
                                let sentimentColor = 'bg-slate-50';
                                if (sentimentEnabled && sentiment !== undefined) {
                                    if (sentiment > 0.1) sentimentColor = 'bg-green-50 border-green-200';
                                    else if (sentiment < -0.1) sentimentColor = 'bg-red-50 border-red-200';
                                }

                                const displayValue = scoring === 'frequency'
                                    ? Math.round(word.value).toString()
                                    : (word.value * 1000).toFixed(1);

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
                                            {displayValue}
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
