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
    if (score >= 800) return "text-green-600";
    if (score >= 650) return "text-slate-950"; // Black
    if (score >= 450) return "text-yellow-600";
    return "text-red-500";
};

export default function ExPost2025Page() {
    const THEME_RANKING_LABEL = "THEME RANKING";
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
            {activeThemeName !== THEME_RANKING_LABEL && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <StatCard
                        title="Total Firms"
                        value={stats.totalInstitutions}
                        icon={Target}
                        color={activeThemeName === "GLOBAL RANKING" ? "text-indigo-600" : "text-blue-500"}
                    />
                    <StatCard
                        title={activeThemeName === "GLOBAL RANKING" ? "Global Score" : "Avg Score"}
                        value={`${stats.avgScore} pts`}
                        icon={TrendingUp}
                        color={activeThemeName === "GLOBAL RANKING" ? getGlobalScoreColor(stats.avgScore) : "text-emerald-500"}
                    />

                    {activeThemeName === "GLOBAL RANKING" ? (
                        <>
                            <StatCard
                                title="Market Alphas"
                                value={stats.excellentCount}
                                icon={Zap}
                                color="text-green-600"
                            />
                            <StatCard
                                title="Market Leaders"
                                value={stats.goodCount}
                                icon={Trophy}
                                color="text-slate-950"
                            />
                            <StatCard
                                title="Consistent"
                                value={stats.partialCount}
                                icon={CheckCircle2}
                                color="text-yellow-600"
                            />
                            <StatCard
                                title="Lagging"
                                value={stats.weakCount}
                                icon={AlertTriangle}
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
                                title="Good/Partial"
                                value={stats.goodCount + stats.partialCount}
                                icon={CheckCircle2}
                                color="text-yellow-500"
                            />
                            <StatCard
                                title="Weak/Failed"
                                value={stats.weakCount + stats.failedCount}
                                icon={XCircle}
                                color="text-red-500"
                            />
                            <Card className="bg-muted/30 border-dashed">
                                <CardContent className="p-4 flex flex-col justify-center h-full text-center">
                                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Theme Hub</p>
                                    <p className="text-xl font-bold truncate">{activeThemeName}</p>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Navigation: Themes */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="sticky top-8 space-y-4">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 mb-2">Main Views</h3>

                            {/* Global Ranking Button (Priority #1) */}
                            {ALL_THEMES_WITH_GLOBAL[0] && (
                                <Button
                                    key={ALL_THEMES_WITH_GLOBAL[0].theme}
                                    variant={activeThemeName === ALL_THEMES_WITH_GLOBAL[0].theme ? "default" : "outline"}
                                    onClick={() => {
                                        setActiveThemeName(ALL_THEMES_WITH_GLOBAL[0].theme);
                                        setSelectedExPostItem(ALL_THEMES_WITH_GLOBAL[0].items[0] || null);
                                    }}
                                    className={cn(
                                        "justify-start px-4 h-11 text-xs font-bold uppercase tracking-wider transition-all",
                                        activeThemeName === ALL_THEMES_WITH_GLOBAL[0].theme
                                            ? "shadow-md scale-[1.02]"
                                            : "hover:bg-muted"
                                    )}
                                >
                                    <ThemeIcon theme={ALL_THEMES_WITH_GLOBAL[0].theme} className="mr-2 h-4 w-4" />
                                    <span className="truncate">{ALL_THEMES_WITH_GLOBAL[0].theme}</span>
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
                                    "justify-start px-4 h-11 text-xs font-bold uppercase tracking-wider transition-all",
                                    activeThemeName === THEME_RANKING_LABEL
                                        ? "shadow-md scale-[1.02]"
                                        : "bg-primary/5 hover:bg-primary/10 border-primary/20"
                                )}
                            >
                                <BarChart3 className="mr-2 h-4 w-4" />
                                {THEME_RANKING_LABEL}
                            </Button>

                            <div className="h-[1px] bg-border my-2" />

                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 mb-2">Market Themes</h3>

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
                                <SelectTrigger className="w-full h-11 text-xs font-bold uppercase tracking-wider bg-primary/5 border-primary/20 focus:ring-1">
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

                {/* Right Content Area */}
                <div className="lg:col-span-10">
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
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                            {/* Sidebar: Ranking List */}
                            <div className="xl:col-span-4 space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search firm..."
                                            className="pl-9"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <Card className="max-h-[800px] overflow-auto">
                                    <CardHeader className={cn(
                                        "pb-4",
                                        activeThemeName === "GLOBAL RANKING" ? "bg-indigo-500/5" : "bg-muted/20"
                                    )}>
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-sm font-bold uppercase tracking-wider">Performance Ranking</CardTitle>
                                            <Badge
                                                variant={activeThemeName === "GLOBAL RANKING" ? "default" : "outline"}
                                                className={cn(
                                                    activeThemeName === "GLOBAL RANKING" && "bg-indigo-600 hover:bg-indigo-700"
                                                )}
                                            >
                                                Score-Based
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y">
                                            {filteredItems.map((item, index) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => setSelectedExPostItem(item)}
                                                    className={cn(
                                                        "w-full text-left p-4 hover:bg-muted/50 transition-colors flex items-center justify-between gap-4",
                                                        selectedExPostItem?.id === item.id
                                                            ? (activeThemeName === "GLOBAL RANKING" ? "bg-indigo-500/5 border-l-4 border-l-indigo-600" : "bg-primary/5 border-l-4 border-l-primary")
                                                            : "border-l-4 border-l-transparent"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-sm font-bold text-muted-foreground">
                                                                {activeThemeName === "GLOBAL RANKING" ? <Trophy className="h-3.5 w-3.5 text-indigo-500" /> : `#${index + 1}`}
                                                            </span>
                                                            {activeThemeName !== "GLOBAL RANKING" && (
                                                                item.Rank < item.Original_Rank ? (
                                                                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                                                                ) : item.Rank > item.Original_Rank ? (
                                                                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                                                                ) : (
                                                                    <Minus className="h-3 w-3 text-gray-400" />
                                                                )
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className={cn(
                                                                "font-semibold text-sm line-clamp-1",
                                                                activeThemeName === "GLOBAL RANKING" && selectedExPostItem?.id === item.id && "text-indigo-700"
                                                            )}>{item.Institution}</p>
                                                            {activeThemeName !== "GLOBAL RANKING" && (
                                                                <p className="text-xs text-muted-foreground">Ex-Ante Rank: #{item.Original_Rank}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={cn(
                                                            "text-sm font-bold",
                                                            activeThemeName === "GLOBAL RANKING"
                                                                ? getGlobalScoreColor(item.score)
                                                                : getClassificationColor(item.classification)
                                                        )}>
                                                            {item.score} pts
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Main Content: Analysis Detail */}
                            <div className="xl:col-span-8 space-y-6">
                                {!selectedExPostItem ? (
                                    <div className="h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-muted/10">
                                        <FileText className="h-16 w-16 text-muted-foreground/20 mb-4" />
                                        <h3 className="text-xl font-bold">Select a Firm</h3>
                                        <p className="text-muted-foreground max-w-xs">Select an institution from the ranking to see their detailed ex-post analysis.</p>
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
                        </div>
                    )}
                </div>
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
                <Card className="bg-foreground text-background shadow-xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                        <Trophy className="h-32 w-32" />
                    </div>
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
                                className="p-4 rounded-2xl border-2 bg-card hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all text-left flex flex-col justify-between group h-full"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <ThemeIcon theme={tb.theme} className="h-4 w-4 text-primary" />
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "text-[10px] font-bold",
                                                tb.score >= 90 ? "text-green-500 border-green-500/50 bg-green-500/10" :
                                                    tb.score >= 75 ? "text-emerald-500 border-emerald-500/50 bg-emerald-500/10" :
                                                        tb.score >= 60 ? "text-yellow-500 border-yellow-500/50 bg-yellow-500/10" :
                                                            tb.score >= 40 ? "text-orange-500 border-orange-500/50 bg-orange-500/10" :
                                                                "text-red-500 border-red-500/50 bg-red-500/10"
                                            )}
                                        >
                                            {tb.score} PTS
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{tb.theme}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-primary mt-6 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                    View Full Analysis <ArrowRight className="h-3 w-3" />
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

                    <div className="space-y-12">
                        {item.statements.map((stmt, idx) => (
                            <div key={idx} className="relative group">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8 items-stretch">
                                    {/* Left Side: The Original Claim */}
                                    <div className="relative pb-6 lg:pb-0">
                                        <div className={cn(
                                            "absolute -left-4 -top-4 h-10 w-10 rounded-full border-4 border-background flex items-center justify-center text-lg z-20 shadow-md",
                                            getMaterializedColor(stmt.materialized).split(' ')[1]
                                        )}>
                                            {getMaterializedIcon(stmt.materialized)}
                                        </div>
                                        <div className="bg-card rounded-2xl border p-6 shadow-sm group-hover:shadow-md transition-all border-muted/50 h-full relative overflow-hidden flex flex-col justify-center min-h-[140px]">
                                            <div className={cn("absolute top-0 left-0 w-1.5 h-full", getMaterializedColor(stmt.materialized).split(' ')[0])} />
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ex-Ante Claim #{idx + 1}</h4>
                                                <Badge variant="outline" className={cn("text-[9px] uppercase font-bold px-2 py-0", getMaterializedColor(stmt.materialized).split(' ')[0])}>
                                                    Original Prediction
                                                </Badge>
                                            </div>
                                            <p className={cn("text-xl font-bold leading-tight tracking-tight", getMaterializedColor(stmt.materialized).split(' ')[0])}>
                                                {stmt.statement}
                                            </p>
                                        </div>

                                        {/* Link decoration for desktop */}
                                        <div className="hidden lg:block absolute top-1/2 -right-6 w-4 h-[2px] bg-muted/30 -translate-y-1/2 z-0" />
                                    </div>

                                    {/* Right Side: The Reality Evidence */}
                                    <div className="bg-muted/10 rounded-2xl p-6 border border-muted/40 flex flex-col justify-center h-full relative">
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

