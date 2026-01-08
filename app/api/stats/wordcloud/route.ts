import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import nlp from 'compromise';
import natural from 'natural';
const { TfIdf } = natural;

// Common English stopwords to exclude
const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
  'shall', 'can', 'need', 'dare', 'ought', 'used', 'it', 'its', 'this', 'that',
  'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'what', 'which', 'who',
  'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 's', 't', 'just', 'don', 'now', 'also', 'into', 'over',
  'after', 'before', 'above', 'below', 'between', 'through', 'during', 'under',
  'again', 'further', 'then', 'once', 'here', 'there', 'any', 'while', 'about',
  'against', 'up', 'down', 'out', 'off', 'if', 'because', 'until', 'although',
  'however', 'therefore', 'thus', 'hence', 'yet', 'still', 'already', 'even',
  'though', 'whether', 'since', 'unless', 'despite', 'rather', 'quite', 'per',
  'their', 'them', 'his', 'her', 'him', 'your', 'our', 'my', 'me', 'us', 'being',
  'having', 'doing', 'going', 'coming', 'getting', 'making', 'taking', 'seeing',
  'think', 'see', 'get', 'make', 'take', 'come', 'go', 'know', 'say', 'said',
  've', 'll', 're', 'd', 'm', 'o', 'y', 'ain', 'aren', 'couldn', 'didn', 'doesn',
  'hadn', 'hasn', 'haven', 'isn', 'ma', 'mightn', 'mustn', 'needn', 'shan', 'shouldn',
  'wasn', 'weren', 'won', 'wouldn', 'well', 'one', 'two', 'like', 'much', 'many',
  'way', 'back', 'first', 'last', 'long', 'new', 'old', 'high', 'low', 'good',
  'bad', 'best', 'worst', 'next', 'part', 'likely', 'given', 'across', 'around',
  // Financial stopwords - common but not insightful
  'year', 'years', 'expect', 'expected', 'expecting', 'outlook', 'view', 'views',
  'believe', 'believes', 'think', 'thinks', 'see', 'sees', 'remain', 'remains',
  'continue', 'continues', 'continued', 'look', 'looking', 'term', 'near', 'recent',
  'recently', 'current', 'currently', 'potential', 'potentially', 'likely', 'unlikely',
  'possible', 'possibly', 'suggest', 'suggests', 'suggesting', 'indicate', 'indicates',
  'including', 'include', 'includes', 'particularly', 'especially', 'significant',
  'significantly', 'relatively', 'overall', 'generally', 'typically', 'essentially'
]);

// Financial phrases to look for (bigrams and trigrams)
const FINANCIAL_PHRASES = new Set([
  'rate cuts', 'rate hikes', 'interest rates', 'federal reserve', 'central bank',
  'central banks', 'soft landing', 'hard landing', 'credit spreads', 'yield curve',
  'quantitative easing', 'quantitative tightening', 'monetary policy', 'fiscal policy',
  'trade war', 'trade tensions', 'emerging markets', 'developed markets',
  'risk assets', 'risk appetite', 'risk aversion', 'bond yields', 'treasury yields',
  'corporate bonds', 'high yield', 'investment grade', 'equity markets', 'stock market',
  'labor market', 'job market', 'real estate', 'supply chain', 'supply chains',
  'economic growth', 'gdp growth', 'inflation expectations', 'price pressures',
  'balance sheet', 'earnings growth', 'profit margins', 'valuations', 'multiple expansion',
  'multiple compression', 'bull market', 'bear market', 'market volatility',
  'dollar strength', 'dollar weakness', 'oil prices', 'energy prices', 'commodity prices',
  'consumer spending', 'consumer confidence', 'business confidence', 'capital expenditure',
  'geopolitical risk', 'geopolitical risks', 'political risk', 'election risk',
  'debt ceiling', 'government shutdown', 'recession risk', 'recession fears',
  'global growth', 'synchronized growth', 'divergent growth', 'stagflation',
  'disinflation', 'deflation', 'reflation', 'taper tantrum', 'pivot'
]);

// Minimum word length to include
const MIN_WORD_LENGTH = 3;

// Default and allowed word limits
const DEFAULT_LIMIT = 100;
const ALLOWED_LIMITS = [50, 100, 150];

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

// Extract phrases (bigrams and trigrams) from text using compromise
function extractPhrases(text: string): string[] {
  const doc = nlp(text.toLowerCase());
  const phrases: string[] = [];

  // Extract noun phrases
  doc.nouns().forEach((noun: { text: () => string }) => {
    const phrase = noun.text().trim();
    if (phrase.split(' ').length >= 2 && phrase.length >= 5) {
      phrases.push(phrase);
    }
  });

  // Extract verb phrases that might be interesting (e.g., "cutting rates")
  doc.verbs().forEach((verb: { text: () => string }) => {
    const phrase = verb.text().trim();
    if (phrase.split(' ').length >= 2 && phrase.length >= 5) {
      phrases.push(phrase);
    }
  });

  // Manual bigram extraction for financial phrases
  const words = text.toLowerCase().replace(/[^a-zA-Z\s]/g, ' ').split(/\s+/);
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    if (FINANCIAL_PHRASES.has(bigram)) {
      phrases.push(bigram);
    }
    // Trigrams
    if (i < words.length - 2) {
      const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      if (FINANCIAL_PHRASES.has(trigram)) {
        phrases.push(trigram);
      }
    }
  }

  return phrases.filter(p =>
    p.length >= 5 &&
    !STOPWORDS.has(p) &&
    p.split(' ').every(w => !STOPWORDS.has(w) || FINANCIAL_PHRASES.has(p))
  );
}

