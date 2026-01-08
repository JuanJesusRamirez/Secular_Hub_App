/**
 * Pre-populate Word Cloud and Sentiment Cache
 *
 * This script generates all possible word cloud combinations and caches them
 * in the database for instant loading. It also pre-populates sentiment analysis
 * for all terms using the financial dictionary.
 *
 * Run with: npx ts-node scripts/populate-wordcloud-cache.ts
 */

import { PrismaClient } from '@prisma/client';
import nlp from 'compromise';
import natural from 'natural';

const { TfIdf } = natural;
const prisma = new PrismaClient();

// Copy of constants from wordcloud API
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
  'year', 'years', 'expect', 'expected', 'expecting', 'outlook', 'view', 'views',
  'believe', 'believes', 'think', 'thinks', 'see', 'sees', 'remain', 'remains',
  'continue', 'continues', 'continued', 'look', 'looking', 'term', 'near', 'recent',
  'recently', 'current', 'currently', 'potential', 'potentially', 'likely', 'unlikely',
  'possible', 'possibly', 'suggest', 'suggests', 'suggesting', 'indicate', 'indicates',
  'including', 'include', 'includes', 'particularly', 'especially', 'significant',
  'significantly', 'relatively', 'overall', 'generally', 'typically', 'essentially'
]);

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

