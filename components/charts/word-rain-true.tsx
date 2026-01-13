"use client";

import { useMemo, useState } from 'react';
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
  const barZoneHeight = height * 0.22;
  const wordZoneStart = titleHeight + barZoneHeight;
  const wordZoneHeight = height - wordZoneStart - 50;

  const margin = { left: 80, right: 80 };
  const innerWidth = width - margin.left - margin.right;

  const sortedWords = [...words].sort((a, b) => b.tfidf - a.tfidf);
  const placedWords: PlacedWord[] = [];
  const occupiedRects: { x1: number; y1: number; x2: number; y2: number }[] = [];

  const minFontSize = 14;
  const maxFontSize = Math.min(52, width / 18);

  if (layout === 'lanes') {
    // Original: 8 semantic lanes
    const numLanes = 8;
    const laneWidth = innerWidth / numLanes;

    const lanes: WordData[][] = Array.from({ length: numLanes }, () => []);
    for (const word of words) {
      const laneIndex = Math.min(numLanes - 1, Math.floor(word.semanticX * numLanes));
      lanes[laneIndex].push(word);
    }

    for (let i = 0; i < numLanes; i++) {
      const laneX = margin.left + (i + 0.5) * laneWidth;
      const laneWords = lanes[i].sort((a, b) => b.tfidf - a.tfidf);
      let currentY = wordZoneStart + 15;

      for (const word of laneWords) {
        const tfidfFactor = Math.log(word.tfidf + 1) / Math.log(maxTfidf + 1);
        const fontSize = minFontSize + tfidfFactor * (maxFontSize - minFontSize);
        const textHeight = fontSize * 1.3;

        if (currentY + textHeight > height - 20) break;

        placedWords.push({
          text: word.text,
          x: laneX,
          y: currentY,
          barTop: titleHeight + 10 + (1 - tfidfFactor) * (barZoneHeight - 20),
          fontSize,
          color: getSemanticColor(word.semanticX)
        });

        currentY += textHeight + 10;
      }
    }
  } else {
    // Free layout with horizontal spreading priority
    for (const word of sortedWords) {
      const tfidfFactor = Math.log(word.tfidf + 1) / (Math.log(maxTfidf + 1) || 1);
      const fontSize = minFontSize + tfidfFactor * (maxFontSize - minFontSize);
      const charWidth = fontSize * 0.58;
      const textWidth = word.text.length * charWidth;
      const textHeight = fontSize * 1.25;

      const targetX = margin.left + word.semanticX * innerWidth;
      const startY = wordZoneStart + 15;

      let bestX = targetX;
      let bestY = height;
      let found = false;

      const horizontalOffsets = [0, -40, 40, -80, 80, -120, 120, -180, 180];

      for (const offset of horizontalOffsets) {
        let x = targetX + offset;
        x = Math.max(margin.left + textWidth / 2, Math.min(width - margin.right - textWidth / 2, x));

        let y = startY;
        let attempts = 0;
        let collision = false;

        while (attempts < 50) {
          const rect = {
            x1: x - textWidth / 2 - 12,
            y1: y - 6,
            x2: x + textWidth / 2 + 12,
            y2: y + textHeight + 6
          };

          const hasCollision = occupiedRects.some(occ =>
            rect.x1 < occ.x2 && rect.x2 > occ.x1 && rect.y1 < occ.y2 && rect.y2 > occ.y1
          );

          if (!hasCollision) break;

          y += 15;
          if (y > height - 40) {
            collision = true;
            break;
          }
          attempts++;
        }

        if (!collision) {
          if (y < bestY) {
            bestY = y;
            bestX = x;
            found = true;
            if (y === startY) break;
          }
        }
      }

      if (found) {
        const barTop = titleHeight + 10 + (1 - tfidfFactor) * (barZoneHeight - 20);
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
    }
  }

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
  const barZoneHeight = height * 0.22;
  const wordZoneStart = titleHeight + barZoneHeight;

  return (
    <svg width={width} height={height} className="overflow-visible word-rain-svg">
      <style>{animationStyles}</style>

      {/* Background with Neutral base */}
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

      {/* Bars (Zone b) - modeled after ax.bar in user script */}
      {placedWords.map((word, i) => {
        const isHovered = hoveredWord === word.text;
        const dimmed = hoveredWord && !isHovered;
        const barWidth = 14;
        const barHeight = Math.max(4, wordZoneStart - word.barTop - 5);

        return (
          <g key={`bar-${word.text}-${i}`} opacity={dimmed ? 0.2 : 1}>
            {/* The "bar" at the top representing prominence */}
            <rect
              x={word.x - barWidth / 2}
              y={word.barTop}
              width={barWidth}
              height={barHeight}
              fill={word.color}
              fillOpacity={0.4}
              rx={1.5}
            />

            {/* Subtle connecting line down to the word */}
            <line
              x1={word.x}
              x2={word.x}
              y1={word.barTop + barHeight}
              y2={word.y}
              stroke={word.color}
              strokeWidth={0.5}
              strokeOpacity={0.15}
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

  const handleDownload = () => {
    const svg = document.querySelector('.word-rain-svg');
    if (!svg) return;

    // Create a temporary canvas to convert SVG to PNG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    // Get the actual height of the SVG content or use the height of the canvas
    const svgHeight = Math.max(panelHeight * 1.5, 1000);
    const svgWidth = panelWidth - 16;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = svgWidth * 2;
      canvas.height = svgHeight * 2;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);

        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `${downloadFileName || title || 'WordRain'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

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

        <Button variant="outline" size="sm" onClick={handleDownload} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export PNG
        </Button>
      </div>

      {/* Word Rain Panel */}
      <div
        className="bg-white rounded-lg border shadow-sm overflow-y-auto custom-scrollbar w-full"
        style={{ maxHeight: panelHeight }}
      >
        <WordRainPanel
          words={wordData}
          width={panelWidth - 16} // Adjust for scrollbar
          height={Math.max(panelHeight * 2, 1500)} // Full spectrum height
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
