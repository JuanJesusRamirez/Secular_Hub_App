"use client";

import { useState, useMemo, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    TrendingUp,
    AlertTriangle,
    Zap,
    Search,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
    CheckCircle2,
    XCircle,
    BarChart3,
    Quote,
    Target,
    Trophy,
    History,
    FileText,
    ExternalLink,
    Link as LinkIcon,
    Coins,
    Package,
    Wallet,
    Layers,
    PieChart,
    Landmark,
    LayoutGrid,
    ArrowRight,
    ChevronDown,
    BookOpen,
    Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ALL_THEMES_WITH_GLOBAL,
    getClassificationColor,
    getClassificationBg,
    getMaterializedIcon,
    getMaterializedColor,
    getThemeRanking,
    getThemeRankingByConviction,
    ALL_THEMES
} from "@/lib/data/expost-2025";
import { ExPostItem, ThemeData } from "@/types/expost";

const ReasoningRenderer = ({ text }: { text: string }) => {
    // More robust regex: finds anything in parentheses that contains http
    // Also captures optional "Source X" prefix
    const combinedSourceRegex = /(Source\s+(\d+)\s*)?\((?:SOURCE:\s*)?([^)]*?https?:\/\/[^\s)]+)\)/gi;

    // Regex for quoted text: '...' 
    const quoteRegex = /(^|[\s(])'([^']+)'(?=[\s.,)]|$)/g;

    // Extract all matches (sources and quotes) with their positions
    interface Token {
        index: number;
        length: number;
        type: 'source' | 'quote';
        content: any;
    }
    const tokens: Token[] = [];

    // Collect sources
    let sMatch;
    const sourcesMap: Record<string, { id?: string, pub: string, date?: string, url: string }> = {};
    const sRegex = new RegExp(combinedSourceRegex);
    while ((sMatch = sRegex.exec(text)) !== null) {
        const fullMatch = sMatch[0];
        const sourceId = sMatch[2]; // Captured from "Source (\d+)"
        const innerContent = sMatch[3]; // Everything inside ( ... )

        // Split inner content by commas to find parts
        const parts = innerContent.split(',').map(p => p.trim());
        const url = parts.find(p => p.startsWith('http')) || '';

        // Try to find a good publication label
        // Strategy: If Source ID exists, use it. Label is usually the first part of the citation.
        let pubLabel = "";

        if (parts.length > 1) {
            // Usually [Pub, Date, URL] or [Title, Pub, Date, URL]
            const nonUrlParts = parts.filter(p => !p.startsWith('http'));

            // Heuristic to avoid picking dates or long titles as the main label
            // We want the most "Firm-looking" name.
            const isDate = (s: string) => /^\d{4}$|January|February|March|April|May|June|July|August|September|October|November|December/i.test(s);

            // Try to find the first short non-date part
            const bestPart = nonUrlParts.find(p => p.length < 30 && !isDate(p)) || nonUrlParts[0];
            pubLabel = bestPart;
        } else {
            // Just (URL) or something weird
            try {
                pubLabel = new URL(url).hostname.replace('www.', '').split('.')[0];
            } catch {
                pubLabel = "Source";
            }
        }

        tokens.push({
            index: sMatch.index,
            length: fullMatch.length,
            type: 'source',
            content: { id: sourceId, pub: pubLabel, url }
        });
    }

    // Collect quotes
    let qMatch;
    const qRegex = new RegExp(quoteRegex);
    while ((qMatch = qRegex.exec(text)) !== null) {
        tokens.push({
            index: qMatch.index + qMatch[1].length,
            length: qMatch[2].length + 2, // +2 for the single quotes
            type: 'quote',
            content: qMatch[2]
        });
    }

    // Sort tokens by appearance
    tokens.sort((a, b) => a.index - b.index);

    // Build the rendered elements
    const renderedElements: (string | JSX.Element)[] = [];
    let lastIndex = 0;

    for (const token of tokens) {
        // Skip if this token overlaps with a previous one
        if (token.index < lastIndex) continue;

        // Add text before token
        if (token.index > lastIndex) {
            renderedElements.push(text.substring(lastIndex, token.index));
        }

        if (token.type === 'source') {
            renderedElements.push(
                <a
                    key={`src-${token.index}`}
                    href={token.content.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary hover:bg-primary/20 transition-all mx-0.5 shadow-sm active:scale-95"
                    title={token.content.pub}
                >
                    {token.content.id && <span className="opacity-60 font-mono">[{token.content.id}]</span>}
                    <span className="truncate max-w-[120px]">{token.content.pub}</span>
                    <ExternalLink className="h-2.5 w-2.5 opacity-50 flex-shrink-0" />
                </a>
            );
        } else {
            renderedElements.push(
                <em key={`quote-${token.index}`} className="text-foreground font-semibold bg-primary/5 px-1 rounded border-b border-primary/20 not-italic">
                    "{token.content}"
                </em>
            );
        }
        lastIndex = token.index + token.length;
    }
    // Add remaining text
    if (lastIndex < text.length) {
        renderedElements.push(text.substring(lastIndex));
    }
    return (
        <div className="space-y-4">
            <div className="text-sm leading-relaxed text-muted-foreground font-medium">
                {renderedElements}
            </div>
        </div>
    );
};

