"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ThemeRanking } from '@/lib/db/queries';

// Themes to exclude from the bump chart (RISKS will be in separate section)
const EXCLUDED_THEMES = ['RISKS'];

// Color scheme: unique color per theme
const THEME_COLORS: Record<string, string> = {
  // Special
  'BASE CASE': '#475569',      // slate-600
  // Macro themes
  'GROWTH': '#22c55e',         // green-500
  'RECESSION': '#ef4444',      // red-500
  'MONETARY POLICY': '#8b5cf6', // violet-500
  'INFLATION': '#f97316',      // orange-500
  'FISCAL': '#6366f1',         // indigo-500
  'VOLATILITY': '#a855f7',     // purple-500
  'SLOWDOWN': '#eab308',       // yellow-500
  'RATE CUTS': '#06b6d4',      // cyan-500
  'HIGH RATES': '#0ea5e9',     // sky-500
  'PIVOT': '#14b8a6',          // teal-500
  'NEGATIVE RATES': '#3b82f6', // blue-500
  'LIQUIDITY': '#2563eb',      // blue-600
  'SOFT LANDING': '#10b981',   // emerald-500
  'DISINFLATION': '#fb923c',   // orange-400
  'QUANTITATIVE TIGHTENING': '#1d4ed8', // blue-700
  'WAGES': '#f59e0b',          // amber-500
  // Thematic themes
  'TRADE': '#c026d3',          // fuchsia-600
  'POLITICS': '#db2777',       // pink-600
  'ELECTIONS': '#e11d48',      // rose-600
  'AI': '#7c3aed',             // violet-600
  'COVID': '#dc2626',          // red-600
  'ESG': '#16a34a',            // green-600
  'SUPPLY CHAIN': '#ca8a04',   // yellow-600
  'TARIFFS': '#ea580c',        // orange-600
  'GEOPOLITICS': '#be185d',    // pink-700
  'WAR': '#991b1b',            // red-800
  'BREXIT': '#0284c7',         // sky-600
  'RESHORING': '#059669',      // emerald-600
  'REGULATION': '#4f46e5',     // indigo-600
};

interface BumpChartProps {
  rankings: ThemeRanking[];
  years: number[];
  baseCases: { year: number; subtitle: string }[];
  onThemeSelect?: (theme: string | null) => void;
  selectedTheme?: string | null;
  className?: string;
}

// Abbreviate base case subtitle to fit in tile
function abbreviateSubtitle(subtitle: string): string {
  // Common abbreviations
  const abbrevMap: Record<string, string> = {
    "The Bull Market's Last Hurrah": "Bull's Last Hurrah",
    "The Great Moderation of Returns": "Great Moderation",
    "Vaccine-Driven Global Revival": "Vaccine Revival",
    "Inflationary Pressures & Policy Shifts": "Inflation & Policy",
    "Bracing for the Anticipated Recession": "Recession Bracing",
    "Soft-ish Landing and the Policy Pivot": "Soft Landing",
    "America First (Again)": "America First",
    "Capex + Policy = Growth": "Capex + Policy",
  };

  return abbrevMap[subtitle] || (subtitle.length > 18 ? subtitle.slice(0, 16) + '..' : subtitle);
}