// Calculate TF-IDF scores for terms across documents
function calculateTfIdf(documents: string[], mode: 'words' | 'phrases'): Map<string, number> {
  const tfidf = new TfIdf();
  const termScores = new Map<string, number>();

  // Add each document to TF-IDF
  documents.forEach(doc => {
    if (mode === 'words') {
      tfidf.addDocument(extractWords(doc).join(' '));
    } else {
      tfidf.addDocument(extractPhrases(doc).join(' '));
    }
  });

  // Calculate aggregate TF-IDF scores across all documents
  documents.forEach((_, docIndex) => {
    tfidf.listTerms(docIndex).forEach((item: { term: string; tfidf: number }) => {
      const currentScore = termScores.get(item.term) || 0;
      termScores.set(item.term, currentScore + item.tfidf);
    });
  });

  return termScores;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get('year');
  const limitParam = searchParams.get('limit');
  const modeParam = searchParams.get('mode') || 'words'; // 'words' or 'phrases'
  const scoringParam = searchParams.get('scoring') || 'frequency'; // 'frequency' or 'importance'
  const skipCache = searchParams.get('skipCache') === 'true';

  // Parse year filter
  const year = yearParam ? parseInt(yearParam, 10) : null;

  // Parse limit (only allow 50, 100, or 150)
  const requestedLimit = limitParam ? parseInt(limitParam, 10) : DEFAULT_LIMIT;
  const limit = ALLOWED_LIMITS.includes(requestedLimit) ? requestedLimit : DEFAULT_LIMIT;

  // Validate mode and scoring
  const mode = modeParam === 'phrases' ? 'phrases' : 'words';
  const scoring = scoringParam === 'importance' ? 'importance' : 'frequency';

  // Try to get from cache first (unless skipCache is true)
  if (!skipCache) {
    try {
      const cached = await prisma.wordCloudCache.findUnique({
        where: {
          year_mode_scoring_wordLimit: {
            year: year || 0,
            mode,
            scoring,
            wordLimit: limit,
          },
        },
      });

      if (cached) {
        // Get available years
        const yearsRaw = await prisma.outlookCall.groupBy({
          by: ['year'],
          orderBy: { year: 'desc' },
        });
        const availableYears = yearsRaw.map(y => y.year);

        const words = JSON.parse(cached.data);

        return NextResponse.json({
          year: year || 'all',
          limit,
          mode,
          scoring,
          wordCount: words.length,
          totalDocuments: cached.totalDocs,
          uniqueInstitutions: cached.uniqueInst,
          words,
          availableYears,
          cached: true,
          cachedAt: cached.updatedAt,
        });
      }
    } catch (cacheError) {
      console.log('Cache miss or error, computing fresh data:', cacheError);
    }
  }

  // No cache hit - compute fresh data
  // Build query filter
  const where = year ? { year } : {};

  // Fetch all callText for the specified year(s)
  const calls = await prisma.outlookCall.findMany({
    where,
    select: { callText: true },
  });

  let sortedWords: { text: string; value: number }[];

  if (scoring === 'importance') {
    // Use TF-IDF scoring
    const documents = calls.map(c => c.callText || '').filter(t => t.length > 0);
    const tfIdfScores = calculateTfIdf(documents, mode);

    sortedWords = Array.from(tfIdfScores.entries())
      .filter(([term]) => {
        if (mode === 'words') {
          return term.length >= MIN_WORD_LENGTH && !STOPWORDS.has(term);
        }
        return term.length >= 5;
      })
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([text, value]) => ({ text, value: Math.round(value * 100) / 100 }));
  } else {
    // Use frequency counting
    const termCounts = new Map<string, number>();

    calls.forEach(call => {
      if (!call.callText) return;

      const terms = mode === 'words'
        ? extractWords(call.callText)
        : extractPhrases(call.callText);

      terms.forEach(term => {
        termCounts.set(term, (termCounts.get(term) || 0) + 1);
      });
    });

    sortedWords = Array.from(termCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([text, value]) => ({ text, value }));
  }

  // Get available years and unique institutions count
  const [yearsRaw, institutionsRaw] = await Promise.all([
    prisma.outlookCall.groupBy({
      by: ['year'],
      orderBy: { year: 'desc' },
    }),
    prisma.outlookCall.groupBy({
      by: ['institutionCanonical'],
      where,
    }),
  ]);

  const availableYears = yearsRaw.map(y => y.year);
  const uniqueInstitutions = institutionsRaw.length;

  // Save to cache for next time
  try {
    await prisma.wordCloudCache.upsert({
      where: {
        year_mode_scoring_wordLimit: {
          year: year || 0,
          mode,
          scoring,
          wordLimit: limit,
        },
      },
      update: {
        data: JSON.stringify(sortedWords),
        totalDocs: calls.length,
        uniqueInst: uniqueInstitutions,
      },
      create: {
        year: year || 0,
        mode,
        scoring,
        wordLimit: limit,
        data: JSON.stringify(sortedWords),
        totalDocs: calls.length,
        uniqueInst: uniqueInstitutions,
      },
    });
  } catch (cacheError) {
    console.log('Failed to save to cache:', cacheError);
  }

  return NextResponse.json({
    year: year || 'all',
    limit,
    mode,
    scoring,
    wordCount: sortedWords.length,
    totalDocuments: calls.length,
    uniqueInstitutions,
    words: sortedWords,
    availableYears,
    cached: false,
  });
}
