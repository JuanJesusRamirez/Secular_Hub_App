import { ExPostItem, ThemeData } from "@/types/expost";
import aiData from "./expost/2025/ranking_AI_2025.json";
import altAssetsData from "./expost/2025/ranking_ALTERNATIVE ASSETS_2025.json";
import baseCaseData from "./expost/2025/ranking_BASE CASE_2025.json";
import commoditiesData from "./expost/2025/ranking_COMMODITIES_2025.json";
import creditData from "./expost/2025/ranking_CREDIT_2025.json";
import currenciesData from "./expost/2025/ranking_CURRENCIES_2025.json";
import fiscalData from "./expost/2025/ranking_FISCAL_2025.json";
import growthData from "./expost/2025/ranking_GROWTH_2025.json";
import inflationData from "./expost/2025/ranking_INFLATION_2025.json";
import monetaryData from "./expost/2025/ranking_MONETARY POLICY_2025.json";
import multiAssetData from "./expost/2025/ranking_MULTI ASSET_2025.json";
import risksData from "./expost/2025/ranking_RISKS_2025.json";
import bondsData from "./expost/2025/ranking_BONDS_2025.json";
import stocksData from "./expost/2025/ranking_STOCKS_2025.json";
import tariffsData from "./expost/2025/ranking_TARIFFS_2025.json";
import themeConvictionData from "./expost/2025/theme_conviction_ranking.json";

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
    const totalCallTexts = items.length;
    const distinctFirms = new Set(items.map(i => i.Institution).filter(Boolean)).size;
    const avgScore = items.reduce((acc, item) => acc + item.score, 0) / totalCallTexts;

    return {
        totalInstitutions: distinctFirms, // Maintain totalInstitutions as distinct count
        totalFirms: distinctFirms,
        totalCallTexts,
        avgScore: Math.round(avgScore * 10) / 10,
        excellentCount: items.filter((i) => i.classification === "EXCELLENT").length,
        goodCount: items.filter((i) => i.classification === "GOOD").length,
        partialCount: items.filter((i) => i.classification === "PARTIAL").length,
        weakCount: items.filter((i) => i.classification === "WEAK").length,
        failedCount: items.filter((i) => i.classification === "FAILED").length,
    };
};


// Helper to create ThemeData
const createThemeData = (data: any[], themeName: string): ThemeData => {
    const processed = processData(data, themeName);
    return {
        theme: themeName,
        items: getRankingWithConviction(processed),
        themeStats: getThemeStats(processed),
    };
};

export const AI_THEME_DATA = createThemeData(aiData, "AI");
export const ALT_ASSETS_THEME_DATA = createThemeData(altAssetsData, "ALTERNATIVE ASSETS");
export const BASE_CASE_THEME_DATA = createThemeData(baseCaseData, "BASE CASE");
export const COMMODITIES_THEME_DATA = createThemeData(commoditiesData, "COMMODITIES");
export const CREDIT_THEME_DATA = createThemeData(creditData, "CREDIT");
export const CURRENCIES_THEME_DATA = createThemeData(currenciesData, "CURRENCIES");
export const FISCAL_THEME_DATA = createThemeData(fiscalData, "FISCAL");
export const GROWTH_THEME_DATA = createThemeData(growthData, "GROWTH");
export const INFLATION_THEME_DATA = createThemeData(inflationData, "INFLATION");
export const MONETARY_THEME_DATA = createThemeData(monetaryData, "MONETARY POLICY");
export const MULTI_ASSET_THEME_DATA = createThemeData(multiAssetData, "MULTI ASSET");
export const RISKS_THEME_DATA = createThemeData(risksData, "RISKS");
export const STOCKS_THEME_DATA = createThemeData(stocksData, "STOCKS");
export const TARIFFS_THEME_DATA = createThemeData(tariffsData, "TARIFFS");
export const BONDS_THEME_DATA = createThemeData(bondsData, "BONDS");

// All themes
export const ALL_THEMES: ThemeData[] = [
    BASE_CASE_THEME_DATA,
    GROWTH_THEME_DATA,
    MONETARY_THEME_DATA,
    INFLATION_THEME_DATA,
    CURRENCIES_THEME_DATA,
    FISCAL_THEME_DATA,
    AI_THEME_DATA,
    TARIFFS_THEME_DATA,
    RISKS_THEME_DATA,
    STOCKS_THEME_DATA,
    BONDS_THEME_DATA,
    CREDIT_THEME_DATA,
    ALT_ASSETS_THEME_DATA,
    COMMODITIES_THEME_DATA,
    MULTI_ASSET_THEME_DATA,
];


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

