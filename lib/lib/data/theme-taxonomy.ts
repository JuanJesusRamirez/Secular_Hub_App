// Theme Taxonomy Classification
// Themes are classified into categories for display in the Executive Overview

export type ThemeCategory =
  | 'baseCase'
  | 'topics'        // Macro Economic + Events + Labor/Consumer (ranked)
  | 'thematic'      // Secular/structural trends (ranked)
  | 'geographies'   // Regional focus (not ranked)
  | 'assetClasses'  // Asset classes + metrics (not ranked)
  | 'risks';        // Dedicated section (not ranked)

// Classification rules
const MACRO_ECONOMIC = [
  'GROWTH', 'RECESSION', 'INFLATION', 'DISINFLATION', 'STAGFLATION',
  'SLOWDOWN', 'SOFT LANDING', 'MONETARY POLICY', 'FISCAL',
  'RATE CUTS', 'HIGH RATES', 'NEGATIVE RATES', 'INTEREST RATES',
  'PIVOT', 'TIGHTENING', 'QUANTITATIVE EASING', 'QUANTITATIVE TIGHTENING',
  'STIMULUS', 'STEEPENING'
];

const EVENTS = [
  'ELECTIONS', 'POLITICS', 'BREXIT', 'WAR', 'GEOPOLITICS',
  'TRADE', 'TARIFFS', 'COVID', 'DOLLAR'
];

const LABOR_CONSUMER = [
  'WAGES', 'UNEMPLOYMENT', 'CONSUMERS', 'COMPANIES'
];

// TOPICS = MACRO_ECONOMIC + EVENTS + LABOR_CONSUMER
const TOPICS = [...MACRO_ECONOMIC, ...EVENTS, ...LABOR_CONSUMER];

const THEMATIC = [
  'AI', 'ESG', 'TECH', 'MAGNIFICENT 7', 'ENERGY', 'METALS',
  'RESHORING', 'SUPPLY CHAIN', 'REGULATION',
  // Market dynamics that are thematic in nature
  'VOLATILITY', 'LIQUIDITY', 'ROTATION', 'CYCLICALS', 'SECTORS',
  'QUALITY', 'DIVERSIFICATION', 'HEDGING', 'STOCK PICKING', 'RALLY'
];

const GEOGRAPHIES = [
  'US', 'EUROPE', 'CHINA', 'JAPAN', 'UK', 'APAC', 'ASIA', 'GLOBAL'
];

const ASSET_CLASSES = [
  'STOCKS', 'BONDS', 'CREDIT', 'COMMODITIES', 'CURRENCIES',
  'ALTERNATIVE ASSETS', 'MULTI ASSET', 'REAL ESTATE',
  'PRIVATE MARKETS', 'HEDGE FUNDS',
  // Asset metrics
  'VALUATIONS', 'YIELDS', 'DURATION', 'SPREADS', 'DEFAULTS',
  'EARNINGS', 'RETURNS', 'INCOME', 'BOND SUPPLY', 'REFINANCING'
];

const RISKS = ['RISKS'];

export function classifyTheme(theme: string): ThemeCategory {
  if (theme === 'BASE CASE') return 'baseCase';
  if (RISKS.includes(theme)) return 'risks';
  if (GEOGRAPHIES.includes(theme)) return 'geographies';
  if (ASSET_CLASSES.includes(theme)) return 'assetClasses';
  if (THEMATIC.includes(theme)) return 'thematic';
  if (TOPICS.includes(theme)) return 'topics';

  // Default to topics for any unclassified themes
  return 'topics';
}

export interface ClassifiedThemes {
  topics: string[];        // Ranked by order of appearance
  thematic: string[];      // Ranked by order of appearance
  geographies: string[];   // Not ranked
  assetClasses: string[];  // Not ranked
  risks: string[];         // Not ranked
}

export function classifyThemes(themes: string[]): ClassifiedThemes {
  const result: ClassifiedThemes = {
    topics: [],
    thematic: [],
    geographies: [],
    assetClasses: [],
    risks: [],
  };

  // Process in order to preserve ranking for topics and thematic
  themes.forEach(theme => {
    if (theme === 'BASE CASE') return; // Skip base case

    const category = classifyTheme(theme);
    if (category !== 'baseCase') {
      result[category].push(theme);
    }
  });

  return result;
}

// Export constants for reference
export const TAXONOMY = {
  TOPICS,
  THEMATIC,
  GEOGRAPHIES,
  ASSET_CLASSES,
  RISKS,
};
