/**
 * Mock/fallback data for demo resilience
 * Used when API calls fail or for development
 */

// Snapshot page fallback data
export const fallbackThemes = [
  { theme: "Artificial Intelligence", count: 145 },
  { theme: "Deglobalization", count: 89 },
  { theme: "Energy Transition", count: 76 },
  { theme: "Soft Landing", count: 65 },
  { theme: "Inflation Persistence", count: 54 },
  { theme: "Geopolitical Risk", count: 43 },
];

export const fallbackInstitutions = [
  { institution: "J.P. Morgan", count: 12 },
  { institution: "Goldman Sachs", count: 11 },
  { institution: "Morgan Stanley", count: 10 },
  { institution: "BlackRock", count: 9 },
  { institution: "Amundi", count: 8 },
];

export const fallbackStats = {
  total_records: 1248,
  years: [] as { year: number; count: number }[],
  themes: fallbackThemes,
  institutions: fallbackInstitutions,
};

// Sentiment distribution (used when real sentiment data is unavailable)
export const fallbackSentimentData = [
  { name: 'Bullish', value: 45 },
  { name: 'Bearish', value: 25 },
  { name: 'Neutral', value: 20 },
  { name: 'Mixed', value: 10 },
];

// Delta page mock data
export const mockSankeyData = {
  nodes: [
    { name: "Inflation" },
    { name: "Growth" },
    { name: "Geopolitics" },
    { name: "Inflation" },
    { name: "Growth" },
    { name: "AI Infra" },
    { name: "De-globalization" },
  ],
  links: [
    { source: 0, target: 3, value: 40 }, // Inflation -> Inflation
    { source: 0, target: 4, value: 20 }, // Inflation -> Growth
    { source: 1, target: 4, value: 50 }, // Growth -> Growth
    { source: 2, target: 6, value: 30 }, // Geopolitics -> De-globalization
    { source: 1, target: 5, value: 10 }, // Growth -> AI Infra
  ],
};

export const mockConvictionShifts = [
  { theme: "AI", rankYear1: 10, rankYear2: 2, delta: 8 },
  { theme: "Recession", rankYear1: 15, rankYear2: 5, delta: 10 },
  { theme: "Inflation", rankYear1: 1, rankYear2: 3, delta: -2 },
  { theme: "Trade War", rankYear1: 5, rankYear2: 20, delta: -15 },
];

export const mockInstitutionPivots = [
  { institution: "Goldman Sachs", themeYear1: "Inflation", themeYear2: "Growth", isPivot: true },
  { institution: "JPMorgan", themeYear1: "Rates", themeYear2: "Credit", isPivot: true },
  { institution: "BlackRock", themeYear1: "AI", themeYear2: "AI", isPivot: false },
  { institution: "Morgan Stanley", themeYear1: "Cyclicals", themeYear2: "Quality", isPivot: true },
];

// Delta stats row mock data
export function getDeltaStats(year1: number, year2: number) {
  return [
    { label: "Total Calls", value: "+198", subValue: "+26% YoY", trend: "up" as const },
    { label: "New Themes", value: "12", subValue: `in ${year2}`, trend: "up" as const },
    { label: "Extinct Themes", value: "8", subValue: `from ${year1}`, trend: "down" as const },
    { label: "Pivoting Inst.", value: "24", subValue: "Changed Top Conviction", trend: "neutral" as const },
  ];
}

// Home page fallback stats
export const fallbackHomeStats = {
  total_records: 7582,
  years: [{ year: 2026, count: 1248 }, { year: 2025, count: 1100 }],
  themes: [{ theme: "AI", count: 150 }],
  institutions: [{ institution: "JPM", count: 12 }],
};
