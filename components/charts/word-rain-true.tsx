"use client";

import { useMemo, useState, useEffect, useRef } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface WordData {
  text: string;
  semanticX: number;  // 0-1 from t-SNE
  tfidf: number;
  yearData?: Record<number, { frequency: number; tfidf: number; sentiment?: number }>;
}

interface PlacedWord {
  text: string;
  x: number;
  y: number;
  barTop: number;
  fontSize: number;
  color: string;
  sentiment?: number;
}

// Add rain-drop animation via CSS
const animationStyles = `
  @keyframes rainDrop {
    0% { transform: translateY(-30px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  .word-rain-word {
    animation: rainDrop 0.6s ease-out forwards;
  }
`;

function getSentimentColorHex(sentiment: number): string {
  if (sentiment > 0.15) return '#22c55e'; // Green-500
  if (sentiment < -0.15) return '#ef4444'; // Red-500
  return '#94a3b8'; // Slate-400
}

// Use colors from the user's Python script
const RAIN_COLORS = ['#1f77b4', '#2ca02c', '#d62728', '#9467bd', '#ff7f0e', '#00CED1'];

function getSemanticColor(x: number): string {
  // Interpolate through the discrete colors
  const count = RAIN_COLORS.length;
  const scaledX = x * (count - 1);
  const index = Math.floor(scaledX);
  const nextIndex = Math.min(index + 1, count - 1);
  const factor = scaledX - index;

  const c1 = mcolors_to_rgb(RAIN_COLORS[index]);
  const c2 = mcolors_to_rgb(RAIN_COLORS[nextIndex]);

  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);

  return `rgb(${r}, ${g}, ${b})`;
}

// Helper to convert hex to rgb
function mcolors_to_rgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

// Place words following the Word Rain algorithm with clear zone separation
function placeWords(
  words: WordData[],
  width: number,
  height: number,
  maxTfidf: number,
  layout: 'free' | 'lanes' = 'free'
): PlacedWord[] {
  // Zone definitions
  const titleHeight = 40;
  const barZoneHeight = 200;
  const wordZoneStart = titleHeight + barZoneHeight;
  const wordZoneHeight = height - wordZoneStart - 50;

  const margin = { left: 60, right: 60 };
  const innerWidth = width - margin.left - margin.right;

  const sortedWords = [...words].sort((a, b) => b.tfidf - a.tfidf);
  const placedWords: PlacedWord[] = [];
  const occupiedRects: { x1: number; y1: number; x2: number; y2: number }[] = [];

  const minFontSize = 14;
  const maxFontSize = Math.min(52, width / 18);

  // Free layout with horizontal spreading priority
  // Free layout with horizontal spreading priority
  sortedWords.forEach((word, i) => {
    const tfidfFactor = Math.log(word.tfidf + 1) / (Math.log(maxTfidf + 1) || 1);
    // Increase font size contrast by using power function
    const fontSize = minFontSize + Math.pow(tfidfFactor, 1.2) * (maxFontSize - minFontSize);
    const charWidth = fontSize * 0.58;
    const textWidth = word.text.length * charWidth;
    const textHeight = fontSize * 1.25;

    const targetX = margin.left + word.semanticX * innerWidth;

    // Distribute words vertically by rank (i) to ensure "one is above the other"
    const rankStep = 7;
    const rankStartY = wordZoneStart + 5 + (i * rankStep);

    let bestX = targetX;
    let bestY = height;
    let found = false;

    // We try to keep it at its rank vertical position, but allow horizontal shifting
    const horizontalOffsets = [0, -30, 30, -60, 60, -100, 100, -150, 150, -200, 200];

    for (const offset of horizontalOffsets) {
      let x = targetX + offset;
      x = Math.max(margin.left + textWidth / 2, Math.min(width - margin.right - textWidth / 2, x));

      let y = rankStartY;
      let attempts = 0;
      let collision = false;

      // Vertical search starting from rank position
      while (attempts < 40) {
        const rect = {
          x1: x - textWidth / 2 - 10,
          y1: y - 4,
          x2: x + textWidth / 2 + 10,
          y2: y + textHeight + 4
        };

        const hasCollision = occupiedRects.some(occ =>
          rect.x1 < occ.x2 && rect.x2 > occ.x1 && rect.y1 < occ.y2 && rect.y2 > occ.y1
        );

        if (!hasCollision) break;

        y += 12; // Search downwards if collision
        if (y > height - 40) {
          collision = true;
          break;
        }
        attempts++;
      }

      if (!collision) {
        bestY = y;
        bestX = x;
        found = true;
        break; // Found a spot for this horizontal offset
      }
    }

    if (found) {
      // Increased range for barTop to make them stand out more vertically and longer
      const barTop = titleHeight + 10 + (1 - Math.pow(tfidfFactor, 0.7)) * (barZoneHeight - 40);
      placedWords.push({
        text: word.text,
        x: bestX,
        y: bestY,
        barTop,
        fontSize,
        color: getSemanticColor(word.semanticX),
        sentiment: Object.values(word.yearData || {})[0]?.sentiment
      });
      occupiedRects.push({
        x1: bestX - textWidth / 2 - 5,
        y1: bestY - 2,
        x2: bestX + textWidth / 2 + 5,
        y2: bestY + textHeight + 2
      });
    }
  });

  return placedWords;
}

