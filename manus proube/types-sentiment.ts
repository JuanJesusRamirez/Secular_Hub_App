/**
 * Tipos TypeScript para el Sistema de Análisis de Sentimiento
 * Copiar este archivo a: src/types/sentiment.ts en tu proyecto
 */

export type SentimentType = 'Bullish' | 'Bearish' | 'Neutral';

export interface SentimentDistribution {
  Bullish?: number;
  Bearish?: number;
  Neutral?: number;
}

export interface Asset {
  theme: string;
  sentiment: SentimentType;
  sentiment_distribution: SentimentDistribution;
  description: string;
  sub_themes: string[];
  institutions_count: number;
  calls_count: number;
  institutions: string[];
}

export interface AssetsData {
  [key: string]: Asset;
}

export interface SentimentStats {
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  totalCalls: number;
  totalInstitutions: number;
}

export interface SentimentBadgeProps {
  sentiment: SentimentType;
  size?: 'sm' | 'md' | 'lg';
}

export interface AssetCardProps {
  theme: string;
  sentiment: SentimentType;
  sentiment_distribution: SentimentDistribution;
  description: string;
  sub_themes: string[];
  institutions_count: number;
  calls_count: number;
  institutions: string[];
}

export interface AssetsListProps {
  assets: Record<string, Asset>;
  title?: string;
  description?: string;
}
