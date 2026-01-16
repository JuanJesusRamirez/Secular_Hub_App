"use client";

import { useState, useMemo } from "react";
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
    Home,
    MoveLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    AI_THEME_DATA,
    TARIFFS_THEME_DATA,
    getClassificationColor,
    getClassificationBg,
    getMaterializedIcon,
    getMaterializedColor
} from "@/lib/data/expost-2025";
import { ExPostItem } from "@/types/expost";

const ReasoningRenderer = ({ text }: { text: string }) => {
    // Regex to find: Source X (Publication, Date, URL)
    // Updated to handle commas in dates (e.g., "December 8, 2025")
    const sourceRegex = /Source\s+(\d+)\s*\(([^,]+),\s*(.+?),\s*(https?:\/\/[^\s)]+)\)/gi;

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
    const sourcesMap: Record<string, { pub: string, date: string, url: string }> = {};
    const sRegex = new RegExp(sourceRegex);
    while ((sMatch = sRegex.exec(text)) !== null) {
        const id = sMatch[1];
        sourcesMap[id] = { pub: sMatch[2].trim(), date: sMatch[3].trim(), url: sMatch[4].trim() };
        tokens.push({
            index: sMatch.index,
            length: sMatch[0].length,
            type: 'source',
            content: { id, ...sourcesMap[id] }
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
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary hover:bg-primary/20 transition-colors mx-0.5"
                    title={`${token.content.pub} (${token.content.date})`}
                >
                    <span className="opacity-70">[{token.content.id}]</span>
                    <span>{token.content.pub}</span>
                    <ExternalLink className="h-2 w-2 opacity-50" />
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

    const uniqueSources = Object.entries(sourcesMap).map(([id, data]) => ({ id, ...data }));
    return (
        <div className="space-y-4">
            <div className="text-sm leading-relaxed text-muted-foreground font-medium">
                {renderedElements}
            </div>
        </div>
    );
};

export default function ExPost2025Page() {
    const [activeTheme, setActiveTheme] = useState<"AI" | "TARIFFS">("AI");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedExPostItem, setSelectedExPostItem] = useState<ExPostItem | null>(null);

    const currentThemeData = activeTheme === "AI" ? AI_THEME_DATA : TARIFFS_THEME_DATA;

    const filteredItems = useMemo(() => {
        return currentThemeData.items.filter(item =>
            item.Institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.statements.some(s => s.statement.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [currentThemeData, searchQuery]);

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

                <div className="flex flex-wrap gap-3">
                    <Button
                        variant={activeTheme === "AI" ? "default" : "outline"}
                        onClick={() => setActiveTheme("AI")}
                        className="rounded-full px-6"
                    >
                        <Zap className="mr-2 h-4 w-4" />
                        AI Revolution
                    </Button>
                    <Button
                        variant={activeTheme === "TARIFFS" ? "default" : "outline"}
                        onClick={() => setActiveTheme("TARIFFS")}
                        className="rounded-full px-6"
                    >
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Tariff Wars
                    </Button>
                </div>
            </div>

            {/* Stats Summary Area */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard title="Total Firms" value={stats.totalInstitutions} icon={Target} color="text-blue-500" />
                <StatCard title="Avg Score" value={`${stats.avgScore} pts`} icon={TrendingUp} color="text-emerald-500" />
                <StatCard title="Excellent" value={stats.excellentCount} icon={Trophy} color="text-green-500" />
                <StatCard title="Good/Partial" value={stats.goodCount + stats.partialCount} icon={CheckCircle2} color="text-yellow-500" />
                <StatCard title="Weak/Failed" value={stats.weakCount + stats.failedCount} icon={XCircle} color="text-red-500" />
                <Card className="bg-muted/30 border-dashed">
                    <CardContent className="p-4 flex flex-col justify-center h-full text-center">
                        <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Theme Hub</p>
                        <p className="text-xl font-bold">{activeTheme}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar: Ranking List */}
                <div className="lg:col-span-4 space-y-4">
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
                        <CardHeader className="bg-muted/20 pb-4">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider">Performance Ranking</CardTitle>
                                <Badge variant="outline">Score-Based</Badge>
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
                                            selectedExPostItem?.id === item.id ? "bg-primary/5 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col items-center">
                                                <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
                                                {item.Rank < item.Original_Rank ? (
                                                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                                                ) : item.Rank > item.Original_Rank ? (
                                                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                                                ) : (
                                                    <Minus className="h-3 w-3 text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm line-clamp-1">{item.Institution}</p>
                                                <p className="text-xs text-muted-foreground">Ex-Ante Rank: #{item.Original_Rank}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={cn("text-sm font-bold", getClassificationColor(item.classification))}>
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
                <div className="lg:col-span-8 space-y-6">
                    {!selectedExPostItem ? (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-muted/10">
                            <FileText className="h-16 w-16 text-muted-foreground/20 mb-4" />
                            <h3 className="text-xl font-bold">Select a Firm</h3>
                            <p className="text-muted-foreground max-w-xs">Select an institution from the ranking to see their detailed ex-post analysis.</p>
                        </div>
                    ) : (
                        <AnalysisDetail item={selectedExPostItem} />
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
                    <p className="text-lg font-extrabold line-clamp-1">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function AnalysisDetail({ item }: { item: ExPostItem }) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
            {/* 1 & 2: Institutional Identity & Ranking Summary */}
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
                    </div>
                </CardHeader>
                <CardContent className="bg-muted/5 py-4 border-t flex items-center justify-between">
                    <div className="flex gap-6">
                        <OutcomeBadge label="YES" count={item.summary_stats.materialized_count} color="bg-green-500" />
                        <OutcomeBadge label="PARTIAL" count={item.summary_stats.partial_count} color="bg-yellow-500" />
                        <OutcomeBadge label="FAILED" count={item.summary_stats.failed_count} color="bg-red-500" />
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        <Target className="h-3.5 w-3.5" />
                        {item.theme} SECTOR
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

            {/* 4: The Claims (Evidence & Narrative Flow) */}
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
