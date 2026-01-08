import { NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';
import { prisma } from '@/lib/db/client';

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Cache for sentiment results to avoid repeated API calls
const sentimentCache = new Map<string, SentimentResult>();

interface SentimentResult {
  label: 'positive' | 'negative' | 'neutral';
  score: number;
  normalizedScore: number; // -1 to 1 scale
}

interface FinBERTOutput {
  label: string;
  score: number;
}

// Pre-defined sentiment dictionary for common financial terms
// This provides instant, accurate sentiment for known terms without API calls
const FINANCIAL_SENTIMENT_DICTIONARY: Record<string, SentimentResult> = {
  // Strongly Positive (bullish) terms
  'growth': { label: 'positive', score: 0.85, normalizedScore: 0.85 },
  'bullish': { label: 'positive', score: 0.95, normalizedScore: 0.95 },
  'rally': { label: 'positive', score: 0.90, normalizedScore: 0.90 },
  'surge': { label: 'positive', score: 0.85, normalizedScore: 0.85 },
  'boom': { label: 'positive', score: 0.88, normalizedScore: 0.88 },
  'recovery': { label: 'positive', score: 0.80, normalizedScore: 0.80 },
  'expansion': { label: 'positive', score: 0.82, normalizedScore: 0.82 },
  'upside': { label: 'positive', score: 0.85, normalizedScore: 0.85 },
  'outperform': { label: 'positive', score: 0.88, normalizedScore: 0.88 },
  'optimistic': { label: 'positive', score: 0.85, normalizedScore: 0.85 },
  'strength': { label: 'positive', score: 0.78, normalizedScore: 0.78 },
  'strong': { label: 'positive', score: 0.75, normalizedScore: 0.75 },
  'gains': { label: 'positive', score: 0.80, normalizedScore: 0.80 },
  'profit': { label: 'positive', score: 0.82, normalizedScore: 0.82 },
  'profits': { label: 'positive', score: 0.82, normalizedScore: 0.82 },
  'opportunity': { label: 'positive', score: 0.75, normalizedScore: 0.75 },
  'opportunities': { label: 'positive', score: 0.75, normalizedScore: 0.75 },
  'tailwind': { label: 'positive', score: 0.78, normalizedScore: 0.78 },
  'tailwinds': { label: 'positive', score: 0.78, normalizedScore: 0.78 },
  'momentum': { label: 'positive', score: 0.70, normalizedScore: 0.70 },
  'resilient': { label: 'positive', score: 0.75, normalizedScore: 0.75 },
  'resilience': { label: 'positive', score: 0.75, normalizedScore: 0.75 },
  'improving': { label: 'positive', score: 0.72, normalizedScore: 0.72 },
  'acceleration': { label: 'positive', score: 0.78, normalizedScore: 0.78 },
  'overweight': { label: 'positive', score: 0.70, normalizedScore: 0.70 },
  'upgrade': { label: 'positive', score: 0.80, normalizedScore: 0.80 },
  'buy': { label: 'positive', score: 0.75, normalizedScore: 0.75 },

  // Positive phrases
  'rate cuts': { label: 'positive', score: 0.72, normalizedScore: 0.72 },
  'rate cut': { label: 'positive', score: 0.72, normalizedScore: 0.72 },
  'soft landing': { label: 'positive', score: 0.80, normalizedScore: 0.80 },
  'strong economy': { label: 'positive', score: 0.85, normalizedScore: 0.85 },
  'economic growth': { label: 'positive', score: 0.82, normalizedScore: 0.82 },
  'earnings growth': { label: 'positive', score: 0.85, normalizedScore: 0.85 },
  'risk appetite': { label: 'positive', score: 0.65, normalizedScore: 0.65 },
  'risk on': { label: 'positive', score: 0.70, normalizedScore: 0.70 },
  'market rally': { label: 'positive', score: 0.88, normalizedScore: 0.88 },
  'bull market': { label: 'positive', score: 0.90, normalizedScore: 0.90 },
  'positive outlook': { label: 'positive', score: 0.85, normalizedScore: 0.85 },
  'upward revision': { label: 'positive', score: 0.78, normalizedScore: 0.78 },

  // Strongly Negative (bearish) terms
  'recession': { label: 'negative', score: 0.90, normalizedScore: -0.90 },
  'bearish': { label: 'negative', score: 0.95, normalizedScore: -0.95 },
  'crash': { label: 'negative', score: 0.95, normalizedScore: -0.95 },
  'collapse': { label: 'negative', score: 0.92, normalizedScore: -0.92 },
  'crisis': { label: 'negative', score: 0.88, normalizedScore: -0.88 },
  'downturn': { label: 'negative', score: 0.85, normalizedScore: -0.85 },
  'decline': { label: 'negative', score: 0.75, normalizedScore: -0.75 },
  'downside': { label: 'negative', score: 0.78, normalizedScore: -0.78 },
  'weakness': { label: 'negative', score: 0.72, normalizedScore: -0.72 },
  'weak': { label: 'negative', score: 0.70, normalizedScore: -0.70 },
  'risk': { label: 'negative', score: 0.55, normalizedScore: -0.55 },
  'risks': { label: 'negative', score: 0.55, normalizedScore: -0.55 },
  'headwind': { label: 'negative', score: 0.72, normalizedScore: -0.72 },
  'headwinds': { label: 'negative', score: 0.72, normalizedScore: -0.72 },
  'underperform': { label: 'negative', score: 0.80, normalizedScore: -0.80 },
  'pessimistic': { label: 'negative', score: 0.85, normalizedScore: -0.85 },
  'contraction': { label: 'negative', score: 0.78, normalizedScore: -0.78 },
  'slowing': { label: 'negative', score: 0.65, normalizedScore: -0.65 },
  'slowdown': { label: 'negative', score: 0.70, normalizedScore: -0.70 },
  'losses': { label: 'negative', score: 0.80, normalizedScore: -0.80 },
  'loss': { label: 'negative', score: 0.75, normalizedScore: -0.75 },
  'sell': { label: 'negative', score: 0.70, normalizedScore: -0.70 },
  'underweight': { label: 'negative', score: 0.68, normalizedScore: -0.68 },
  'downgrade': { label: 'negative', score: 0.78, normalizedScore: -0.78 },
  'volatility': { label: 'negative', score: 0.60, normalizedScore: -0.60 },
  'uncertainty': { label: 'negative', score: 0.58, normalizedScore: -0.58 },
  'turbulence': { label: 'negative', score: 0.70, normalizedScore: -0.70 },
  'correction': { label: 'negative', score: 0.65, normalizedScore: -0.65 },
  'selloff': { label: 'negative', score: 0.82, normalizedScore: -0.82 },
  'sell-off': { label: 'negative', score: 0.82, normalizedScore: -0.82 },

  // Negative phrases
  'rate hikes': { label: 'negative', score: 0.65, normalizedScore: -0.65 },
  'rate hike': { label: 'negative', score: 0.65, normalizedScore: -0.65 },
  'hard landing': { label: 'negative', score: 0.85, normalizedScore: -0.85 },
  'market crash': { label: 'negative', score: 0.95, normalizedScore: -0.95 },
  'bear market': { label: 'negative', score: 0.90, normalizedScore: -0.90 },
  'recession risk': { label: 'negative', score: 0.85, normalizedScore: -0.85 },
  'geopolitical risk': { label: 'negative', score: 0.70, normalizedScore: -0.70 },
  'downward revision': { label: 'negative', score: 0.75, normalizedScore: -0.75 },
  'risk off': { label: 'negative', score: 0.68, normalizedScore: -0.68 },
  'credit crunch': { label: 'negative', score: 0.85, normalizedScore: -0.85 },
  'debt crisis': { label: 'negative', score: 0.88, normalizedScore: -0.88 },
  'financial crisis': { label: 'negative', score: 0.92, normalizedScore: -0.92 },

  // Neutral terms (policy, metrics, assets)
  'inflation': { label: 'neutral', score: 0.85, normalizedScore: 0 },
  'interest rates': { label: 'neutral', score: 0.90, normalizedScore: 0 },
  'rates': { label: 'neutral', score: 0.85, normalizedScore: 0 },
  'federal reserve': { label: 'neutral', score: 0.95, normalizedScore: 0 },
  'fed': { label: 'neutral', score: 0.90, normalizedScore: 0 },
  'policy': { label: 'neutral', score: 0.92, normalizedScore: 0 },
  'monetary policy': { label: 'neutral', score: 0.92, normalizedScore: 0 },
  'fiscal policy': { label: 'neutral', score: 0.90, normalizedScore: 0 },
  'gdp': { label: 'neutral', score: 0.95, normalizedScore: 0 },
  'employment': { label: 'neutral', score: 0.88, normalizedScore: 0 },
  'unemployment': { label: 'neutral', score: 0.75, normalizedScore: -0.25 },
  'bonds': { label: 'neutral', score: 0.92, normalizedScore: 0 },
  'equities': { label: 'neutral', score: 0.92, normalizedScore: 0 },
  'stocks': { label: 'neutral', score: 0.90, normalizedScore: 0 },
  'market': { label: 'neutral', score: 0.95, normalizedScore: 0 },
  'markets': { label: 'neutral', score: 0.95, normalizedScore: 0 },
  'yields': { label: 'neutral', score: 0.88, normalizedScore: 0 },
  'credit': { label: 'neutral', score: 0.85, normalizedScore: 0 },
  'dollar': { label: 'neutral', score: 0.92, normalizedScore: 0 },
  'currencies': { label: 'neutral', score: 0.90, normalizedScore: 0 },
  'commodities': { label: 'neutral', score: 0.90, normalizedScore: 0 },
  'oil': { label: 'neutral', score: 0.88, normalizedScore: 0 },
  'gold': { label: 'neutral', score: 0.90, normalizedScore: 0 },
  'china': { label: 'neutral', score: 0.88, normalizedScore: 0 },
  'europe': { label: 'neutral', score: 0.92, normalizedScore: 0 },
  'emerging markets': { label: 'neutral', score: 0.85, normalizedScore: 0 },
  'technology': { label: 'neutral', score: 0.88, normalizedScore: 0 },
  'ai': { label: 'neutral', score: 0.85, normalizedScore: 0.15 },
  'artificial intelligence': { label: 'neutral', score: 0.85, normalizedScore: 0.15 },
  'valuation': { label: 'neutral', score: 0.90, normalizedScore: 0 },
  'valuations': { label: 'neutral', score: 0.90, normalizedScore: 0 },
  'duration': { label: 'neutral', score: 0.92, normalizedScore: 0 },
  'allocation': { label: 'neutral', score: 0.92, normalizedScore: 0 },
  'portfolio': { label: 'neutral', score: 0.92, normalizedScore: 0 },
  'diversification': { label: 'neutral', score: 0.88, normalizedScore: 0.10 },
  'sector': { label: 'neutral', score: 0.95, normalizedScore: 0 },
  'sectors': { label: 'neutral', score: 0.95, normalizedScore: 0 },
};

// Convert FinBERT output to normalized score
function normalizeScore(output: FinBERTOutput[]): SentimentResult {
  // FinBERT returns array of {label, score} sorted by confidence
  const result = output[0];

  let normalizedScore = 0;
  if (result.label === 'positive') {
    normalizedScore = result.score; // 0 to 1
  } else if (result.label === 'negative') {
    normalizedScore = -result.score; // -1 to 0
  } else {
    normalizedScore = 0; // neutral
  }

  return {
    label: result.label as 'positive' | 'negative' | 'neutral',
    score: result.score,
    normalizedScore,
  };
}

// Get sentiment from dictionary, database cache, or fallback to API
async function analyzeSentiment(text: string): Promise<SentimentResult> {
  const normalizedText = text.toLowerCase().trim();

  // Check in-memory cache first (fastest)
  const cached = sentimentCache.get(normalizedText);
  if (cached) {
    return cached;
  }

  // Check pre-defined dictionary (instant, no API/DB call needed)
  const dictEntry = FINANCIAL_SENTIMENT_DICTIONARY[normalizedText];
  if (dictEntry) {
    sentimentCache.set(normalizedText, dictEntry);
    return dictEntry;
  }

  // Check database cache (persistent across restarts)
  try {
    const dbCached = await prisma.sentimentCache.findUnique({
      where: { term: normalizedText },
    });

    if (dbCached && dbCached.source !== 'default') {
      const result: SentimentResult = {
        label: dbCached.label as 'positive' | 'negative' | 'neutral',
        score: dbCached.score,
        normalizedScore: dbCached.normalizedScore,
      };
      sentimentCache.set(normalizedText, result);
      return result;
    }
  } catch (dbError) {
    console.log('DB cache lookup failed:', dbError);
  }

  // For unknown terms, use FinBERT API with better context
  try {
    // Create complete sentences that FinBERT can analyze properly
    const contextualText = `Analysts are ${normalizedText.includes(' ') ? 'discussing' : 'focused on'} ${text}. The sentiment is`;

    const result = await hf.textClassification({
      model: 'ProsusAI/finbert',
      inputs: contextualText,
    });

    const sentiment = normalizeScore(result as FinBERTOutput[]);

    // Cache the result in memory
    sentimentCache.set(normalizedText, sentiment);

    // Also save to database for persistence
    try {
      await prisma.sentimentCache.upsert({
        where: { term: normalizedText },
        update: {
          label: sentiment.label,
          score: sentiment.score,
          normalizedScore: sentiment.normalizedScore,
          source: 'finbert',
        },
        create: {
          term: normalizedText,
          label: sentiment.label,
          score: sentiment.score,
          normalizedScore: sentiment.normalizedScore,
          source: 'finbert',
        },
      });
    } catch (dbSaveError) {
      console.log('Failed to save sentiment to DB:', dbSaveError);
    }

    return sentiment;
  } catch (error) {
    console.error(`Error analyzing sentiment for "${text}":`, error);
    // Return neutral on error
    return {
      label: 'neutral',
      score: 0.5,
      normalizedScore: 0,
    };
  }
}

// Batch analyze multiple terms
async function batchAnalyzeSentiment(terms: string[]): Promise<Map<string, SentimentResult>> {
  const results = new Map<string, SentimentResult>();

  // Process in batches to avoid rate limiting
  const batchSize = 10;
  const delayBetweenBatches = 100; // ms

  for (let i = 0; i < terms.length; i += batchSize) {
    const batch = terms.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(async (term) => {
        const sentiment = await analyzeSentiment(term);
        return { term, sentiment };
      })
    );

    batchResults.forEach(({ term, sentiment }) => {
      results.set(term, sentiment);
    });

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < terms.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }

  return results;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { terms } = body as { terms: string[] };

    if (!terms || !Array.isArray(terms) || terms.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: terms array required' },
        { status: 400 }
      );
    }

    // Limit to 150 terms max
    const limitedTerms = terms.slice(0, 150);

    const sentimentResults = await batchAnalyzeSentiment(limitedTerms);

    // Convert Map to object for JSON response
    const results: Record<string, SentimentResult> = {};
    sentimentResults.forEach((value, key) => {
      results[key] = value;
    });

    return NextResponse.json({
      results,
      analyzed: limitedTerms.length,
      cached: Array.from(sentimentCache.keys()).length,
    });
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze sentiment' },
      { status: 500 }
    );
  }
}

// GET endpoint to check a single term
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get('term');

  if (!term) {
    return NextResponse.json(
      { error: 'term parameter required' },
      { status: 400 }
    );
  }

  const sentiment = await analyzeSentiment(term);

  return NextResponse.json({
    term,
    sentiment,
  });
}