// Single Word Rain panel
function WordRainPanel({
  words,
  width,
  height,
  title,
  layout = 'free',
  scoring = 'importance'
}: {
  words: WordData[];
  width: number;
  height: number;
  title?: string;
  layout?: 'free' | 'lanes';
  scoring?: string;
}) {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);

  const maxTfidf = useMemo(() => {
    return Math.max(...words.map(w => w.tfidf), 1);
  }, [words]);

  const placedWords = useMemo(() =>
    placeWords(words, width, height, maxTfidf, layout),
    [words, width, height, maxTfidf, layout]
  );

  // Zone boundaries for visual reference
  const titleHeight = 40;
  const barZoneHeight = 200;
  const wordZoneStart = titleHeight + barZoneHeight;

  return (
    <svg width={width} height={height} className="overflow-visible word-rain-svg">
      <style>{animationStyles}</style>

      {/* Background with Neutral base */}
      <rect x={0} y={0} width={width} height={height} fill="white" />

      {/* Zone b/c separator line (solid origin) */}
      <line
        x1={30}
        x2={width - 30}
        y1={wordZoneStart}
        y2={wordZoneStart}
        stroke="#cbd5e1"
        strokeWidth={0.8}
        opacity={0.8}
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

      {/* Points and Stems (Zone b) */}
      {placedWords.map((word, i) => {
        const isHovered = hoveredWord === word.text;
        const dimmed = hoveredWord && !isHovered;

        // Dynamically size dots based on prominence (using fontSize as proxy)
        const baseDotSize = word.fontSize / 12;
        const dotSize = isHovered ? baseDotSize + 2 : baseDotSize;

        return (
          <g key={`stem-${word.text}-${i}`} opacity={dimmed ? 0.2 : 1}>
            {/* Stem Segment Above Axis (High Intensity) */}
            <line
              x1={word.x}
              x2={word.x}
              y1={word.barTop}
              y2={wordZoneStart}
              stroke={word.color}
              strokeWidth={isHovered ? 2 : 1.2}
              strokeOpacity={isHovered ? 1 : 0.7}
            />

            {/* Stem Segment Below Axis (Clearer/Moderate Opacity) */}
            <line
              x1={word.x}
              x2={word.x}
              y1={wordZoneStart}
              y2={word.y}
              stroke={word.color}
              strokeWidth={isHovered ? 1 : 0.6}
              strokeOpacity={isHovered ? 0.6 : 0.3}
            />

            {/* The point at the top */}
            <circle
              cx={word.x}
              cy={word.barTop}
              r={dotSize}
              fill={word.color}
              fillOpacity={isHovered ? 1 : 0.8}
            />
          </g>
        );
      })}

      {/* Words (Zones c/d) - Drop Layout Only */}
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
            fontWeight={isHovered ? 700 : 500}
            fill={word.color}
            opacity={dimmed ? 1 : 0.8}
            className="word-rain-word"
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              cursor: 'pointer',
              animationDelay: `${(i % 30) * 0.05}s`,
              transition: 'all 0.3s ease'
            }}
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
              {scoring === 'frequency' ? 'Mentions: ' : 'Importance: '}
              {scoring === 'frequency'
                ? Math.round(wordData?.tfidf || 0)
                : ((wordData?.tfidf || 0) * 1000).toFixed(1)}
            </text>
          </g>
        );
      })()}
    </svg>
  );
}



