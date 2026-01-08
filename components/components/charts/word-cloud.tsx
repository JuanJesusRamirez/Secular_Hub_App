"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Wordcloud from '@visx/wordcloud/lib/Wordcloud';
import { Text } from '@visx/text';
import { scaleLog } from '@visx/scale';

export interface WordData {
  text: string;
  value: number;
}

export interface SentimentData {
  [word: string]: number; // -1 (bearish) to 1 (bullish)
}

interface WordCloudProps {
  words: WordData[];
  width?: number;
  height?: number;
  title?: string;
  onWordClick?: (word: string) => void;
  className?: string;
  sentimentData?: SentimentData;
  showSentiment?: boolean;
}

// Sentiment-based colors
const SENTIMENT_COLORS = {
  bullish: '#22c55e',   // green-500
  neutral: '#64748b',   // slate-500
  bearish: '#ef4444',   // red-500
};

// Financial-themed color palette (fallback when no sentiment)
const COLORS = [
  '#22c55e', // green-500 (growth)
  '#3b82f6', // blue-500 (policy)
  '#8b5cf6', // violet-500 (monetary)
  '#f97316', // orange-500 (inflation)
  '#06b6d4', // cyan-500 (rates)
  '#ec4899', // pink-500 (markets)
  '#eab308', // yellow-500 (slowdown)
  '#14b8a6', // teal-500 (pivot)
  '#6366f1', // indigo-500 (fiscal)
  '#ef4444', // red-500 (risk)
];

// Words that should have specific colors based on their meaning (fallback)
const SEMANTIC_COLORS: Record<string, string> = {
  growth: '#22c55e',
  inflation: '#f97316',
  rates: '#3b82f6',
  recession: '#ef4444',
  risk: '#ef4444',
  risks: '#ef4444',
  policy: '#8b5cf6',
  fed: '#6366f1',
  market: '#06b6d4',
  markets: '#06b6d4',
  bonds: '#14b8a6',
  stocks: '#22c55e',
  equities: '#22c55e',
  yields: '#eab308',
  dollar: '#3b82f6',
  credit: '#8b5cf6',
  global: '#06b6d4',
  economic: '#14b8a6',
  central: '#6366f1',
  bank: '#6366f1',
  banks: '#6366f1',
  china: '#ef4444',
  europe: '#3b82f6',
  emerging: '#22c55e',
  volatility: '#f97316',
  tariffs: '#ef4444',
  trade: '#eab308',
  earnings: '#22c55e',
  valuations: '#8b5cf6',
};

function getWordColor(
  word: string,
  sentimentData?: SentimentData,
  showSentiment?: boolean
): string {
  const lowerWord = word.toLowerCase();

  // Use sentiment-based colors if available
  if (showSentiment && sentimentData && sentimentData[lowerWord] !== undefined) {
    const sentiment = sentimentData[lowerWord];
    if (sentiment > 0.3) return SENTIMENT_COLORS.bullish;
    if (sentiment < -0.3) return SENTIMENT_COLORS.bearish;
    return SENTIMENT_COLORS.neutral;
  }

  // Fallback to semantic colors
  if (SEMANTIC_COLORS[lowerWord]) {
    return SEMANTIC_COLORS[lowerWord];
  }

  // Use consistent color based on word hash
  const hash = lowerWord.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
}

function getRotation(): number {
  // Most words horizontal, some at slight angles
  const rotations = [0, 0, 0, 0, -15, 15];
  return rotations[Math.floor(Math.random() * rotations.length)];
}

export function WordCloud({
  words,
  width = 800,
  height = 500,
  title,
  onWordClick,
  className,
  sentimentData,
  showSentiment = false
}: WordCloudProps) {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);

  // Calculate font size scale based on word frequencies
  const fontScale = useMemo(() => {
    if (words.length === 0) return () => 16;

    const values = words.map(w => w.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    return scaleLog({
      domain: [Math.max(minValue, 1), Math.max(maxValue, minValue + 1)],
      range: [14, 72],
    });
  }, [words]);

  const fontSizeSetter = (datum: WordData) => fontScale(datum.value);

  // Get sentiment info for tooltip
  const getSentimentLabel = (word: string): string | null => {
    if (!showSentiment || !sentimentData) return null;
    const sentiment = sentimentData[word.toLowerCase()];
    if (sentiment === undefined) return null;
    if (sentiment > 0.3) return 'bullish';
    if (sentiment < -0.3) return 'bearish';
    return 'neutral';
  };

  if (words.length === 0) {
    return (
      <Card className={cn("flex flex-col", className)}>
        {title && (
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent className="flex-1 flex items-center justify-center min-h-[300px]">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("flex flex-col", className)}>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="flex-1 flex items-center justify-center p-4">
        <svg width={width} height={height}>
          <Wordcloud
            words={words}
            width={width}
            height={height}
            fontSize={fontSizeSetter}
            font="Inter, system-ui, sans-serif"
            fontWeight={600}
            padding={2}
            spiral="archimedean"
            rotate={getRotation}
            random={() => 0.5}
          >
            {(cloudWords) =>
              cloudWords.map((w, i) => {
                const isHovered = hoveredWord === w.text;
                const color = getWordColor(w.text || '', sentimentData, showSentiment);

                return (
                  <Text
                    key={`${w.text}-${i}`}
                    fill={color}
                    textAnchor="middle"
                    transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
                    fontSize={w.size}
                    fontFamily={w.font}
                    fontWeight={w.weight}
                    style={{
                      cursor: onWordClick ? 'pointer' : 'default',
                      opacity: hoveredWord && !isHovered ? 0.3 : 1,
                      transition: 'opacity 200ms ease',
                    }}
                    onMouseEnter={() => setHoveredWord(w.text || null)}
                    onMouseLeave={() => setHoveredWord(null)}
                    onClick={() => w.text && onWordClick?.(w.text)}
                  >
                    {w.text}
                  </Text>
                );
              })
            }
          </Wordcloud>
        </svg>

        {/* Tooltip */}
        {hoveredWord && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-3 py-1.5 rounded-md shadow-lg border text-sm">
            <span className="font-semibold">{hoveredWord}</span>
            <span className="text-muted-foreground ml-2">
              ({words.find(w => w.text === hoveredWord)?.value || 0}{' '}
              {typeof words[0]?.value === 'number' && words[0]?.value % 1 !== 0 ? 'score' : 'mentions'})
            </span>
            {showSentiment && getSentimentLabel(hoveredWord) && (
              <span className={cn(
                "ml-2 px-1.5 py-0.5 rounded text-xs font-medium",
                getSentimentLabel(hoveredWord) === 'bullish' && "bg-green-100 text-green-700",
                getSentimentLabel(hoveredWord) === 'bearish' && "bg-red-100 text-red-700",
                getSentimentLabel(hoveredWord) === 'neutral' && "bg-slate-100 text-slate-700"
              )}>
                {getSentimentLabel(hoveredWord)}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
