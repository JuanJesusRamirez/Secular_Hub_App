import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import natural from 'natural';

const { TfIdf } = natural;

// Python service URL (configurable via env)
const PYTHON_SERVICE_URL = process.env.WORDRAIN_SERVICE_URL || 'http://localhost:8001';

// Stopwords for financial text
const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
  'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they',
  'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
  'year', 'years', 'expect', 'expected', 'outlook', 'view', 'views', 'believe',
  'think', 'see', 'remain', 'continue', 'look', 'looking', 'term', 'near', 'recent',
  'current', 'currently', 'potential', 'likely', 'possible', 'suggest', 'indicate'
]);

const MIN_WORD_LENGTH = 3;

interface WordYearData {
  frequency: number;
  tfidf: number;
  sentiment?: number;
}

interface WordRainWord {
  text: string;
  semanticX: number;
  avgTfidf: number;
  yearData: Record<number, WordYearData>;
}

interface WordRainResponse {
  years: number[];
  words: WordRainWord[];
  serviceStatus: 'connected' | 'fallback';
}

// Extract words from text
function extractWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z\s]/g, ' ')
    .split(/\s+/)
    .filter(word =>
      word.length >= MIN_WORD_LENGTH &&
      !STOPWORDS.has(word) &&
      !/^\d+$/.test(word)
    );
}

// Calculate TF-IDF scores for a year's documents
function calculateTfIdfForYear(documents: string[]): Map<string, number> {
  const tfidf = new TfIdf();
  const termScores = new Map<string, number>();

  documents.forEach(doc => {
    tfidf.addDocument(extractWords(doc).join(' '));
  });

  documents.forEach((_, docIndex) => {
    tfidf.listTerms(docIndex).forEach((item: { term: string; tfidf: number }) => {
      const currentScore = termScores.get(item.term) || 0;
      termScores.set(item.term, currentScore + item.tfidf);
    });
  });

  return termScores;
}

// Get top words across all years
function getTopWordsAcrossYears(
  yearlyData: Map<number, { docs: string[]; tfidf: Map<string, number> }>,
  limit: number
): string[] {
  const wordScores = new Map<string, number>();

  // Sum TF-IDF scores across years
  yearlyData.forEach(({ tfidf }) => {
    tfidf.forEach((score, word) => {
      wordScores.set(word, (wordScores.get(word) || 0) + score);
    });
  });

  // Sort by total score and take top N
  return Array.from(wordScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

// Call Python service for semantic positions
async function getSemanticPositions(words: string[]): Promise<Map<string, number> | null> {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/wordrain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        words,
        // perplexity must be strictly less than n_samples
        perplexity: Math.min(30, Math.max(2, words.length - 1)),
        n_iter: 500
      }),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (!response.ok) {
      console.error('Python service error:', response.status);
      return null;
    }

    const data = await response.json();
    return new Map(Object.entries(data.positions));
  } catch (error) {
    console.error('Failed to connect to Python service:', error);
    return null;
  }
}

// Fallback: Use word hash for positioning when Python service unavailable
function getFallbackPositions(words: string[]): Map<string, number> {
  const positions = new Map<string, number>();

  words.forEach(word => {
    // Simple hash-based positioning
    const hash = word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const position = (hash % 1000) / 1000;
    positions.set(word, position);
  });

  return positions;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  const startYearParam = searchParams.get('startYear');
  const endYearParam = searchParams.get('endYear');

  // Parse parameters (per Uppsala paper: 300 words)
  const limit = Math.min(Math.max(parseInt(limitParam || '300', 10), 20), 300);
  const startYear = startYearParam ? parseInt(startYearParam, 10) : 2019;
  const endYear = endYearParam ? parseInt(endYearParam, 10) : 2026;

  // Get available years
  const yearsRaw = await prisma.outlookCall.groupBy({
    by: ['year'],
    orderBy: { year: 'asc' },
  });
  const availableYears = yearsRaw
    .map(y => y.year)
    .filter(y => y >= startYear && y <= endYear);

  // Fetch documents for each year
  const yearlyData = new Map<number, { docs: string[]; tfidf: Map<string, number> }>();

  for (const year of availableYears) {
    const calls = await prisma.outlookCall.findMany({
      where: { year },
      select: { callText: true },
    });

    const docs = calls.map(c => c.callText || '').filter(t => t.length > 0);
    const tfidf = calculateTfIdfForYear(docs);

    yearlyData.set(year, { docs, tfidf });
  }

  // Get top words across all years
  const topWords = getTopWordsAcrossYears(yearlyData, limit);

  // Get semantic positions from Python service (or fallback)
  let positions = await getSemanticPositions(topWords);
  let serviceStatus: 'connected' | 'fallback' = 'connected';

  if (!positions) {
    positions = getFallbackPositions(topWords);
    serviceStatus = 'fallback';
  }

  // Build response data
  const words: WordRainWord[] = topWords.map(word => {
    const yearData: Record<number, WordYearData> = {};
    let totalTfidf = 0;
    let yearCount = 0;

    availableYears.forEach(year => {
      const data = yearlyData.get(year);
      if (data) {
        const tfidfScore = data.tfidf.get(word) || 0;
        const frequency = data.docs.reduce((count, doc) => {
          const words = extractWords(doc);
          return count + words.filter(w => w === word).length;
        }, 0);

        if (frequency > 0 || tfidfScore > 0) {
          yearData[year] = {
            frequency,
            tfidf: Math.round(tfidfScore * 100) / 100,
          };
          totalTfidf += tfidfScore;
          yearCount++;
        }
      }
    });

    return {
      text: word,
      semanticX: positions!.get(word) || 0.5,
      avgTfidf: yearCount > 0 ? Math.round((totalTfidf / yearCount) * 100) / 100 : 0,
      yearData,
    };
  });

  // Sort by semantic position for display
  words.sort((a, b) => a.semanticX - b.semanticX);

  const response: WordRainResponse = {
    years: availableYears,
    words,
    serviceStatus,
  };

  return NextResponse.json(response);
}
