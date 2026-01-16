/**
 * Utilidades para Análisis de Sentimiento
 * Copiar este archivo a: src/utils/sentiment.ts en tu proyecto
 */

import { SentimentType, SentimentDistribution } from '@/types/sentiment';

/**
 * Extrae el sentimiento de un texto basado en palabras clave
 * @param text - Texto a analizar
 * @returns Sentimiento detectado: 'Bullish', 'Bearish' o 'Neutral'
 */
export function extractSentiment(text: string): SentimentType {
  const textLower = String(text).toLowerCase();

  const positiveWords = [
    'positive',
    'optimistic',
    'strong',
    'solid',
    'resilient',
    'growth',
    'opportunity',
    'favorable',
    'upside',
    'bullish',
    'outperform',
    'gains',
    'rally',
    'boom',
    'accelerate',
    'broadening',
    'attractive'
  ];

  const negativeWords = [
    'negative',
    'pessimistic',
    'weak',
    'decline',
    'risk',
    'volatility',
    'correction',
    'bearish',
    'underperform',
    'headwind',
    'pressure',
    'challenge',
    'downside',
    'caution',
    'concern'
  ];

  const neutralWords = [
    'moderate',
    'balanced',
    'mixed',
    'neutral',
    'range-bound',
    'stable',
    'steady'
  ];

  const posCount = positiveWords.filter(w => textLower.includes(w)).length;
  const negCount = negativeWords.filter(w => textLower.includes(w)).length;
  const neuCount = neutralWords.filter(w => textLower.includes(w)).length;

  if (posCount > negCount && posCount > neuCount) {
    return 'Bullish';
  } else if (negCount > posCount && negCount > neuCount) {
    return 'Bearish';
  } else {
    return 'Neutral';
  }
}

/**
 * Calcula los porcentajes de cada sentimiento
 * @param distribution - Distribución de sentimientos
 * @returns Objeto con porcentajes de cada sentimiento
 */
export function calculateSentimentPercentages(
  distribution: SentimentDistribution
): Record<SentimentType, number> {
  const total = Object.values(distribution).reduce((a, b) => a + (b || 0), 0);

  return {
    Bullish: total > 0 ? Math.round(((distribution.Bullish || 0) / total) * 100) : 0,
    Bearish: total > 0 ? Math.round(((distribution.Bearish || 0) / total) * 100) : 0,
    Neutral: total > 0 ? Math.round(((distribution.Neutral || 0) / total) * 100) : 0
  };
}

/**
 * Obtiene el color correspondiente a un sentimiento
 * @param sentiment - Tipo de sentimiento
 * @returns Objeto con clases de color para Tailwind
 */
export function getSentimentColors(sentiment: SentimentType) {
  const colors = {
    Bullish: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      barColor: '#22c55e'
    },
    Bearish: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      barColor: '#ef4444'
    },
    Neutral: {
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-200',
      barColor: '#94a3b8'
    }
  };

  return colors[sentiment];
}

/**
 * Obtiene el label en español para un sentimiento
 * @param sentiment - Tipo de sentimiento
 * @returns Label en español
 */
export function getSentimentLabel(sentiment: SentimentType): string {
  const labels = {
    Bullish: 'Alcista',
    Bearish: 'Bajista',
    Neutral: 'Neutral'
  };

  return labels[sentiment];
}

/**
 * Obtiene el emoji correspondiente a un sentimiento
 * @param sentiment - Tipo de sentimiento
 * @returns Emoji
 */
export function getSentimentEmoji(sentiment: SentimentType): string {
  const emojis = {
    Bullish: '📈',
    Bearish: '📉',
    Neutral: '➡️'
  };

  return emojis[sentiment];
}

/**
 * Ordena assets por sentimiento (Bullish primero)
 * @param assets - Array de assets
 * @returns Assets ordenados
 */
export function sortAssetsBySentiment(
  assets: Array<{ sentiment: SentimentType }>
): Array<{ sentiment: SentimentType }> {
  const sentimentOrder = { Bullish: 0, Neutral: 1, Bearish: 2 };

  return [...assets].sort(
    (a, b) => sentimentOrder[a.sentiment] - sentimentOrder[b.sentiment]
  );
}

/**
 * Filtra assets por sentimiento
 * @param assets - Objeto de assets
 * @param sentiment - Sentimiento a filtrar ('All' para todos)
 * @returns Array de assets filtrados
 */
export function filterAssetsBySentiment(
  assets: Record<string, any>,
  sentiment: 'All' | SentimentType
): Array<any> {
  const values = Object.values(assets);

  if (sentiment === 'All') {
    return values;
  }

  return values.filter(asset => asset.sentiment === sentiment);
}

/**
 * Calcula estadísticas agregadas de sentimiento
 * @param assets - Objeto de assets
 * @returns Estadísticas de sentimiento
 */
export function calculateSentimentStats(assets: Record<string, any>) {
  const values = Object.values(assets);

  return {
    bullishCount: values.filter(a => a.sentiment === 'Bullish').length,
    bearishCount: values.filter(a => a.sentiment === 'Bearish').length,
    neutralCount: values.filter(a => a.sentiment === 'Neutral').length,
    totalAssets: values.length,
    totalCalls: values.reduce((sum, a) => sum + (a.calls_count || 0), 0),
    totalInstitutions: new Set(values.flatMap(a => a.institutions || [])).size
  };
}

/**
 * Genera un resumen de sentimiento en texto
 * @param stats - Estadísticas de sentimiento
 * @returns Texto de resumen
 */
export function generateSentimentSummary(stats: any): string {
  const { bullishCount, neutralCount, bearishCount } = stats;
  const total = bullishCount + neutralCount + bearishCount;

  const bullishPct = Math.round((bullishCount / total) * 100);
  const neutralPct = Math.round((neutralCount / total) * 100);
  const bearishPct = Math.round((bearishCount / total) * 100);

  return `Sentimiento general: ${bullishCount} alcistas (${bullishPct}%), ${neutralCount} neutrales (${neutralPct}%), ${bearishCount} bajistas (${bearishPct}%).`;
}
