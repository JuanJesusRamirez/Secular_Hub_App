// Major Market Events for Narrative Chart Annotations
// These events drove significant shifts in Wall Street's thematic focus

export interface NarrativeEvent {
  year: number;
  label: string;
  shortLabel: string;
  impact: string;
  themesAffected: string[];
  type: 'crisis' | 'policy' | 'political' | 'structural';
}

export const NARRATIVE_EVENTS: NarrativeEvent[] = [
  {
    year: 2019,
    label: 'Yield Curve Inverts',
    shortLabel: 'Inversion',
    impact: 'Recession fears spike as classic warning signal triggers',
    themesAffected: ['RECESSION', 'SLOWDOWN', 'RATE CUTS'],
    type: 'crisis',
  },
  {
    year: 2020,
    label: 'COVID-19 Pandemic',
    shortLabel: 'COVID',
    impact: 'Global lockdowns trigger unprecedented policy response',
    themesAffected: ['COVID', 'FISCAL', 'MONETARY POLICY', 'VOLATILITY'],
    type: 'crisis',
  },
  {
    year: 2021,
    label: 'Inflation Emerges',
    shortLabel: 'Inflation',
    impact: 'Supply chains break, prices surge, "transitory" debate',
    themesAffected: ['INFLATION', 'SUPPLY CHAIN', 'WAGES'],
    type: 'structural',
  },
  {
    year: 2022,
    label: 'Fed Tightening Begins',
    shortLabel: 'Hikes',
    impact: 'Fastest rate hike cycle in 40 years begins',
    themesAffected: ['MONETARY POLICY', 'HIGH RATES', 'QUANTITATIVE TIGHTENING'],
    type: 'policy',
  },
  {
    year: 2023,
    label: 'Banking Crisis',
    shortLabel: 'SVB',
    impact: 'SVB collapse tests financial stability',
    themesAffected: ['VOLATILITY', 'RECESSION', 'LIQUIDITY'],
    type: 'crisis',
  },
  {
    year: 2024,
    label: 'Soft Landing Forms',
    shortLabel: 'Soft Land',
    impact: 'Inflation falls without recession, pivot anticipated',
    themesAffected: ['SOFT LANDING', 'RATE CUTS', 'DISINFLATION'],
    type: 'policy',
  },
  {
    year: 2025,
    label: 'Trump 2.0 Begins',
    shortLabel: 'Trump 2.0',
    impact: 'New administration brings tariff uncertainty',
    themesAffected: ['TARIFFS', 'TRADE', 'GEOPOLITICS', 'POLITICS'],
    type: 'political',
  },
  {
    year: 2026,
    label: 'AI Dominance',
    shortLabel: 'AI Era',
    impact: 'Artificial intelligence becomes the defining theme',
    themesAffected: ['AI', 'GROWTH'],
    type: 'structural',
  },
];

// Era definitions for background shading
export interface NarrativeEra {
  startYear: number;
  endYear: number;
  label: string;
  description: string;
  color: string;
}

export const NARRATIVE_ERAS: NarrativeEra[] = [
  {
    startYear: 2019,
    endYear: 2019,
    label: 'Late Cycle',
    description: 'End of post-GFC expansion, inversion fears',
    color: 'rgba(59, 130, 246, 0.06)', // blue
  },
  {
    startYear: 2020,
    endYear: 2020,
    label: 'Pandemic Shock',
    description: 'COVID-19 reshapes everything',
    color: 'rgba(239, 68, 68, 0.06)', // red
  },
  {
    startYear: 2021,
    endYear: 2022,
    label: 'Inflation Crisis',
    description: 'Price pressures dominate, Fed pivots hawkish',
    color: 'rgba(249, 115, 22, 0.06)', // orange
  },
  {
    startYear: 2023,
    endYear: 2024,
    label: 'The Great Pivot',
    description: 'From fear to soft landing optimism',
    color: 'rgba(139, 92, 246, 0.06)', // violet
  },
  {
    startYear: 2025,
    endYear: 2026,
    label: 'New Regime',
    description: 'AI revolution meets policy uncertainty',
    color: 'rgba(20, 184, 166, 0.06)', // teal
  },
];

// Get event for a specific year
export function getEventForYear(year: number): NarrativeEvent | undefined {
  return NARRATIVE_EVENTS.find(e => e.year === year);
}

// Get era for a specific year
export function getEraForYear(year: number): NarrativeEra | undefined {
  return NARRATIVE_ERAS.find(e => year >= e.startYear && year <= e.endYear);
}

// Get event type color
export function getEventTypeColor(type: NarrativeEvent['type']): string {
  const colors: Record<NarrativeEvent['type'], string> = {
    crisis: '#ef4444',    // red
    policy: '#8b5cf6',    // violet
    political: '#f97316', // orange
    structural: '#14b8a6', // teal
  };
  return colors[type];
}
