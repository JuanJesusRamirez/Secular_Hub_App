
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