export function BumpChart({
  rankings,
  years,
  baseCases,
  onThemeSelect,
  selectedTheme,
  className
}: BumpChartProps) {
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);
  const [hoveredBaseCase, setHoveredBaseCase] = useState<number | null>(null);

  // Filter out excluded themes and recalculate ranks (no gaps)
  const filteredRankings = useMemo(() => {
    const result: ThemeRanking[] = [];

    years.forEach(year => {
      // Get all rankings for this year, excluding RISKS
      const yearRankings = rankings
        .filter(r => r.year === year && !EXCLUDED_THEMES.includes(r.theme))
        .sort((a, b) => a.rank - b.rank);

      // Reassign ranks: BASE CASE stays at 0, others get consecutive ranks
      yearRankings.forEach((r, index) => {
        if (r.theme === 'BASE CASE') {
          result.push({ ...r, rank: 0 });
        } else {
          // Find position after BASE CASE
          const baseCaseIndex = yearRankings.findIndex(x => x.theme === 'BASE CASE');
          const adjustedIndex = index > baseCaseIndex ? index : index + 1;
          result.push({ ...r, rank: adjustedIndex });
        }
      });
    });

    return result;
  }, [rankings, years]);

  // Build grid data
  const { gridData, allThemes, maxRankPerYear } = useMemo(() => {
    const gridData: Record<number, Record<number, ThemeRanking | null>> = {};
    const allThemes = new Set<string>();
    const maxRankPerYear: Record<number, number> = {};

    years.forEach(year => {
      gridData[year] = {};
      const yearRankings = filteredRankings.filter(r => r.year === year);
      let maxRank = 0;
      yearRankings.forEach(r => {
        gridData[year][r.rank] = r;
        allThemes.add(r.theme);
        if (r.rank > maxRank) maxRank = r.rank;
      });
      maxRankPerYear[year] = maxRank;
    });

    return { gridData, allThemes: Array.from(allThemes), maxRankPerYear };
  }, [filteredRankings, years]);

  const getThemeColor = (theme: string): string => {
    return THEME_COLORS[theme] || '#64748b';
  };

  const getThemeConnections = (theme: string) => {
    const connections: { fromYear: number; fromRank: number; toYear: number; toRank: number }[] = [];

    for (let i = 0; i < years.length - 1; i++) {
      const year1 = years[i];
      const year2 = years[i + 1];

      const r1 = filteredRankings.find(r => r.year === year1 && r.theme === theme);
      const r2 = filteredRankings.find(r => r.year === year2 && r.theme === theme);

      if (r1 && r2) {
        connections.push({
          fromYear: year1,
          fromRank: r1.rank,
          toYear: year2,
          toRank: r2.rank
        });
      }
    }

    return connections;
  };

  // Calculate max rank across all years
  const maxRank = Math.max(...Object.values(maxRankPerYear), 10);

  const cellWidth = 142;
  const cellHeight = 54;
  const headerHeight = 40;
  const rankLabelWidth = 85;

  const svgWidth = rankLabelWidth + years.length * cellWidth;
  const svgHeight = headerHeight + (maxRank + 1) * cellHeight + 10;

  const getX = (yearIndex: number) => rankLabelWidth + yearIndex * cellWidth + cellWidth / 2;
  const getY = (rank: number) => headerHeight + rank * cellHeight + cellHeight / 2;

  return (
    <Card className={cn("flex flex-col overflow-hidden", className)}>
      <CardContent className="flex-1 overflow-x-auto py-3 px-2">
        <svg width={svgWidth} height={svgHeight} className="min-w-full">
          {/* Header row with years */}
          {years.map((year, i) => (
            <text
              key={year}
              x={getX(i)}
              y={22}
              textAnchor="middle"
              className="fill-foreground font-bold text-sm"
            >
              {year}
            </text>
          ))}

          {/* Rank labels */}
          {Array.from({ length: maxRank + 1 }, (_, rank) => (
            <text
              key={rank}
              x={rankLabelWidth - 8}
              y={getY(rank) + 4}
              textAnchor="end"
              className="fill-muted-foreground text-xs font-medium"
            >
              {rank === 0 ? 'BASE CASE' : rank}
            </text>
          ))}

          {/* Grid lines */}
          {Array.from({ length: maxRank + 1 }, (_, rank) => (
            <line
              key={rank}
              x1={rankLabelWidth}
              y1={getY(rank)}
              x2={svgWidth - 5}
              y2={getY(rank)}
              stroke="currentColor"
              strokeOpacity={rank === 0 ? 0.12 : 0.05}
              strokeDasharray={rank === 0 ? "none" : "2,2"}
            />
          ))}

          {/* Connection lines (skip BASE CASE - always flat) */}
          {allThemes.map(theme => {
            if (theme === 'BASE CASE') return null;
            const connections = getThemeConnections(theme);
            if (connections.length === 0) return null;

            const color = getThemeColor(theme);
            const isHighlighted = selectedTheme === theme || hoveredTheme === theme;
            const isDimmed = (selectedTheme || hoveredTheme) && !isHighlighted;

            return (
              <g key={`connections-${theme}`}>
                {connections.map((conn, i) => {
                  const x1 = getX(years.indexOf(conn.fromYear));
                  const y1 = getY(conn.fromRank);
                  const x2 = getX(years.indexOf(conn.toYear));
                  const y2 = getY(conn.toRank);
                  const midX = (x1 + x2) / 2;

                  return (
                    <path
                      key={i}
                      d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                      fill="none"
                      stroke={color}
                      strokeWidth={isHighlighted ? 4 : 2}
                      strokeOpacity={isDimmed ? 0.08 : 0.5}
                      className="transition-all duration-200"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Theme blocks */}
          {years.map((year, yearIndex) => (
            <g key={year}>
              {Array.from({ length: maxRank + 1 }, (_, rank) => {
                const ranking = gridData[year]?.[rank];
                if (!ranking) return null;

                const color = getThemeColor(ranking.theme);
                const isHighlighted = selectedTheme === ranking.theme || hoveredTheme === ranking.theme;
                const isDimmed = (selectedTheme || hoveredTheme) && !isHighlighted;
                const isBaseCase = ranking.theme === 'BASE CASE';
                const isBaseCaseHovered = isBaseCase && hoveredBaseCase === year;

                const x = getX(yearIndex);
                const y = getY(rank);
                const boxWidth = cellWidth - 6;
                const boxHeight = cellHeight - 4;

                // Get base case subtitle for this year
                const bc = baseCases.find(b => b.year === year);

                // Abbreviate long theme names
                const getDisplayName = (theme: string) => {
                  const abbrevThemes: Record<string, string> = {
                    'QUANTITATIVE TIGHTENING': 'QT',
                    'QUANTITATIVE EASING': 'QE',
                    'MONETARY POLICY': 'MON. POLICY',
                    'SUPPLY CHAIN': 'SUPPLY CHAIN',
                    'NEGATIVE RATES': 'NEG. RATES',
                  };
                  return abbrevThemes[theme] || theme;
                };

                const baseCaseText = isBaseCase && bc ? abbreviateSubtitle(bc.subtitle) : getDisplayName(ranking.theme);

                return (
                  <g
                    key={`${year}-${rank}`}
                    className="cursor-pointer"
                    onMouseEnter={() => {
                      setHoveredTheme(ranking.theme);
                      if (isBaseCase) setHoveredBaseCase(year);
                    }}
                    onMouseLeave={() => {
                      setHoveredTheme(null);
                      setHoveredBaseCase(null);
                    }}
                    onClick={() => onThemeSelect?.(selectedTheme === ranking.theme ? null : ranking.theme)}
                  >
                    <rect
                      x={x - boxWidth / 2}
                      y={y - boxHeight / 2}
                      width={boxWidth}
                      height={boxHeight}
                      rx={4}
                      fill={color}
                      fillOpacity={isDimmed ? 0.1 : isHighlighted ? 1 : 0.9}
                      stroke={isHighlighted ? '#fff' : 'none'}
                      strokeWidth={2}
                      className="transition-all duration-200"
                    />
                    <text
                      x={x}
                      y={y + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={cn(
                        "text-[11px] font-semibold pointer-events-none select-none",
                        isDimmed ? "fill-muted-foreground" : "fill-white"
                      )}
                      style={{ textShadow: isDimmed ? 'none' : '0 1px 2px rgba(0,0,0,0.5)' }}
                    >
                      {baseCaseText}
                    </text>

                    {/* Tooltip for BASE CASE full subtitle */}
                    {isBaseCaseHovered && bc && (
                      <g>
                        <rect
                          x={x - 100}
                          y={y - boxHeight / 2 - 30}
                          width={200}
                          height={24}
                          rx={4}
                          fill="hsl(var(--popover))"
                          stroke="hsl(var(--border))"
                          strokeWidth={1}
                          className="drop-shadow-lg"
                        />
                        <text
                          x={x}
                          y={y - boxHeight / 2 - 14}
                          textAnchor="middle"
                          className="fill-popover-foreground text-[11px] font-medium pointer-events-none"
                        >
                          {bc.subtitle}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          ))}
        </svg>
      </CardContent>
    </Card>
  );
}
