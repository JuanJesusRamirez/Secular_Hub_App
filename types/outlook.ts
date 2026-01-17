
export interface OutlookItem {
  id: string;
  Theme: string;
  Rank: number;
  Institution: string;
  Call_text: string;
  Year: number;
  Sub_theme: string;
  Section_description: string;
  // Enriched fields
  sentiment_label?: "Bullish" | "Bearish" | "Neutral";
  sentiment_score?: number;
  extracted_gdp?: string;
  extracted_inflation?: string;
  tags?: string[];
}

// Database shape matching Prisma model
export interface OutlookCall {
  id: string;
  year: number;
  institution: string;
  institutionCanonical?: string;
  theme: string;
  themeCategory: string;
  subTheme: string | null;
  callText: string;
  sectionDescription: string | null;
  rank: number | null;
  convictionTier: string | null;
  sentimentLabel?: string | null;
  sentimentScore?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StatsResponse {
  total_records: number;
  years: { year: number; count: number }[];
  themes: { theme: string; count: number }[];
  institutions: { institution: string; count: number }[];
}
