import { ExPostItem, ThemeData } from "@/types/expost";
import aiData from "./expost/2025/ai.json";
import tariffsData from "./expost/2025/tariffs.json";

// Process and enrich the data with theme information
const processData = (data: any[], theme: string): ExPostItem[] => {
    return data.map((item) => ({
        ...item,
        theme,
        // Ensure all required fields exist
        statements: item.statements || [],
        summary_stats: item.summary_stats || {
            total_statements: 0,
            materialized_count: 0,
            partial_count: 0,
            failed_count: 0,
        },
    }));
};

export const AI_DATA: ExPostItem[] = processData(aiData as any[], "AI");
export const TARIFFS_DATA: ExPostItem[] = processData(tariffsData as any[], "TARIFFS");

// Combined data sorted by Rank
export const EXPOST_2025_ALL: ExPostItem[] = [...AI_DATA, ...TARIFFS_DATA].sort(
    (a, b) => a.Rank - b.Rank
);

// Calculate conviction score for tiebreaking
export const getConvictionScore = (item: ExPostItem): number => {
    const stats = item.summary_stats;
    // More statements evaluated = higher conviction
    // More YES outcomes = higher conviction  
    return stats.total_statements * 10 + stats.materialized_count * 5 + stats.partial_count * 2;
};

// Get ranking with conviction tiebreaker
export const getRankingWithConviction = (items: ExPostItem[]): ExPostItem[] => {
    return [...items].sort((a, b) => {
        // First sort by score DESC
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        // Tiebreaker: conviction score DESC
        return getConvictionScore(b) - getConvictionScore(a);
    });
};

// Theme statistics
export const getThemeStats = (items: ExPostItem[]): ThemeData["themeStats"] => {
    const totalInstitutions = items.length;
    const avgScore = items.reduce((acc, item) => acc + item.score, 0) / totalInstitutions;

    return {
        totalInstitutions,
        avgScore: Math.round(avgScore * 10) / 10,
        excellentCount: items.filter((i) => i.classification === "EXCELLENT").length,
        goodCount: items.filter((i) => i.classification === "GOOD").length,
        partialCount: items.filter((i) => i.classification === "PARTIAL").length,
        weakCount: items.filter((i) => i.classification === "WEAK").length,
        failedCount: items.filter((i) => i.classification === "FAILED").length,
    };
};

// Pre-calculated theme data
export const AI_THEME_DATA: ThemeData = {
    theme: "AI",
    items: getRankingWithConviction(AI_DATA),
    themeStats: getThemeStats(AI_DATA),
};

export const TARIFFS_THEME_DATA: ThemeData = {
    theme: "TARIFFS",
    items: getRankingWithConviction(TARIFFS_DATA),
    themeStats: getThemeStats(TARIFFS_DATA),
};

// All themes
export const ALL_THEMES: ThemeData[] = [AI_THEME_DATA, TARIFFS_THEME_DATA];

// Get color for classification
export const getClassificationColor = (classification: ExPostItem["classification"]): string => {
    switch (classification) {
        case "EXCELLENT":
            return "text-green-500";
        case "GOOD":
            return "text-emerald-400";
        case "PARTIAL":
            return "text-yellow-500";
        case "WEAK":
            return "text-orange-500";
        case "FAILED":
            return "text-red-500";
        default:
            return "text-gray-500";
    }
};

export const getClassificationBg = (classification: ExPostItem["classification"]): string => {
    switch (classification) {
        case "EXCELLENT":
            return "bg-green-500/10 border-green-500/30";
        case "GOOD":
            return "bg-emerald-400/10 border-emerald-400/30";
        case "PARTIAL":
            return "bg-yellow-500/10 border-yellow-500/30";
        case "WEAK":
            return "bg-orange-500/10 border-orange-500/30";
        case "FAILED":
            return "bg-red-500/10 border-red-500/30";
        default:
            return "bg-gray-500/10 border-gray-500/30";
    }
};

export const getMaterializedIcon = (status: string): string => {
    switch (status) {
        case "YES":
            return "✅";
        case "PARTIAL":
            return "🔶";
        case "NO":
            return "❌";
        default:
            return "❔";
    }
};

export const getMaterializedColor = (status: string): string => {
    switch (status) {
        case "YES":
            return "text-green-500 bg-green-500/10";
        case "PARTIAL":
            return "text-yellow-500 bg-yellow-500/10";
        case "NO":
            return "text-red-500 bg-red-500/10";
        default:
            return "text-gray-500 bg-gray-500/10";
    }
};
