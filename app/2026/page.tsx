"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OUTLOOK_2026_FULL, OutlookItem } from "@/lib/data/outlook-2026-detailed";
import {
    Activity,
    TrendingUp,
    DollarSign,
    AlertTriangle,
    ShieldAlert,
    Zap,
    Globe,
    BarChart3,
    PieChart,
    Building2,
    Search,
    Filter,
    Quote
} from "lucide-react";
import { cn } from "@/lib/utils";

// Groupings for tabs
const TAB_GROUPS = {
    overview: ["BASE CASE", "RISKS", "AI"],
    macro: ["GROWTH", "INFLATION", "MONETARY POLICY", "FISCAL", "TARIFFS"],
    assets: ["STOCKS", "BONDS", "CREDIT", "COMMODITIES", "CURRENCIES", "ALTERNATIVE ASSETS", "MULTI-ASSET"]
};

// Map themes to icons and colors
const THEME_CONFIG: Record<string, { icon: any, color: string }> = {
    "BASE CASE": { icon: Building2, color: "text-blue-500" },
    "RISKS": { icon: AlertTriangle, color: "text-red-500" },
    "AI": { icon: Zap, color: "text-yellow-500" },
    "GROWTH": { icon: TrendingUp, color: "text-green-500" },
    "INFLATION": { icon: Activity, color: "text-orange-500" },
    "MONETARY POLICY": { icon: DollarSign, color: "text-indigo-500" },
    "FISCAL": { icon: Globe, color: "text-purple-500" },
    "TARIFFS": { icon: ShieldAlert, color: "text-slate-500" },
    "STOCKS": { icon: BarChart3, color: "text-emerald-500" },
    "BONDS": { icon: Activity, color: "text-cyan-500" },
    "CREDIT": { icon: PieChart, color: "text-violet-500" },
    "COMMODITIES": { icon: Building2, color: "text-amber-700" },
    "CURRENCIES": { icon: DollarSign, color: "text-lime-600" },
    "ALTERNATIVE ASSETS": { icon: PieChart, color: "text-pink-500" },
    "MULTI-ASSET": { icon: BarChart3, color: "text-fuchsia-500" }
};