const getGlobalScoreColor = (score: number) => {
    if (score >= 810) return "text-green-600"; // Excellent (90% of 900)
    if (score >= 675) return "text-slate-950"; // Good (75% of 900)
    if (score >= 540) return "text-yellow-600"; // Partial (60% of 900)
    if (score >= 360) return "text-orange-500"; // Weak (40% of 900)
    return "text-red-500"; // Failed
};

const getThemeScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-slate-950"; // Black (Good)
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
};

export default function ExPost2025Page() {
    const THEME_RANKING_LABEL = "THEME RANKING";
    const METHODOLOGY_LABEL = "METHODOLOGY";
    // Initialize with BASE CASE (usually the second item in ALL_THEMES_WITH_GLOBAL, as first is GLOBAL)
    // We look for it explicitly to be safe
    const defaultTheme = useMemo(() =>
        ALL_THEMES_WITH_GLOBAL.find(t => t.theme === "BASE CASE") || ALL_THEMES_WITH_GLOBAL[1] || ALL_THEMES_WITH_GLOBAL[0]
        , []);

    const [activeThemeName, setActiveThemeName] = useState<string>(defaultTheme.theme);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedExPostItem, setSelectedExPostItem] = useState<ExPostItem | null>(defaultTheme.items[0] || null);

    const currentThemeData = useMemo(() =>
        ALL_THEMES_WITH_GLOBAL.find(t => t.theme === activeThemeName) || ALL_THEMES_WITH_GLOBAL[0]
        , [activeThemeName]);

    const filteredItems = useMemo(() => {
        return currentThemeData.items.filter(item =>
            item.Institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.statements.some(s => s.statement.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [currentThemeData, searchQuery]);

    // We removed the automatic selection reset to allow for firm preservation during navigation
    // Individual theme buttons and onNavigate will handle selection manually

    const stats = currentThemeData.themeStats;

    return (
        <div className="container mx-auto py-8 space-y-8 max-w-[1600px]">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b pb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <History className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight">2025 Ex-Post Analysis</h1>
                        <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0">ACCURACY AUDIT</Badge>
                    </div>
                    <p className="text-lg text-muted-foreground">
                        Verifying institutional predictions against real-world 2025 outcomes.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 max-w-4xl justify-end">
                    {/* Theme selection buttons moved to sidebar */}
                </div>
            </div>


            {/* Stats Summary Area */}
            {activeThemeName !== THEME_RANKING_LABEL && activeThemeName !== METHODOLOGY_LABEL && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 xl:grid-cols-8 gap-4">
                    <StatCard
                        title="Firms"
                        value={stats.totalFirms}
                        icon={Target}
                        color={activeThemeName === "GLOBAL RANKING" ? "text-indigo-600" : "text-blue-500"}
                    />
                    <StatCard
                        title="Call Texts"
                        value={stats.totalCallTexts}
                        icon={Hash}
                        color="text-slate-500"
                    />
                    <StatCard
                        title={activeThemeName === "GLOBAL RANKING" ? "Global Score" : "Avg Score"}
                        value={`${stats.avgScore} pts`}
                        icon={TrendingUp}
                        color={activeThemeName === "GLOBAL RANKING" ? getGlobalScoreColor(stats.avgScore) : getThemeScoreColor(stats.avgScore)}
                    />

                    {activeThemeName === "GLOBAL RANKING" ? (
                        <>
                            <StatCard
                                title="Excellent"
                                value={stats.excellentCount}
                                icon={Zap}
                                color="text-green-600"
                            />
                            <StatCard
                                title="Good"
                                value={stats.goodCount}
                                icon={Trophy}
                                color="text-slate-950"
                            />
                            <StatCard
                                title="Partial"
                                value={stats.partialCount}
                                icon={CheckCircle2}
                                color="text-yellow-600"
                            />
                            <StatCard
                                title="Weak"
                                value={stats.weakCount}
                                icon={AlertTriangle}
                                color="text-orange-500"
                            />
                            <StatCard
                                title="Failed"
                                value={stats.failedCount}
                                icon={XCircle}
                                color="text-red-500"
                            />
                        </>
                    ) : (
                        <>
                            <StatCard
                                title="Excellent"
                                value={stats.excellentCount}
                                icon={Trophy}
                                color="text-green-500"
                            />
                            <StatCard
                                title="Good"
                                value={stats.goodCount}
                                icon={CheckCircle2}
                                color="text-slate-950"
                            />
                            <StatCard
                                title="Partial"
                                value={stats.partialCount}
                                icon={Minus}
                                color="text-yellow-500"
                            />
                            <StatCard
                                title="Weak"
                                value={stats.weakCount}
                                icon={AlertTriangle}
                                color="text-orange-500"
                            />
                            <StatCard
                                title="Failed"
                                value={stats.failedCount}
                                icon={XCircle}
                                color="text-red-500"
                            />
                        </>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar: Navigation & Ranking */}
                <div className="lg:col-span-4 xl:col-span-3 space-y-6">
                    <div className="sticky top-8 space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Main Views</h3>
                            <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    {/* Global Ranking Button */}
                                    {ALL_THEMES_WITH_GLOBAL[0] && (
                                        <Button
                                            key={ALL_THEMES_WITH_GLOBAL[0].theme}
                                            variant={activeThemeName === ALL_THEMES_WITH_GLOBAL[0].theme ? "default" : "outline"}
                                            onClick={() => {
                                                setActiveThemeName(ALL_THEMES_WITH_GLOBAL[0].theme);
                                                setSelectedExPostItem(ALL_THEMES_WITH_GLOBAL[0].items[0] || null);
                                            }}
                                            className={cn(
                                                "justify-center h-11 text-xs font-bold uppercase tracking-wider transition-all",
                                                activeThemeName === ALL_THEMES_WITH_GLOBAL[0].theme ? "shadow-md" : "hover:bg-muted"
                                            )}
                                        >
                                            <Trophy className="mr-2 h-4 w-4 shrink-0" />
                                            <span className="truncate">Global</span>
                                        </Button>
                                    )}

                                    {/* Theme Ranking Button */}
                                    <Button
                                        variant={activeThemeName === THEME_RANKING_LABEL ? "default" : "outline"}
                                        onClick={() => {
                                            setActiveThemeName(THEME_RANKING_LABEL);
                                            setSelectedExPostItem(null);
                                        }}
                                        className={cn(
                                            "justify-center h-11 text-xs font-bold uppercase tracking-wider transition-all px-2",
                                            activeThemeName === THEME_RANKING_LABEL
                                                ? "shadow-md"
                                                : "bg-primary/5 hover:bg-primary/10 border-primary/20"
                                        )}
                                    >
                                        <BarChart3 className="mr-2 h-4 w-4 shrink-0" />
                                        <span className="truncate">Themes</span>
                                    </Button>
                                </div>

                                <div className="h-[1px] bg-border my-2" />

                                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Market Exploration</h3>
                                <div className="flex gap-2">
                                    <Button
                                        variant={activeThemeName === METHODOLOGY_LABEL ? "default" : "outline"}
                                        size="icon"
                                        onClick={() => {
                                            setActiveThemeName(METHODOLOGY_LABEL);
                                            setSelectedExPostItem(null);
                                        }}
                                        className={cn(
                                            "h-11 w-11 shrink-0 transition-all",
                                            activeThemeName === METHODOLOGY_LABEL
                                                ? "shadow-md bg-indigo-600 hover:bg-indigo-700"
                                                : "bg-muted/50 hover:bg-muted"
                                        )}
                                        title="Audit Methodology"
                                    >
                                        <BookOpen className="h-4 w-4" />
                                    </Button>

                                    <Select
                                        value={ALL_THEMES_WITH_GLOBAL.slice(1).some(t => t.theme === activeThemeName) ? activeThemeName : ""}
                                        onValueChange={(value) => {
                                            const themeData = ALL_THEMES_WITH_GLOBAL.find(t => t.theme === value);
                                            if (themeData) {
                                                setActiveThemeName(themeData.theme);
                                                setSelectedExPostItem(themeData.items[0] || null);
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="flex-1 h-11 text-xs font-bold uppercase tracking-wider bg-primary/5 border-primary/20 focus:ring-1">
                                            <SelectValue placeholder="SELECT THEME" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ALL_THEMES_WITH_GLOBAL.slice(1).map((themeData) => (
                                                <SelectItem
                                                    key={themeData.theme}
                                                    value={themeData.theme}
                                                    className="text-xs font-bold uppercase tracking-wider"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <ThemeIcon theme={themeData.theme} className="h-3 w-3" />
                                                        {themeData.theme}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {activeThemeName !== THEME_RANKING_LABEL && activeThemeName !== METHODOLOGY_LABEL && (
                            <div className="space-y-4 pt-4 border-t">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Firm Ranking</h3>
                                    <Badge variant="outline" className="text-[9px] font-bold py-0">{filteredItems.length}</Badge>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        placeholder="Search firm..."
                                        className="pl-9 h-10 text-xs font-bold"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Card className="max-h-[500px] overflow-auto custom-scrollbar border-2">
                                    <CardContent className="p-0 divide-y">
                                        {filteredItems.map((item, index) => (
                                            <button
                                                key={item.id}
                                                onClick={() => setSelectedExPostItem(item)}
                                                className={cn(
                                                    "w-full text-left p-4 hover:bg-muted/50 transition-all flex items-center justify-between gap-4 border-l-4",
                                                    selectedExPostItem?.id === item.id
                                                        ? "bg-primary/5 border-l-primary"
                                                        : "border-l-transparent"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col items-center min-w-[20px]">
                                                        <span className="text-[10px] font-black text-muted-foreground">
                                                            {activeThemeName === "GLOBAL RANKING" ? (
                                                                index === 0 ? <span className="text-lg">🥇</span> :
                                                                    index === 1 ? <span className="text-lg">🥈</span> :
                                                                        index === 2 ? <span className="text-lg">🥉</span> :
                                                                            `#${index + 1}`
                                                            ) : `#${index + 1}`}
                                                        </span>
                                                        {activeThemeName !== "GLOBAL RANKING" && (
                                                            item.Rank < item.Original_Rank ? (
                                                                <ArrowUpRight className="h-2.5 w-2.5 text-green-500" />
                                                            ) : item.Rank > item.Original_Rank ? (
                                                                <ArrowDownRight className="h-2.5 w-2.5 text-red-500" />
                                                            ) : (
                                                                <Minus className="h-2.5 w-2.5 text-gray-400 opacity-40" />
                                                            )
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className={cn(
                                                            "font-bold text-xs uppercase tracking-tight line-clamp-1",
                                                            selectedExPostItem?.id === item.id && "text-primary"
                                                        )}>{item.Institution}</p>
                                                        {activeThemeName !== "GLOBAL RANKING" && (
                                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Ex-Ante: #{item.Original_Rank}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={cn(
                                                    "text-xs font-black",
                                                    activeThemeName === "GLOBAL RANKING" ? getGlobalScoreColor(item.score) : getClassificationColor(item.classification)
                                                )}>
                                                    {item.score} <span className="opacity-60 text-[8px]">PTS</span>
                                                </div>
                                            </button>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-8 xl:col-span-9">
                    {activeThemeName === THEME_RANKING_LABEL ? (
                        <ThemePerformanceRanking
                            onNavigate={(theme, instName) => {
                                const targetTheme = ALL_THEMES_WITH_GLOBAL.find(t => t.theme === theme);
                                if (targetTheme) {
                                    setActiveThemeName(theme);
                                    const targetItem = targetTheme.items.find(i => i.Institution === instName);
                                    setSelectedExPostItem(targetItem || targetTheme.items[0] || null);
                                }
                            }}
                        />
                    ) : activeThemeName === METHODOLOGY_LABEL ? (
                        <MethodologyDetailPage />
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-700">
                            {!selectedExPostItem ? (
                                <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-3xl bg-muted/5">
                                    <div className="p-6 rounded-full bg-muted/20 mb-6">
                                        <FileText className="h-12 w-12 text-muted-foreground/30" />
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-[0.2em] mb-4">Select an Institution</h3>
                                    <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8">Click on a firm from the ranking list to see their detailed performance evidence and ex-post analysis.</p>
                                </div>
                            ) : (
                                <AnalysisDetail
                                    item={selectedExPostItem}
                                    onNavigate={(theme, instName) => {
                                        const targetTheme = ALL_THEMES_WITH_GLOBAL.find(t => t.theme === theme);
                                        if (targetTheme) {
                                            setActiveThemeName(theme);
                                            const targetItem = targetTheme.items.find(i => i.Institution === instName);
                                            setSelectedExPostItem(targetItem || targetTheme.items[0] || null);
                                        }
                                    }}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MethodologyDetailPage() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg">
                        <BookOpen className="h-6 w-6" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight uppercase">Audit Methodology</h2>
                </div>
                <p className="text-muted-foreground font-medium max-w-2xl">
                    A transparent, defensible system for evaluating institutional accuracy across 2025's most critical market predictions.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 1. Scoring System */}
                <Card className="border-l-4 border-l-indigo-500">
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <Target className="h-4 w-4 text-indigo-500" />
                            The 1.0 Point System
                        </CardTitle>
                        <CardDescription className="text-xs font-bold uppercase tracking-tight">How individual claims are scored</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/10 text-center">
                                <span className="text-2xl mb-1 block">✅</span>
                                <p className="text-xs font-black text-green-600">HIT</p>
                                <p className="text-lg font-black">1.0 <span className="text-[10px] opacity-60">PTS</span></p>
                            </div>
                            <div className="p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/10 text-center">
                                <span className="text-2xl mb-1 block">🔶</span>
                                <p className="text-xs font-black text-yellow-600">PARTIAL</p>
                                <p className="text-lg font-black">0.5 <span className="text-[10px] opacity-60">PTS</span></p>
                            </div>
                            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-center">
                                <span className="text-2xl mb-1 block">❌</span>
                                <p className="text-xs font-black text-red-600">MISS</p>
                                <p className="text-lg font-black">0 <span className="text-[10px] opacity-60">PTS</span></p>
                            </div>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-xl space-y-3">
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest border-b pb-1">Accuracy Formula</p>
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-mono font-bold">(Σ Points / Total Claims) × 100</span>
                                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">Defensible Alpha</Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic">
                                This formula ensures that a firm with 10 claims is normalized against a firm with 2, focusing fresh qualitative success rather than quantity alone.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Global Ranking Rules */}
                <Card className="border-l-4 border-l-amber-500">
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-amber-500" />
                            Global Ranking Logic
                        </CardTitle>
                        <CardDescription className="text-xs font-bold uppercase tracking-tight">Aggregating performance across themes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="h-8 w-8 shrink-0 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold text-xs ring-4 ring-amber-500/5">1</div>
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-tight mb-1">Best-Foot-Forward Rule</h4>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                                        In cases where an institution provides multiple call texts or variations for a single market theme (e.g., Stocks), <strong>only the highest-scoring record is counted</strong> for the Global Ranking. This prevents dilution from minor contradictory notes.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="h-8 w-8 shrink-0 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold text-xs ring-4 ring-amber-500/5">2</div>
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-tight mb-1">Breadth Optimization</h4>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                                        Firms that cover 10 themes have more opportunities to accumulate points than those covering only 2. The Global Ranking <strong>rewards intellectual coverage breadth</strong>, identifying who correctly navigated the most sectors of the 2025 market.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="h-8 w-8 shrink-0 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold text-xs ring-4 ring-amber-500/5">3</div>
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-tight mb-1">Standardization</h4>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                                        To ensure fairness across different report depths, we also provide a <strong>Per-Theme Classification</strong> (Excellent to Failed). This allows specialized boutique firms to stand out in their specific areas of expertise.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="h-8 w-8 shrink-0 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold text-xs ring-4 ring-amber-500/5">4</div>
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-tight mb-1">Tie-break by Conviction</h4>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                                        In the event of a tie in the Global Ranking, ties are resolved based on the editorial conviction level; the institution with the higher conviction is given priority.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Classification Scale & Colors */}
                <Card className="border-l-4 border-l-slate-900 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <LayoutGrid className="h-4 w-4 text-slate-950" />
                            Performance Classification & Visual Language
                        </CardTitle>
                        <CardDescription className="text-xs font-bold uppercase tracking-tight">Standardized tiers and color mapping</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Theme-Specific Scale */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b pb-2 mb-4">Theme Performance (0-100%)</h4>
                                <div className="space-y-2">
                                    {[
                                        { label: "EXCELLENT", score: ">= 90", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/30" },
                                        { label: "GOOD", score: ">= 75", color: "text-slate-950", bg: "bg-slate-950/5", border: "border-slate-950/20" },
                                        { label: "PARTIAL", score: ">= 60", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
                                        { label: "WEAK", score: ">= 40", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30" },
                                        { label: "FAILED", score: "< 40", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" },
                                    ].map((tier) => (
                                        <div key={tier.label} className={cn("flex items-center justify-between p-2 rounded-xl border", tier.bg, tier.border)}>
                                            <span className={cn("text-[10px] font-black uppercase tracking-widest", tier.color)}>{tier.label}</span>
                                            <span className="text-[10px] font-bold font-mono">{tier.score}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Global Aggregation Scale */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b pb-2 mb-4">Global Aggregation (PTS / 900 Ref)</h4>
                                <div className="space-y-2">
                                    {[
                                        { label: "EXCELLENT", score: ">= 810", color: "text-green-600", bg: "bg-green-600/5", border: "border-green-600/20" },
                                        { label: "GOOD", score: ">= 675", color: "text-slate-950", bg: "bg-slate-950/5", border: "border-slate-950/20" },
                                        { label: "PARTIAL", score: ">= 540", color: "text-yellow-600", bg: "bg-yellow-600/5", border: "border-yellow-600/20" },
                                        { label: "WEAK", score: ">= 360", color: "text-orange-500", bg: "bg-orange-500/5", border: "border-orange-500/20" },
                                        { label: "FAILED", score: "< 360", color: "text-red-600", bg: "bg-red-600/5", border: "border-red-600/20" },
                                    ].map((tier) => (
                                        <div key={tier.label} className={cn("flex items-center justify-between p-2.5 rounded-xl border border-dashed", tier.bg, tier.border)}>
                                            <span className={cn("text-[10px] font-black uppercase tracking-widest", tier.color)}>{tier.label}</span>
                                            <span className="text-[10px] font-bold font-mono">{tier.score}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Theme Performance Ranking */}
                <Card className="border-l-4 border-l-emerald-500 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-emerald-500" />
                            Theme Performance & Conviction
                        </CardTitle>
                        <CardDescription className="text-xs font-bold uppercase tracking-tight">The "Theme Alpha" indicator</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                            <div className="space-y-4">
                                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                                    Our <strong>Theme Ranking</strong> view compares two critical metrics to identify market surprises:
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <div className="p-1 rounded bg-emerald-500/10 mt-0.5">
                                            <TrendingUp className="h-3 w-3 text-emerald-600" />
                                        </div>
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">
                                            <span className="text-foreground block mb-0.5">Bloomberg Conviction Level</span>
                                            The editorial order in which Bloomberg News prioritized the themes (Editorial expectation).
                                        </p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="p-1 rounded bg-indigo-500/10 mt-0.5">
                                            <CheckCircle2 className="h-3 w-3 text-indigo-600" />
                                        </div>
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">
                                            <span className="text-foreground block mb-0.5">Average Realized Accuracy</span>
                                            The mean score across all 60+ institutions for that specific theme.
                                        </p>
                                    </li>
                                </ul>
                                <div className="p-4 bg-muted/20 border-l-2 border-emerald-500 rounded-r-xl">
                                    <p className="text-xs font-bold text-foreground mb-1">Why this matters?</p>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        By mapping these two against each other, we can see if the "highest conviction" topics actually materialized more reliably than the "fringe" topics. If a low-conviction theme has high average accuracy, it indicates a <strong>Consensus Blindspot</strong> that actually worked out.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-emerald-500/5 rounded-3xl p-6 border-2 border-emerald-500/10 relative overflow-hidden h-full flex flex-col justify-center text-center">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <BarChart3 className="h-32 w-32" />
                                </div>
                                <h4 className="text-4xl font-black text-emerald-600 mb-2">Alpha Audit</h4>
                                <p className="text-sm font-bold uppercase tracking-widest text-emerald-800/60 mb-6">Defensibility Protocol</p>
                                <p className="text-xs text-muted-foreground font-medium max-w-sm mx-auto">
                                    This methodology transforms raw journalistic synthesis into a structured, quantitative audit that holds institutions accountable for their 2025 visibility.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color }: any) {
    return (
        <Card className="bg-card hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-4">
                <div className={cn("p-2 rounded-lg bg-muted/50", color.replace('text', 'bg-').replace('500', '500/10'))}>
                    <Icon className={cn("h-5 w-5", color)} />
                </div>
                <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{title}</p>
                    <p className={cn("text-lg font-extrabold line-clamp-1", color)}>{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}


function AnalysisDetail({
    item,
    onNavigate
}: {
    item: ExPostItem,
    onNavigate: (theme: string, institution: string) => void
}) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
            {/* 1: Theme Header Context */}
            <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">
                <Target className="h-3 w-3" />
                {item.theme === "Global" ? "GLOBAL PERFORMANCE RECAP" : `2025 ${item.theme} AUDIT`}
            </div>

            {/* 2: The Ranking Card */}
            <Card className={cn("border-l-8 overflow-hidden", getClassificationBg(item.classification).split(' ')[1])}>
                <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Badge className={cn("px-3 py-1 text-xs font-bold uppercase", getClassificationBg(item.classification))} variant="outline">
                                    {item.classification}
                                </Badge>
                            </div>
                            <CardTitle className="text-4xl font-black tracking-tight">{item.Institution}</CardTitle>
                        </div>
                        {item.theme !== "Global" && (
                            <div className="flex items-center gap-4 bg-background/50 p-4 rounded-2xl border-2 shadow-sm">
                                <div className="text-center px-4 border-r">
                                    <span className="text-[10px] uppercase font-black text-muted-foreground block mb-1">Final Score</span>
                                    <span className={cn("text-4xl font-black", getClassificationColor(item.classification))}>{item.score} pts</span>
                                </div>
                                <div className="flex flex-col gap-1.5 px-2">
                                    <div className="flex items-center gap-3">
                                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">#{item.Original_Rank}</div>
                                        <span className="text-[10px] font-bold uppercase text-muted-foreground">EX-ANTE RANK</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">#{item.Rank}</div>
                                        <span className="text-[10px] font-bold uppercase text-muted-foreground">EX-POST RANK</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {item.theme === "Global" && (
                            <div className="bg-background/50 p-4 rounded-2xl border-2 shadow-sm">
                                <span className="text-[10px] uppercase font-black text-muted-foreground block mb-1">Aggregate Accuracy Score</span>
                                <span className={cn(
                                    "text-4xl font-black",
                                    getGlobalScoreColor(item.score)
                                )}>{item.score} pts</span>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="bg-muted/5 py-4 border-t flex items-center justify-between">
                    <div className="flex gap-6">
                        {item.theme === "Global" ? (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 font-bold text-xs">
                                    <Layers className="h-4 w-4 text-primary" />
                                    <span>{item.summary_stats.total_statements} THEMES ANALYZED</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <OutcomeBadge label="YES" count={item.summary_stats.materialized_count} color="bg-green-500" />
                                <OutcomeBadge label="PARTIAL" count={item.summary_stats.partial_count} color="bg-yellow-500" />
                                <OutcomeBadge label="FAILED" count={item.summary_stats.failed_count} color="bg-red-500" />
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        <Target className="h-3.5 w-3.5" />
                        {item.theme === "Global" ? "GLOBAL SCALE" : `${item.theme} SECTOR`}
                    </div>
                </CardContent>
            </Card>

            {/* 3: Final Verdict & Justification (Executive Summary) */}
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Executive Verdict & Justification</h3>
                </div>
                <Card className="bg-muted text-card-foreground border-2 shadow-xl overflow-hidden relative group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] opacity-60 uppercase font-black tracking-widest">Post-Event Summary Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl font-medium leading-relaxed italic pr-12 relative z-10">
                            "{item.overall_analysis || item.justification}"
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Global Thematic Breakdown */}
            {item.theme === "Global" && item.themeBreakdown && (
                <div className="space-y-6 pt-4">
                    <div className="flex items-center gap-2">
                        <LayoutGrid className="h-5 w-5 text-primary" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Thematic Participation Breakdown</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {item.themeBreakdown.map((tb, idx) => (
                            <button
                                key={idx}
                                onClick={() => onNavigate(tb.theme, item.Institution)}
                                className="p-4 rounded-2xl border bg-card hover:shadow-xl hover:-translate-y-2 transition-transform duration-200 text-left flex items-center gap-4 group h-full"
                            >
                                {/* Score Circle */}
                                <div className={cn("flex-shrink-0 h-16 w-16 rounded-full flex items-center justify-center shadow-md transform transition-transform duration-200 group-hover:scale-105",
                                    getThemeScoreColor(tb.score).replace('text-', 'bg-').replace('600', '600/15').replace('500', '500/15'))}>
                                    <span className={cn("text-2xl font-extrabold", getThemeScoreColor(tb.score))}>{tb.score}</span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 flex items-start justify-between">
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-1 truncate">{tb.theme}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {tb.exAnte !== undefined && (
                                                <span className="text-[11px] font-bold px-2 py-1 rounded-md bg-muted/10 border border-muted/30">Ex-Ante #{tb.exAnte}</span>
                                            )}
                                            {tb.exPost !== undefined && (
                                                <span className="text-[11px] font-bold px-2 py-1 rounded-md bg-muted/10 border border-muted/30">Ex-Post #{tb.exPost}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="ml-4 flex items-center opacity-70 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="h-5 w-5 text-primary" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 4: The Claims (Evidence & Narrative Flow) - Only for individual themes */}
            {item.theme !== "Global" && item.statements.length > 0 && (
                <div className="space-y-6 pt-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <History className="h-5 w-5 text-primary" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Detailed Evidence (Comparison Board)</h3>
                        </div>
                        <Badge variant="secondary" className="font-mono text-[10px] px-2 py-0.5">{item.statements.length} CLAIMS AUDITED</Badge>
                    </div>

                    <div className="space-y-6">
                        {item.statements.map((stmt, idx) => (
                            <div key={idx} className="relative group">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                                    {/* Left Side: The Original Claim */}
                                    <div className="relative lg:col-span-5">
                                        <div className={cn(
                                            "absolute -left-4 -top-4 h-10 w-10 rounded-full border-4 border-background flex items-center justify-center text-lg z-20 shadow-md",
                                            getMaterializedColor(stmt.materialized).split(' ')[1]
                                        )}>
                                            {getMaterializedIcon(stmt.materialized)}
                                        </div>
                                        <div className="bg-card rounded-2xl border pt-4 px-4 pb-3 shadow-sm group-hover:shadow-md transition-all border-muted/50 relative overflow-hidden flex flex-col">
                                            <div className={cn("absolute top-0 left-0 w-1.5 h-full", getMaterializedColor(stmt.materialized).split(' ')[0])} />
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ex-Ante Claim #{idx + 1}</h4>
                                                <Badge variant="outline" className={cn("text-[9px] uppercase font-bold px-2 py-0", getMaterializedColor(stmt.materialized).split(' ')[0])}>
                                                    Original Prediction
                                                </Badge>
                                            </div>
                                            <p className={cn("text-xl font-bold leading-tight tracking-tight", getMaterializedColor(stmt.materialized).split(' ')[0])}>
                                                {stmt.statement}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right Side: The Reality Evidence (AS AN EXPANDER) */}
                                    <div className="bg-muted/10 rounded-2xl p-4 border border-muted/40 h-full relative lg:col-span-7">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between border-b border-muted pb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 rounded-full bg-background border flex items-center justify-center">
                                                        <Search className="h-3 w-3 text-primary" />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Ex-Post Reality Check</span>
                                                </div>
                                                <Badge variant="secondary" className={cn("text-[9px] uppercase font-black tracking-widest px-2 py-0.5", getMaterializedColor(stmt.materialized).split(' ')[0])}>
                                                    {stmt.materialized}
                                                </Badge>
                                            </div>
                                            <ReasoningRenderer text={stmt.reasoning} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function OutcomeBadge({ label, count, color }: any) {
    if (count === 0) return null;
    return (
        <div className="flex items-center gap-1.5">
            <div className={cn("h-2 w-2 rounded-full", color)} />
            <span className="text-xs font-bold">{count} {label}</span>
        </div>
    );
}

const THEME_COLORS: Record<string, string> = {
    "BASE CASE": "#3b82f6", // Blue
    "GROWTH": "#10b981",    // Emerald
    "INFLATION": "#ef4444", // Red
    "MONETARY POLICY": "#8b5cf6", // Violet
    "FISCAL": "#f59e0b",    // Amber
    "TARIFFS": "#f43f5e",   // Rose
    "STOCKS": "#06b6d4",    // Cyan
    "BONDS": "#6366f1",     // Indigo
    "CREDIT": "#14b8a6",    // Teal
    "COMMODITIES": "#84cc16", // Lime
    "CURRENCIES": "#ec4899", // Pink
    "ALTERNATIVE ASSETS": "#f97316", // Orange
    "MULTI ASSET": "#0ea5e9", // Sky
    "AI": "#d946ef",        // Fuchsia
    "RISKS": "#64748b",      // Slate
    "DEFAULT": "#94a3b8"
};

function ThemePerformanceRanking({ onNavigate }: { onNavigate: (theme: string, institution: string) => void }) {
    return (
        <div className="pt-4">
            <RankMigrationChart onNavigate={onNavigate} />
        </div>
    );
}

function RankMigrationChart({ onNavigate }: { onNavigate: (theme: string, institution: string) => void }) {
    const convictionData = useMemo(() => getThemeRankingByConviction(), []);
    const accuracyData = useMemo(() => getThemeRanking(), []);
    const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);

    const THEME_HEIGHT = 45;
    const SVG_HEIGHT = convictionData.length * THEME_HEIGHT + 100;
    const SVG_WIDTH = 1000;
    const COLUMN_WIDTH = 250;

    return (
        <Card className="min-h-[600px] overflow-hidden bg-background/50 border-2">
            <CardHeader className="bg-muted/10 border-b">
                <div className="flex justify-between items-center">
                    <div className="text-center w-[250px]">
                        <Badge variant="outline" className="mb-1">EX-ANTE</Badge>
                        <CardTitle className="text-sm font-black uppercase text-muted-foreground">Institutional Conviction</CardTitle>
                    </div>
                    <div className="text-center flex-1 italic text-xs text-muted-foreground">
                        Trace the evolution of market priorities vs reality (Click theme to explore)
                    </div>
                    <div className="text-center w-[250px]">
                        <Badge variant="outline" className="mb-1">EX-POST</Badge>
                        <CardTitle className="text-sm font-black uppercase text-muted-foreground">Prediction Accuracy</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8">
                <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full h-auto overflow-visible select-none">
                    {/* Connecting Lines */}
                    {convictionData.map((exAnte, exAnteIdx) => {
                        const exPostIdx = accuracyData.findIndex(t => t.theme === exAnte.theme);
                        const exPost = accuracyData[exPostIdx];
                        const color = THEME_COLORS[exAnte.theme] || THEME_COLORS["DEFAULT"];
                        const isHovered = hoveredTheme === exAnte.theme;

                        const y1 = exAnteIdx * THEME_HEIGHT + 50;
                        const y2 = exPostIdx * THEME_HEIGHT + 50;
                        const x1 = COLUMN_WIDTH + 20;
                        const x2 = SVG_WIDTH - COLUMN_WIDTH - 20;

                        return (
                            <path
                                key={exAnte.theme}
                                d={`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`}
                                fill="none"
                                stroke={color}
                                strokeWidth={isHovered ? 4 : 2}
                                opacity={hoveredTheme ? (isHovered ? 1 : 0.1) : 0.4}
                                className="transition-all duration-300"
                            />
                        );
                    })}

                    {/* Left Column (Conviction) */}
                    {convictionData.map((t, idx) => (
                        <g
                            key={`left-${t.theme}`}
                            className="cursor-pointer group"
                            onMouseEnter={() => setHoveredTheme(t.theme)}
                            onMouseLeave={() => setHoveredTheme(null)}
                            onClick={() => onNavigate(t.theme, "")}
                        >
                            <rect
                                x={0}
                                y={idx * THEME_HEIGHT + 30}
                                width={COLUMN_WIDTH}
                                height={36}
                                rx={8}
                                fill={hoveredTheme === t.theme ? THEME_COLORS[t.theme] : "white"}
                                stroke={THEME_COLORS[t.theme] || THEME_COLORS["DEFAULT"]}
                                strokeWidth={1}
                                className="transition-all duration-200"
                                opacity={hoveredTheme && hoveredTheme !== t.theme ? 0.3 : 1}
                            />
                            <text
                                x={15}
                                y={idx * THEME_HEIGHT + 53}
                                className={cn(
                                    "text-[10px] font-black uppercase transition-colors",
                                    hoveredTheme === t.theme ? "fill-white" : "fill-foreground"
                                )}
                                opacity={hoveredTheme && hoveredTheme !== t.theme ? 0.3 : 1}
                            >
                                <tspan x={15} dy="0">#{idx + 1} {t.theme.length > 25 ? t.theme.slice(0, 22) + "..." : t.theme}</tspan>
                            </text>
                        </g>
                    ))}

                    {/* Right Column (Accuracy) */}
                    {accuracyData.map((t, idx) => (
                        <g
                            key={`right-${t.theme}`}
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredTheme(t.theme)}
                            onMouseLeave={() => setHoveredTheme(null)}
                            onClick={() => onNavigate(t.theme, "")}
                        >
                            <rect
                                x={SVG_WIDTH - COLUMN_WIDTH}
                                y={idx * THEME_HEIGHT + 30}
                                width={COLUMN_WIDTH}
                                height={36}
                                rx={8}
                                fill={hoveredTheme === t.theme ? THEME_COLORS[t.theme] : "white"}
                                stroke={THEME_COLORS[t.theme] || THEME_COLORS["DEFAULT"]}
                                strokeWidth={1}
                                className="transition-all duration-200"
                                opacity={hoveredTheme && hoveredTheme !== t.theme ? 0.3 : 1}
                            />
                            <text
                                x={SVG_WIDTH - COLUMN_WIDTH + 15}
                                y={idx * THEME_HEIGHT + 53}
                                className={cn(
                                    "text-[10px] font-black uppercase transition-colors",
                                    hoveredTheme === t.theme ? "fill-white" : "fill-foreground"
                                )}
                                opacity={hoveredTheme && hoveredTheme !== t.theme ? 0.3 : 1}
                            >
                                <tspan x={SVG_WIDTH - COLUMN_WIDTH + 15} dy="0">#{idx + 1} {t.theme.length > 20 ? t.theme.slice(0, 18) + "..." : t.theme} ({t.avgScore}%)</tspan>
                            </text>
                        </g>
                    ))}
                </svg>
            </CardContent>
        </Card>
    );
}

function ThemeIcon({ theme, className }: { theme: string, className?: string }) {
    switch (theme.toUpperCase()) {
        case "GLOBAL RANKING": return <Trophy className={className} />;
        case "THEME RANKING": return <BarChart3 className={className} />;
        case "AI": return <Zap className={className} />;
        case "STOCKS": return <BarChart3 className={className} />;
        case "INFLATION": return <TrendingUp className={className} />;
        case "MONETARY POLICY": return <Landmark className={className} />;
        case "TARIFFS": return <AlertTriangle className={className} />;
        case "CURRENCIES": return <Coins className={className} />;
        case "COMMODITIES": return <Package className={className} />;
        case "FISCAL": return <Wallet className={className} />;
        case "ALTERNATIVE ASSETS": return <Layers className={className} />;
        case "MULTI ASSET": return <PieChart className={className} />;
        default: return <Target className={className} />;
    }
}

