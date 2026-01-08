"use client";

import { useMemo, useState } from 'react';

interface WordData {
  text: string;
  semanticX: number;  // 0-1 from t-SNE
  tfidf: number;
}

interface PlacedWord {
  text: string;
  x: number;
  y: number;
  barTop: number;
  fontSize: number;
  color: string;
}

// Get color based on semantic position (blue -> cyan -> magenta gradient)
function getSemanticColor(x: number): string {
  if (x < 0.33) {
    // Blue to cyan
    const t = x / 0.33;
    const r = Math.round(80 + t * 40);
    const g = Math.round(140 + t * 80);
    const b = Math.round(200 - t * 30);
    return `rgb(${r}, ${g}, ${b})`;
  } else if (x < 0.66) {
    // Cyan to light green/teal
    const t = (x - 0.33) / 0.33;
    const r = Math.round(120 + t * 30);
    const g = Math.round(220 - t * 40);
    const b = Math.round(170 - t * 50);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Teal to magenta/pink
    const t = (x - 0.66) / 0.34;
    const r = Math.round(150 + t * 100);
    const g = Math.round(180 - t * 80);
    const b = Math.round(120 + t * 135);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

// Place words following the Word Rain algorithm with clear zone separation
function placeWords(
  words: WordData[],
  width: number,
  height: number,
  maxTfidf: number
): PlacedWord[] {
  // Zone definitions (following the paper - bar_ratio = 1/3)
  const titleHeight = 40;           // Zone a: title
  const barZoneHeight = height * 0.33; // Zone b: bars only (top 33%)
  const wordZoneStart = titleHeight + barZoneHeight; // Zone c starts here
  const wordZoneHeight = height - wordZoneStart - 20; // Zones c+d: words

  const margin = { left: 35, right: 35 };
  const innerWidth = width - margin.left - margin.right;

  // Sort by TF-IDF descending (most important first)
  const sortedWords = [...words].sort((a, b) => b.tfidf - a.tfidf);

  const placedWords: PlacedWord[] = [];
  const occupiedRects: { x1: number; y1: number; x2: number; y2: number }[] = [];

  // Font size range (per Uppsala paper: base 16, range 6-32)
  const minFontSize = 6;
  const maxFontSize = Math.min(32, width / 30);

  for (const word of sortedWords) {
    // Normalize TF-IDF using log scale
    const logTfidf = Math.log(word.tfidf + 1);
    const logMax = Math.log(maxTfidf + 1);
    const normalizedTfidf = logTfidf / logMax;

    // Font size based on TF-IDF
    const fontSize = minFontSize + normalizedTfidf * (maxFontSize - minFontSize);

    // Estimate text dimensions
    const charWidth = fontSize * 0.52;
    const textWidth = word.text.length * charWidth;
    const textHeight = fontSize * 1.15;

    // X position from semantic axis
    let x = margin.left + word.semanticX * innerWidth;
    x = Math.max(margin.left + textWidth / 2 + 5, Math.min(width - margin.right - textWidth / 2 - 5, x));

    // Y position: words start in zone c, cascade into zone d
    // Higher TF-IDF = starts higher (closer to zone c top)
    // Lower TF-IDF = starts lower (deeper into zone d)
    const yRange = wordZoneHeight * 0.85;
    let baseY = wordZoneStart + (1 - normalizedTfidf) * yRange;
    let y = baseY;

    // Bar extends from word UP into zone b
    // Higher TF-IDF = taller bar (reaches higher into zone b)
    const barTopMin = titleHeight + 10; // Top of zone b
    const barTopMax = wordZoneStart - 5; // Bottom of zone b
    const barTop = barTopMin + (1 - normalizedTfidf) * (barTopMax - barTopMin);

    // Collision detection
    let attempts = 0;
    const maxAttempts = 60;
    const padding = 6;

    while (attempts < maxAttempts) {
      const rect = {
        x1: x - textWidth / 2 - padding,
        y1: y - padding,
        x2: x + textWidth / 2 + padding,
        y2: y + textHeight + padding
      };

      const hasCollision = occupiedRects.some(occupied =>
        rect.x1 < occupied.x2 &&
        rect.x2 > occupied.x1 &&
        rect.y1 < occupied.y2 &&
        rect.y2 > occupied.y1
      );

      if (!hasCollision) {
        break;
      }

      // Move down
      y += textHeight * 0.7;

      // If too far down, try shifting X
      if (y > height - 30 - textHeight) {
        y = baseY + Math.random() * textHeight * 0.5;
        x += (Math.random() > 0.5 ? 1 : -1) * textWidth * 0.4;
        x = Math.max(margin.left + textWidth / 2 + 5, Math.min(width - margin.right - textWidth / 2 - 5, x));
      }

      attempts++;
    }

    // Skip if couldn't place
    if (attempts >= maxAttempts || y > height - 25 - textHeight) {
      continue;
    }

    const color = getSemanticColor(word.semanticX);

    placedWords.push({
      text: word.text,
      x,
      y,
      barTop,
      fontSize,
      color
    });

    occupiedRects.push({
      x1: x - textWidth / 2 - padding / 2,
      y1: y - padding / 2,
      x2: x + textWidth / 2 + padding / 2,
      y2: y + textHeight + padding / 2
    });
  }

  return placedWords;
}

// Single Word Rain panel
function WordRainPanel({
  words,
  width,
  height,
  title
}: {
  words: WordData[];
  width: number;
  height: number;
  title?: string;
}) {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);

  const maxTfidf = useMemo(() => {
    return Math.max(...words.map(w => w.tfidf), 1);
  }, [words]);

  const placedWords = useMemo(() =>
    placeWords(words, width, height, maxTfidf),
    [words, width, height, maxTfidf]
  );

  // Zone boundaries for visual reference
  const titleHeight = 40;
  const barZoneHeight = height * 0.22;
  const wordZoneStart = titleHeight + barZoneHeight;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Background */}
      <rect x={0} y={0} width={width} height={height} fill="white" />

      {/* Zone b/c separator line (subtle) */}
      <line
        x1={30}
        x2={width - 30}
        y1={wordZoneStart}
        y2={wordZoneStart}
        stroke="#e2e8f0"
        strokeWidth={1}
        strokeDasharray="4,4"
        opacity={0.5}
      />

      {/* Title (Zone a) */}
      {title && (
        <text
          x={width / 2}
          y={26}
          textAnchor="middle"
          fontSize={15}
          fontWeight={600}
          fill="#1e293b"
        >
          {title}
        </text>
      )}

      {/* Bars first (Zone b) - drawn behind words */}
      {placedWords.map((word, i) => {
        const isHovered = hoveredWord === word.text;
        const dimmed = hoveredWord && !isHovered;

        return (
          <g key={`bar-${word.text}-${i}`} opacity={dimmed ? 0.2 : 1}>
            {/* Vertical bar from word UP into zone b */}
            <line
              x1={word.x}
              x2={word.x}
              y1={word.y + 2}
              y2={word.barTop}
              stroke={word.color}
              strokeWidth={isHovered ? 1.2 : 0.8}
              strokeOpacity={0.65}
            />
            {/* Circle at top of bar */}
            <circle
              cx={word.x}
              cy={word.barTop}
              r={isHovered ? 2.5 : 1.5}
              fill={word.color}
              fillOpacity={0.85}
            />
          </g>
        );
      })}

      {/* Words (Zones c/d) */}
      {placedWords.map((word, i) => {
        const isHovered = hoveredWord === word.text;
        const dimmed = hoveredWord && !isHovered;

        return (
          <text
            key={`word-${word.text}-${i}`}
            x={word.x}
            y={word.y + word.fontSize * 0.85}
            textAnchor="middle"
            fontSize={word.fontSize}
            fontWeight={isHovered ? 600 : 400}
            fill={word.color}
            opacity={dimmed ? 0.2 : 1}
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif', cursor: 'pointer' }}
            onMouseEnter={() => setHoveredWord(word.text)}
            onMouseLeave={() => setHoveredWord(null)}
          >
            {word.text}
          </text>
        );
      })}

      {/* Tooltip */}
      {hoveredWord && (() => {
        const wordData = words.find(w => w.text === hoveredWord);
        return (
          <g>
            <rect
              x={10}
              y={10}
              width={130}
              height={42}
              fill="white"
              stroke="#e2e8f0"
              strokeWidth={1}
              rx={4}
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
            />
            <text x={18} y={28} fontSize={12} fontWeight={600} fill="#1e293b">
              {hoveredWord}
            </text>
            <text x={18} y={44} fontSize={10} fill="#64748b">
              TF-IDF: {wordData?.tfidf.toFixed(1)}
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

// Main component
export interface TrueWordRainProps {
  words: {
    text: string;
    semanticX: number;
    avgTfidf: number;
    yearData: Record<number, { frequency: number; tfidf: number; sentiment?: number }>;
  }[];
  years: number[];
  sentimentData?: Record<string, number>;
  panelWidth?: number;
  panelHeight?: number;
  colorMode?: 'sentiment' | 'semantic';
  columns?: number;
}

export function TrueWordRain({
  words,
  years,
  panelWidth = 900,
  panelHeight = 750,
}: TrueWordRainProps) {
  const isAllYears = years.length > 1;

  // Prepare word data
  const wordData = useMemo(() => {
    if (isAllYears) {
      return words
        .map(word => ({
          text: word.text,
          semanticX: word.semanticX,
          tfidf: word.avgTfidf
        }))
        .filter(w => w.tfidf > 0)
        .sort((a, b) => b.tfidf - a.tfidf)
        .slice(0, 300);
    } else {
      const year = years[0];
      return words
        .map(word => {
          const yearInfo = word.yearData[year];
          return {
            text: word.text,
            semanticX: word.semanticX,
            tfidf: yearInfo?.tfidf || 0
          };
        })
        .filter(w => w.tfidf > 0)
        .sort((a, b) => b.tfidf - a.tfidf)
        .slice(0, 300);
    }
  }, [words, years, isAllYears]);

  const title = isAllYears
    ? `Wall Street Narratives (${years[0]}-${years[years.length - 1]})`
    : `Wall Street Narratives ${years[0]}`;

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-24 h-3 rounded" style={{
            background: 'linear-gradient(to right, rgb(80, 140, 200), rgb(120, 220, 170), rgb(250, 100, 255))'
          }} />
          <span>Semantic axis</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="20" height="30" className="overflow-visible">
            <line x1="10" y1="28" x2="10" y2="6" stroke="#94a3b8" strokeWidth="0.8" />
            <circle cx="10" cy="6" r="1.5" fill="#94a3b8" />
          </svg>
          <span>Bar height = TF-IDF</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xl font-semibold text-slate-500">A</span>
          <span className="text-xs text-slate-400">a</span>
          <span className="ml-1">Font size = prominence</span>
        </div>
      </div>

      {/* Word Rain Panel */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <WordRainPanel
          words={wordData}
          width={panelWidth}
          height={panelHeight}
          title={title}
        />
      </div>

      {/* Info */}
      <div className="text-xs text-muted-foreground">
        {wordData.length} terms • Hover for details
      </div>
    </div>
  );
}