export default function Dashboard2026() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedInstitution, setSelectedInstitution] = useState<string>("all");

    // Get unique institutions for filter
    const institutions = Array.from(new Set(OUTLOOK_2026_FULL.map(item => item.Institution))).sort();

    // Filter data
    const filteredData = OUTLOOK_2026_FULL.filter(item => {
        const matchesSearch =
            item.Call_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.Institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.Sub_theme?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesInstitution = selectedInstitution === "all" || item.Institution === selectedInstitution;

        return matchesSearch && matchesInstitution;
    });

    // Helper to get items by theme
    const getItemsByTheme = (theme: string) => filteredData.filter(item => item.Theme === theme);

    // Render a section for a theme
    const renderThemeSection = (theme: string) => {
        const items = getItemsByTheme(theme);
        if (items.length === 0) return null;

        const config = THEME_CONFIG[theme] || { icon: BarChart3, color: "text-gray-500" };
        const Icon = config.icon;

        // Use the Section_description from the first item as the theme summary
        const summary = items[0]?.Section_description;

        return (
            <div key={theme} className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-start gap-4 mb-6">
                    <div className={cn("p-3 rounded-xl bg-muted/50", config.color.replace('text-', 'bg-').replace('500', '500/10'))}>
                        <Icon className={cn("h-8 w-8", config.color)} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{theme}</h2>
                        <p className="text-lg text-muted-foreground mt-1 max-w-4xl">{summary}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <Card key={item.id} className="flex flex-col h-full hover:shadow-lg transition-all duration-300 border-muted/60 bg-gradient-to-b from-card to-muted/20">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start gap-2">
                                    <Badge variant="outline" className="font-mono text-xs">Rank #{item.Rank}</Badge>
                                    <Badge variant="secondary" className="text-[10px] uppercase truncate max-w-[120px]" title={item.Sub_theme}>{item.Sub_theme}</Badge>
                                </div>
                                <CardTitle className="text-lg mt-2 line-clamp-2 leading-tight min-h-[3rem] items-center flex">
                                    {item.Institution}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col gap-4">
                                <div className="relative z-0">
                                    <Quote className="h-6 w-6 text-muted-foreground/10 absolute -top-2 -left-2 rotate-180" />
                                    <p className="text-sm text-foreground/80 leading-relaxed pl-4 italic">
                                        {item.Call_text.replace(/^"|"$/g, '')}
                                    </p>
                                </div>

                                {/* AI Insight Layer */}
                                <div className="mt-auto pt-4 border-t border-border/40 space-y-3">

                                    {/* Sentiment Bar */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground">
                                            <span>AI Sentiment</span>
                                            <span className={cn(
                                                item.sentiment_label === "Bullish" ? "text-green-500" :
                                                    item.sentiment_label === "Bearish" ? "text-red-500" : "text-yellow-500"
                                            )}>{item.sentiment_label}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full transition-all rounded-full",
                                                    item.sentiment_label === "Bullish" ? "bg-green-500" :
                                                        item.sentiment_label === "Bearish" ? "bg-red-500" : "bg-yellow-500"
                                                )}
                                                style={{
                                                    width: `${Math.abs((item.sentiment_score || 0) * 100)}%`,
                                                    marginLeft: (item.sentiment_score || 0) < 0 ? 'auto' : '0'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Extracted Metrics */}
                                    {(item.extracted_gdp || item.extracted_inflation) && (
                                        <div className="flex gap-2">
                                            {item.extracted_gdp && (
                                                <Badge variant="outline" className="bg-blue-500/5 border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300 text-[10px] px-1.5 h-5">
                                                    GDP: {item.extracted_gdp}
                                                </Badge>
                                            )}
                                            {item.extracted_inflation && (
                                                <Badge variant="outline" className="bg-orange-500/5 border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-300 text-[10px] px-1.5 h-5">
                                                    CPI: {item.extracted_inflation}
                                                </Badge>
                                            )}
                                        </div>
                                    )}

                                    {/* Auto Tags */}
                                    {item.tags && item.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {item.tags.map(tag => (
                                                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground font-medium uppercase tracking-wider">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 pb-20 w-full max-w-[1920px] mx-auto">
            {/* Header Area */}
            <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center border-b pb-8 bg-background/50 backdrop-blur-sm sticky top-0 z-10 px-1 pt-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        2026 Global Outlook
                    </h1>
                    <p className="text-lg text-muted-foreground mt-2">
                        Comprehensive institutional views & consensus database
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search keywords or firms..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Filter by Firm" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Firms</SelectItem>
                            {institutions.map(inst => (
                                <SelectItem key={inst} value={inst}>{inst}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {filteredData.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                    <p className="text-xl">No outlook data found matching your criteria.</p>
                    <p className="text-sm mt-2">Try adjusting your search or filters.</p>
                    <div className="mt-4 p-4 border rounded bg-muted/20 text-xs font-mono text-left max-w-md mx-auto overflow-auto">
                        Debug Info:<br />
                        Total Items: {OUTLOOK_2026_FULL?.length || 0}<br />
                        Search: "{searchQuery}"<br />
                        Institution: "{selectedInstitution}"
                    </div>
                </div>
            )}

            {/* Main Content */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-[600px] mb-12 mx-auto bg-muted/50 p-1">
                    <TabsTrigger value="overview">Executive Summary</TabsTrigger>
                    <TabsTrigger value="macro">Macroeconomics</TabsTrigger>
                    <TabsTrigger value="assets">Asset Classes</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-0 space-y-16">
                    {TAB_GROUPS.overview.map(theme => renderThemeSection(theme))}
                </TabsContent>

                <TabsContent value="macro" className="mt-0 space-y-16">
                    {TAB_GROUPS.macro.map(theme => renderThemeSection(theme))}
                </TabsContent>

                <TabsContent value="assets" className="mt-0 space-y-16">
                    {TAB_GROUPS.assets.map(theme => renderThemeSection(theme))}
                </TabsContent>
            </Tabs>

            <div className="text-center text-sm text-muted-foreground pt-12 border-t">
                <p>Aggregated from {institutions.length} institutional outlook reports for 2026.</p>
            </div>
        </div>
    );
}
