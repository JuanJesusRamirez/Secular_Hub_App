// Semantic Color System for Narrative Evolution Visualization
// Colors encode meaning, not just identity

export type SemanticCategory =
  | 'GROWTH_EXPANSION'
  | 'CONTRACTION_RISK'
  | 'POLICY_INTERVENTION'
  | 'STRUCTURAL_SHIFTS'
  | 'BASE_CASE';

// Category color palettes (primary + variants)
export const SEMANTIC_PALETTE: Record<SemanticCategory, { primary: string; light: string; dark: string }> = {
  GROWTH_EXPANSION: {
    primary: '#22c55e',  // green-500
    light: '#86efac',    // green-300
    dark: '#16a34a',     // green-600
  },
  CONTRACTION_RISK: {
    primary: '#ef4444',  // red-500
    light: '#fca5a5',    // red-300
    dark: '#dc2626',     // red-600
  },
  POLICY_INTERVENTION: {
    primary: '#8b5cf6',  // violet-500
    light: '#c4b5fd',    // violet-300
    dark: '#7c3aed',     // violet-600
  },
  STRUCTURAL_SHIFTS: {
    primary: '#14b8a6',  // teal-500
    light: '#5eead4',    // teal-300
    dark: '#0d9488',     // teal-600
  },
  BASE_CASE: {
    primary: '#475569',  // slate-600
    light: '#94a3b8',    // slate-400
    dark: '#334155',     // slate-700
  },
};

// Map each theme to its semantic category
export const THEME_TO_CATEGORY: Record<string, SemanticCategory> = {
  // Base Case
  'BASE CASE': 'BASE_CASE',

  // Growth/Expansion themes (GREEN)
  'GROWTH': 'GROWTH_EXPANSION',
  'SOFT LANDING': 'GROWTH_EXPANSION',
  'RATE CUTS': 'GROWTH_EXPANSION',
  'PIVOT': 'GROWTH_EXPANSION',
  'DISINFLATION': 'GROWTH_EXPANSION',
  'LIQUIDITY': 'GROWTH_EXPANSION',

  // Contraction/Risk themes (RED/ORANGE)
  'RECESSION': 'CONTRACTION_RISK',
  'INFLATION': 'CONTRACTION_RISK',
  'SLOWDOWN': 'CONTRACTION_RISK',
  'VOLATILITY': 'CONTRACTION_RISK',
  'HIGH RATES': 'CONTRACTION_RISK',
  'WAR': 'CONTRACTION_RISK',
  'COVID': 'CONTRACTION_RISK',
  'RISKS': 'CONTRACTION_RISK',

  // Policy/Intervention themes (PURPLE/BLUE)
  'MONETARY POLICY': 'POLICY_INTERVENTION',
  'FISCAL': 'POLICY_INTERVENTION',
  'QUANTITATIVE TIGHTENING': 'POLICY_INTERVENTION',
  'QUANTITATIVE EASING': 'POLICY_INTERVENTION',
  'NEGATIVE RATES': 'POLICY_INTERVENTION',
  'REGULATION': 'POLICY_INTERVENTION',

  // Structural Shifts themes (TEAL/CYAN)
  'AI': 'STRUCTURAL_SHIFTS',
  'TRADE': 'STRUCTURAL_SHIFTS',
  'TARIFFS': 'STRUCTURAL_SHIFTS',
  'GEOPOLITICS': 'STRUCTURAL_SHIFTS',
  'POLITICS': 'STRUCTURAL_SHIFTS',
  'ELECTIONS': 'STRUCTURAL_SHIFTS',
  'ESG': 'STRUCTURAL_SHIFTS',
  'SUPPLY CHAIN': 'STRUCTURAL_SHIFTS',
  'RESHORING': 'STRUCTURAL_SHIFTS',
  'BREXIT': 'STRUCTURAL_SHIFTS',
  'WAGES': 'STRUCTURAL_SHIFTS',
};

// Get color for a theme
export function getSemanticColor(theme: string): string {
  const category = THEME_TO_CATEGORY[theme] || 'STRUCTURAL_SHIFTS';
  return SEMANTIC_PALETTE[category].primary;
}

// Get category for a theme
export function getThemeCategory(theme: string): SemanticCategory {
  return THEME_TO_CATEGORY[theme] || 'STRUCTURAL_SHIFTS';
}

// Get all themes in a category
export function getThemesByCategory(category: SemanticCategory): string[] {
  return Object.entries(THEME_TO_CATEGORY)
    .filter(([, cat]) => cat === category)
    .map(([theme]) => theme);
}

// Category display names and descriptions
export const CATEGORY_INFO: Record<SemanticCategory, { name: string; description: string; icon: string }> = {
  GROWTH_EXPANSION: {
    name: 'Growth & Expansion',
    description: 'Bullish macro conditions, easing policy',
    icon: 'TrendingUp',
  },
  CONTRACTION_RISK: {
    name: 'Risk & Contraction',
    description: 'Bearish conditions, inflation, recession fears',
    icon: 'TrendingDown',
  },
  POLICY_INTERVENTION: {
    name: 'Policy & Intervention',
    description: 'Central bank and government policy actions',
    icon: 'Landmark',
  },
  STRUCTURAL_SHIFTS: {
    name: 'Structural Shifts',
    description: 'Secular themes, geopolitics, technology',
    icon: 'Shuffle',
  },
  BASE_CASE: {
    name: 'Base Case',
    description: 'Bloomberg\'s consensus anchor scenario',
    icon: 'Target',
  },
};
