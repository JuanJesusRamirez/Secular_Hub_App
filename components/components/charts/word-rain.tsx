"use client";

import { useMemo, useState } from 'react';
import { scaleLinear, scaleBand, scaleLog } from '@visx/scale';
import { Text } from '@visx/text';
import { cn } from "@/lib/utils";

interface WordYearData {
  frequency: number;
  tfidf: number;
  sentiment?: number;
}

export interface WordRainWord {
  text: string;
  semanticX: number;
  avgTfidf: number;
  yearData: Record<number, WordYearData>;
}

interface WordRainChartProps {
  words: WordRainWord[];
  years: number[];
  width?: number;
  height?: number;
  onWordClick?: (word: string) => void;
  sentimentData?: Record<string, number>;
  showConnections?: boolean;
}

// Sentiment-based colors
const SENTIMENT_COLORS = {
  bullish: '#22c55e',   // green-500
  neutral: '#64748b',   // slate-500
  bearish: '#ef4444',   // red-500
};

// Get color based on sentiment
function getWordColor(word: string, sentimentData?: Record<string, number>): string {
  if (sentimentData && sentimentData[word] !== undefined) {
    const sentiment = sentimentData[word];
    if (sentiment > 0.3) return SENTIMENT_COLORS.bullish;
    if (sentiment < -0.3) return SENTIMENT_COLORS.bearish;
  }
  return SENTIMENT_COLORS.neutral;
}

// Era backgrounds for context
const ERA_BACKGROUNDS = [
  { start: 2019, end: 2019, label: 'Trade War', color: 'rgba(239, 68, 68, 0.05)' },
  { start: 2020, end: 2021, label: 'COVID', color: 'rgba(168, 85, 247, 0.05)' },
  { start: 2022, end: 2023, label: 'Inflation Crisis', color: 'rgba(249, 115, 22, 0.05)' },
  { start: 2024, end: 2026, label: 'AI & Normalization', color: 'rgba(34, 197, 94, 0.05)' },
];