export interface TrueWordRainProps {
  words: {
    text: string;
    semanticX: number;
    avgTfidf: number;
    yearData: Record<number, { frequency: number; tfidf: number; sentiment?: number }>;
  }[];
  years: number[];
  panelWidth?: number;
  panelHeight?: number;
  columns?: number;
  layout?: 'free' | 'lanes';
  title?: string;
  downloadFileName?: string;
  scoring?: string;
}

export function TrueWordRain({
  words,
  years,
  panelWidth = 900,
  panelHeight = 750,
  layout = 'free',
  title,
  downloadFileName,
  scoring = 'importance'
}: TrueWordRainProps) {
  const isAllYears = years.length > 1;

  // Prepare word data
  const wordData = useMemo(() => {
    if (isAllYears) {
      return words
        .map(word => ({
          text: word.text,
          semanticX: word.semanticX,
          tfidf: word.avgTfidf,
          yearData: word.yearData
        }))
        .filter(w => w.tfidf > 0)
        .sort((a, b) => b.tfidf - a.tfidf);
    } else {
      const year = years[0];
      return words
        .map(word => {
          const yearInfo = word.yearData[year];
          return {
            text: word.text,
            semanticX: word.semanticX,
            tfidf: yearInfo?.tfidf || 0,
            yearData: word.yearData
          };
        })
        .filter(w => w.tfidf > 0)
        .sort((a, b) => b.tfidf - a.tfidf);
    }
  }, [words, years, isAllYears]);

  const calculatedHeight = Math.max(panelHeight, wordData.length * 7 + 280);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Force scroll to top when data changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [wordData]);



  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      {/* Legend & Controls */}
      <div className="flex flex-wrap items-center justify-between w-full gap-4 px-2">
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-24 h-3 rounded" style={{
              background: 'linear-gradient(to right, rgb(80, 140, 200), rgb(120, 220, 170), rgb(250, 100, 255))'
            }} />
            <span>Semantic axis</span>
          </div>

          <div className="flex items-center gap-2">
            <svg width="20" height="30" className="overflow-visible">
              <line x1="10" y1="28" x2="10" y2="6" stroke="#94a3b8" strokeWidth="1" />
              <circle cx="10" cy="6" r="2.5" fill="#94a3b8" />
            </svg>
            <span>Stem & Dot = Prominence</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xl font-semibold text-slate-500">A</span>
            <span className="text-xs text-slate-400">a</span>
            <span className="ml-1">Font size = prominence</span>
          </div>
        </div>


      </div>

      {/* Word Rain Panel */}
      <div
        ref={scrollRef}
        className="bg-white rounded-lg border shadow-sm overflow-y-auto custom-scrollbar w-full"
        style={{ maxHeight: panelHeight }}
      >
        <WordRainPanel
          words={wordData}
          width={panelWidth - 16} // Adjust for scrollbar
          height={calculatedHeight}
          layout={layout}
          scoring={scoring}
        />
      </div>

      {/* Info */}
      <div className="text-xs text-muted-foreground">
        {wordData.length} terms • Hover for details • Scroll to see full spectrum
      </div>
    </div>
  );
}