export interface AggregateRankingItem {
    institution: string;
    totalScore: number;
    themesCount: number;
    avgScore: number;
    themeBreakdown: { theme: string; score: number }[];
}

export const getAggregateRanking = (themes: ThemeData[]): AggregateRankingItem[] => {
    const aggregate: Record<string, { totalScore: number; themesCount: number; themeBreakdown: { theme: string; score: number }[] }> = {};

    themes.forEach((theme) => {
        // Find the best entry for each institution within THIS theme
        const themeBest: Record<string, number> = {};
        theme.items.forEach((item) => {
            const inst = item.Institution;
            if (!inst) return;
            themeBest[inst] = Math.max(themeBest[inst] || 0, item.score);
        });

        // Add the best score from this theme to the global aggregate
        Object.entries(themeBest).forEach(([inst, score]) => {
            if (!aggregate[inst]) {
                aggregate[inst] = { totalScore: 0, themesCount: 0, themeBreakdown: [] };
            }
            aggregate[inst].totalScore += score;
            aggregate[inst].themesCount += 1;
            aggregate[inst].themeBreakdown.push({ theme: theme.theme, score });
        });
    });

    return Object.entries(aggregate)
        .map(([institution, data]) => ({
            institution,
            totalScore: Math.round(data.totalScore * 10) / 10,
            themesCount: data.themesCount,
            avgScore: Math.round((data.totalScore / data.themesCount) * 10) / 10,
            themeBreakdown: data.themeBreakdown.sort((a, b) => b.score - a.score),
        }))
        .sort((a, b) => b.totalScore - a.totalScore);
};

export const getAggregateThemeData = (themes: ThemeData[]): ThemeData => {
    const aggregate = getAggregateRanking(themes);

    // Create virtual ExPostItems for the aggregate view
    const items: ExPostItem[] = aggregate.map((agg: AggregateRankingItem, idx: number) => ({
        id: `global-${idx}`,
        Institution: agg.institution,
        Rank: idx + 1,
        Original_Rank: 0, // Not applicable for global
        Prediction_Text: `Institutional strategy performance across ${agg.themesCount} themes.`,
        statements: [], // No global statements here
        score: agg.totalScore,
        classification: agg.avgScore >= 90 ? "EXCELLENT" : agg.avgScore >= 75 ? "GOOD" : agg.avgScore >= 60 ? "PARTIAL" : "WEAK" as any,
        justification: `Top performer across ${agg.themesCount} different market themes. Average accuracy: ${agg.avgScore}%.`,
        theme: "Global",
        themeBreakdown: agg.themeBreakdown,
        summary_stats: {
            total_statements: agg.themesCount,
            materialized_count: 0,
            partial_count: 0,
            failed_count: 0,
        },
    }));

    return {
        theme: "GLOBAL RANKING",
        items,
        themeStats: {
            totalInstitutions: aggregate.length,
            totalFirms: aggregate.length,
            totalCallTexts: themes.reduce((acc, t) => acc + t.items.length, 0),
            avgScore: Math.round((aggregate.reduce((acc: number, a: AggregateRankingItem) => acc + a.totalScore, 0) / aggregate.length) * 10) / 10,
            excellentCount: items.filter(i => i.score >= 800).length,
            goodCount: items.filter(i => i.score >= 650 && i.score < 800).length,
            partialCount: items.filter(i => i.score >= 450 && i.score < 650).length,
            weakCount: items.filter(i => i.score < 450).length,
            failedCount: 0,
        }
    };
};

export const GLOBAL_THEME_DATA = getAggregateThemeData(ALL_THEMES);

// All themes including Global
export const ALL_THEMES_WITH_GLOBAL: ThemeData[] = [
    GLOBAL_THEME_DATA,
    ...ALL_THEMES
];

export const TOP_5_INSTITUTIONS = getAggregateRanking(ALL_THEMES).slice(0, 5);

export const getThemeRanking = () => {
    return ALL_THEMES
        .map(t => {
            const conviction = themeConvictionData.find(c => c.theme === t.theme);
            return {
                theme: t.theme,
                avgScore: t.themeStats.avgScore,
                totalInstitutions: t.themeStats.totalInstitutions,
                convictionRank: conviction ? conviction.rank : 99
            };
        })
        .sort((a, b) => b.avgScore - a.avgScore);
};

export const getThemeRankingByConviction = () => {
    return ALL_THEMES
        .map(t => {
            const conviction = themeConvictionData.find(c => c.theme === t.theme);
            return {
                theme: t.theme,
                avgScore: t.themeStats.avgScore,
                totalInstitutions: t.themeStats.totalInstitutions,
                convictionRank: conviction ? conviction.rank : 99
            };
        })
        .sort((a, b) => a.convictionRank - b.convictionRank);
};