export function WordRainChart({
  words,
  years,
  width = 900,
  height = 600,
  onWordClick,
  sentimentData,
  showConnections = true,
}: WordRainChartProps) {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);

  // Chart margins
  const margin = { top: 40, right: 40, bottom: 60, left: 80 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Scales
  const xScale = useMemo(() =>
    scaleLinear({
      domain: [0, 1],
      range: [0, innerWidth],
    }), [innerWidth]);

  const yScale = useMemo(() =>
    scaleBand({
      domain: years.map(String),
      range: [0, innerHeight],
      padding: 0.2,
    }), [years, innerHeight]);

  // Size scale based on TF-IDF
  const sizeScale = useMemo(() => {
    const allTfidf = words.flatMap(w =>
      Object.values(w.yearData).map(d => d.tfidf)
    ).filter(v => v > 0);

    const minTfidf = Math.min(...allTfidf, 1);
    const maxTfidf = Math.max(...allTfidf, 10);

    return scaleLog({
      domain: [Math.max(minTfidf, 0.1), maxTfidf],
      range: [4, 16],
    });
  }, [words]);

  // Find year with max TF-IDF for each word (for connection lines)
  const wordPeakYears = useMemo(() => {
    const peaks = new Map<string, number>();
    words.forEach(word => {
      let maxTfidf = 0;
      let peakYear = years[0];
      Object.entries(word.yearData).forEach(([year, data]) => {
        if (data.tfidf > maxTfidf) {
          maxTfidf = data.tfidf;
          peakYear = parseInt(year);
        }
      });
      peaks.set(word.text, peakYear);
    });
    return peaks;
  }, [words, years]);

  if (words.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <div className="relative">
      <svg width={width} height={height}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Era backgrounds */}
          {ERA_BACKGROUNDS.map((era, i) => {
            const startY = yScale(String(era.start));
            const endY = yScale(String(Math.min(era.end, years[years.length - 1])));
            if (startY === undefined || endY === undefined) return null;

            const bandHeight = yScale.bandwidth();
            const y = startY;
            const h = endY - startY + bandHeight;

            return (
              <g key={i}>
                <rect
                  x={0}
                  y={y}
                  width={innerWidth}
                  height={h}
                  fill={era.color}
                />
                <text
                  x={innerWidth - 8}
                  y={y + 16}
                  textAnchor="end"
                  className="fill-muted-foreground/40 text-[10px] font-medium"
                >
                  {era.label}
                </text>
              </g>
            );
          })}

          {/* Horizontal grid lines for years */}
          {years.map((year) => {
            const y = yScale(String(year));
            if (y === undefined) return null;
            return (
              <g key={year}>
                <line
                  x1={0}
                  x2={innerWidth}
                  y1={y + yScale.bandwidth() / 2}
                  y2={y + yScale.bandwidth() / 2}
                  stroke="currentColor"
                  strokeOpacity={0.1}
                />
                {/* Year label */}
                <text
                  x={-12}
                  y={y + yScale.bandwidth() / 2}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-muted-foreground text-xs font-medium"
                >
                  {year}
                </text>
              </g>
            );
          })}

          {/* Semantic axis label */}
          <text
            x={innerWidth / 2}
            y={-20}
            textAnchor="middle"
            className="fill-muted-foreground text-xs"
          >
            ← Macro/Policy ─────── Semantic Axis ─────── Markets/Risk →
          </text>

          {/* Connection lines between years for same word */}
          {showConnections && words.map((word) => {
            const yearsWithData = years.filter(y => word.yearData[y]?.tfidf > 0);
            if (yearsWithData.length < 2) return null;

            const isHovered = hoveredWord === word.text;
            const color = getWordColor(word.text, sentimentData);

            return (
              <g key={`line-${word.text}`}>
                {yearsWithData.slice(0, -1).map((year, i) => {
                  const nextYear = yearsWithData[i + 1];
                  const y1 = yScale(String(year));
                  const y2 = yScale(String(nextYear));
                  if (y1 === undefined || y2 === undefined) return null;

                  const x = xScale(word.semanticX);

                  return (
                    <line
                      key={`${word.text}-${year}-${nextYear}`}
                      x1={x}
                      y1={y1 + yScale.bandwidth() / 2}
                      x2={x}
                      y2={y2 + yScale.bandwidth() / 2}
                      stroke={color}
                      strokeWidth={isHovered ? 2 : 1}
                      strokeOpacity={hoveredWord && !isHovered ? 0.1 : 0.3}
                      strokeDasharray="4,4"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Word circles for each year */}
          {words.map((word) => {
            const isHovered = hoveredWord === word.text;
            const color = getWordColor(word.text, sentimentData);
            const peakYear = wordPeakYears.get(word.text);

            return years.map((year) => {
              const data = word.yearData[year];
              if (!data || data.tfidf <= 0) return null;

              const y = yScale(String(year));
              if (y === undefined) return null;

              const x = xScale(word.semanticX);
              const radius = sizeScale(Math.max(data.tfidf, 0.1));
              const isPeak = year === peakYear;

              return (
                <g
                  key={`${word.text}-${year}`}
                  onMouseEnter={() => setHoveredWord(word.text)}
                  onMouseLeave={() => setHoveredWord(null)}
                  onClick={() => onWordClick?.(word.text)}
                  style={{ cursor: onWordClick ? 'pointer' : 'default' }}
                >
                  {/* Circle */}
                  <circle
                    cx={x}
                    cy={y + yScale.bandwidth() / 2}
                    r={isHovered ? radius * 1.3 : radius}
                    fill={color}
                    fillOpacity={hoveredWord && !isHovered ? 0.2 : isPeak ? 0.9 : 0.6}
                    stroke={isPeak ? color : 'none'}
                    strokeWidth={isPeak ? 2 : 0}
                    className="transition-all duration-200"
                  />

                  {/* Word label (shown on hover or for large circles) */}
                  {(isHovered || (isPeak && radius > 10)) && (
                    <Text
                      x={x}
                      y={y + yScale.bandwidth() / 2 - radius - 6}
                      textAnchor="middle"
                      fontSize={isHovered ? 12 : 10}
                      fontWeight={600}
                      fill={color}
                      className="pointer-events-none"
                    >
                      {word.text}
                    </Text>
                  )}
                </g>
              );
            });
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredWord && (
        <div className="absolute top-4 right-4 bg-popover text-popover-foreground px-4 py-3 rounded-lg shadow-lg border text-sm max-w-[250px]">
          <div className="font-semibold text-base mb-2">{hoveredWord}</div>
          <div className="space-y-1 text-xs">
            {years.map(year => {
              const word = words.find(w => w.text === hoveredWord);
              const data = word?.yearData[year];
              if (!data || data.tfidf <= 0) return null;

              return (
                <div key={year} className="flex justify-between gap-4">
                  <span className="text-muted-foreground">{year}:</span>
                  <span>TF-IDF {data.tfidf.toFixed(1)}, {data.frequency} mentions</span>
                </div>
              );
            })}
          </div>
          {sentimentData && sentimentData[hoveredWord] !== undefined && (
            <div className={cn(
              "mt-2 pt-2 border-t text-xs font-medium",
              sentimentData[hoveredWord] > 0.3 && "text-green-600",
              sentimentData[hoveredWord] < -0.3 && "text-red-600",
              Math.abs(sentimentData[hoveredWord]) <= 0.3 && "text-slate-500"
            )}>
              Sentiment: {sentimentData[hoveredWord] > 0.3 ? 'Bullish' :
                sentimentData[hoveredWord] < -0.3 ? 'Bearish' : 'Neutral'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
