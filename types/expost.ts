// Types for Ex-Post Analysis (2025 and beyond)

export interface Statement {
    statement: string;
    materialized: "YES" | "PARTIAL" | "NO" | "UNKNOWN";
    reasoning: string;
}

export interface SummaryStats {
    total_statements: number;
    materialized_count: number;
    partial_count: number;
    failed_count: number;
}

export interface ExPostItem {
    id: string;
    Institution: string;
    Original_Rank: number;
    Rank: number;
    Prediction_Text: string;
    statements: Statement[];
    overall_analysis?: string;
    summary_stats: SummaryStats;
    score: number;
    classification: "EXCELLENT" | "GOOD" | "PARTIAL" | "WEAK" | "FAILED";
    justification: string;
    theme?: string; // AI, TARIFFS, etc.
    themeBreakdown?: { theme: string; score: number }[];
}

export interface ThemeData {
    theme: string;
    items: ExPostItem[];
    themeStats: {
        totalInstitutions: number;
        avgScore: number;
        excellentCount: number;
        goodCount: number;
        partialCount: number;
        weakCount: number;
        failedCount: number;
    };
}