// Sentiment dictionary (copy from sentiment route)
const FINANCIAL_SENTIMENT_DICTIONARY: Record<string, { label: string; score: number; normalizedScore: number }> = {
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

const MIN_WORD_LENGTH = 3;
const ALLOWED_LIMITS = [50, 100, 150];

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

function extractPhrases(text: string): string[] {
  const doc = nlp(text.toLowerCase());
  const phrases: string[] = [];

  doc.nouns().forEach((noun: { text: () => string }) => {
    const phrase = noun.text().trim();
    if (phrase.split(' ').length >= 2 && phrase.length >= 5) {
      phrases.push(phrase);
    }
  });

  doc.verbs().forEach((verb: { text: () => string }) => {
    const phrase = verb.text().trim();
    if (phrase.split(' ').length >= 2 && phrase.length >= 5) {
      phrases.push(phrase);
    }
  });

  const words = text.toLowerCase().replace(/[^a-zA-Z\s]/g, ' ').split(/\s+/);
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    if (FINANCIAL_PHRASES.has(bigram)) {
      phrases.push(bigram);
    }
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

function calculateTfIdf(documents: string[], mode: 'words' | 'phrases'): Map<string, number> {
  const tfidf = new TfIdf();
  const termScores = new Map<string, number>();

  documents.forEach(doc => {
    if (mode === 'words') {
      tfidf.addDocument(extractWords(doc).join(' '));
    } else {
      tfidf.addDocument(extractPhrases(doc).join(' '));
    }
  });

  documents.forEach((_, docIndex) => {
    tfidf.listTerms(docIndex).forEach((item: { term: string; tfidf: number }) => {
      const currentScore = termScores.get(item.term) || 0;
      termScores.set(item.term, currentScore + item.tfidf);
    });
  });

  return termScores;
}

async function generateWordCloud(
  year: number | null,
  mode: 'words' | 'phrases',
  scoring: 'frequency' | 'importance',
  limit: number
): Promise<{
  words: { text: string; value: number }[];
  totalDocs: number;
  uniqueInst: number;
}> {
  const where = year ? { year } : {};

  const calls = await prisma.outlookCall.findMany({
    where,
    select: { callText: true },
  });

  let sortedWords: { text: string; value: number }[];

  if (scoring === 'importance') {
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

  const institutionsRaw = await prisma.outlookCall.groupBy({
    by: ['institutionCanonical'],
    where,
  });

  return {
    words: sortedWords,
    totalDocs: calls.length,
    uniqueInst: institutionsRaw.length,
  };
}

async function main() {
  console.log('=== Word Cloud Cache Population Script ===\n');

  // Get available years
  const yearsRaw = await prisma.outlookCall.groupBy({
    by: ['year'],
    orderBy: { year: 'desc' },
  });
  const availableYears = yearsRaw.map(y => y.year);
  console.log(`Found years: ${availableYears.join(', ')}\n`);

  // All combinations: years (including "all"), modes, scoring methods, limits
  const yearOptions = [0, ...availableYears]; // 0 = all years
  const modes: ('words' | 'phrases')[] = ['words', 'phrases'];
  const scorings: ('frequency' | 'importance')[] = ['frequency', 'importance'];

  const totalCombinations = yearOptions.length * modes.length * scorings.length * ALLOWED_LIMITS.length;
  console.log(`Generating ${totalCombinations} word cloud combinations...\n`);

  let count = 0;
  const allTerms = new Set<string>();

  // Clear existing cache
  await prisma.wordCloudCache.deleteMany({});
  console.log('Cleared existing word cloud cache.\n');

  for (const year of yearOptions) {
    for (const mode of modes) {
      for (const scoring of scorings) {
        for (const limit of ALLOWED_LIMITS) {
          count++;
          const yearLabel = year === 0 ? 'all' : year;
          console.log(`[${count}/${totalCombinations}] Generating: year=${yearLabel}, mode=${mode}, scoring=${scoring}, limit=${limit}`);

          const result = await generateWordCloud(
            year === 0 ? null : year,
            mode,
            scoring,
            limit
          );

          // Collect all terms for sentiment cache
          result.words.forEach(w => allTerms.add(w.text.toLowerCase()));

          // Store in database
          await prisma.wordCloudCache.create({
            data: {
              year,
              mode,
              scoring,
              wordLimit: limit,
              data: JSON.stringify(result.words),
              totalDocs: result.totalDocs,
              uniqueInst: result.uniqueInst,
            },
          });
        }
      }
    }
  }

  console.log(`\nWord cloud cache populated with ${count} entries.\n`);

  // Now populate sentiment cache
  console.log('=== Populating Sentiment Cache ===\n');
  console.log(`Found ${allTerms.size} unique terms across all word clouds.\n`);

  // Clear existing sentiment cache
  await prisma.sentimentCache.deleteMany({});
  console.log('Cleared existing sentiment cache.\n');

  // Insert all dictionary entries
  const dictionaryEntries = Object.entries(FINANCIAL_SENTIMENT_DICTIONARY);
  console.log(`Pre-loading ${dictionaryEntries.length} dictionary entries...\n`);

  for (const [term, sentiment] of dictionaryEntries) {
    await prisma.sentimentCache.upsert({
      where: { term },
      update: {
        label: sentiment.label,
        score: sentiment.score,
        normalizedScore: sentiment.normalizedScore,
        source: 'dictionary',
      },
      create: {
        term,
        label: sentiment.label,
        score: sentiment.score,
        normalizedScore: sentiment.normalizedScore,
        source: 'dictionary',
      },
    });
  }

  // For terms not in dictionary, add as neutral (API will override later if needed)
  let neutralCount = 0;
  for (const term of allTerms) {
    if (!FINANCIAL_SENTIMENT_DICTIONARY[term]) {
      try {
        await prisma.sentimentCache.create({
          data: {
            term,
            label: 'neutral',
            score: 0.5,
            normalizedScore: 0,
            source: 'default',
          },
        });
        neutralCount++;
      } catch {
        // Term might already exist
      }
    }
  }

  console.log(`Added ${neutralCount} default neutral entries for unknown terms.\n`);

  const totalSentiment = await prisma.sentimentCache.count();
  console.log(`\nSentiment cache populated with ${totalSentiment} entries.\n`);

  console.log('=== Cache Population Complete ===');
  console.log(`- Word cloud entries: ${count}`);
  console.log(`- Sentiment entries: ${totalSentiment}`);
  console.log('\nThe Word Cloud page should now load instantly!');

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('Error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
