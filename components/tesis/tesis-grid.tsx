"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TesisRecord } from "@/app/api/tesis/route";

// Color scheme for themes
const THEME_COLORS: Record<string, string> = {
  'BASE CASE': '#475569',           // slate-600
  'GROWTH': '#22c55e',              // green-500
  'RECESSION': '#ef4444',           // red-500
  'MONETARY POLICY': '#8b5cf6',     // violet-500
  'INFLATION': '#f97316',           // orange-500
  'FISCAL': '#6366f1',              // indigo-500
  'VOLATILITY': '#a855f7',          // purple-500
  'NEGATIVE RATES': '#3b82f6',      // blue-500
  'LIQUIDITY': '#2563eb',           // blue-600
  'TRADE': '#c026d3',               // fuchsia-600
  'POLITICS': '#db2777',            // pink-600
  'ELECTIONS': '#e11d48',           // rose-600
  'CHINA': '#ca8a04',               // yellow-600
  'COVID': '#dc2626',               // red-600
  'BREXIT': '#0284c7',              // sky-600
  'ESG': '#16a34a',                 // green-600
  'QUANTITATIVE TIGHTENING': '#1d4ed8', // blue-700
  'QUANTITATIVE EASING': '#06b6d4', // cyan-500
  'QT': '#1d4ed8',                  // blue-700
  'BONDS': '#0891b2',               // cyan-600
  'HEDGING': '#0e7490',             // cyan-700
  'COMPANIES': '#64748b',           // slate-500
  'CYCLICALS': '#84cc16',           // lime-500
  'TECH': '#7c3aed',                // violet-600
  'ROTATION': '#f59e0b',            // amber-500
  'DOLLAR': '#10b981',              // emerald-500
  'STEEPENING': '#3b82f6',          // blue-500
  'EARNINGS': '#6366f1',            // indigo-500
  'SLOWDOWN': '#eab308',            // yellow-500
  'WAGES': '#f59e0b',               // amber-500
  'SUPPLY CHAIN': '#ca8a04',        // yellow-600
  'TARIFFS': '#ea580c',             // orange-600
  'GEOPOLITICS': '#be185d',         // pink-700
  'WAR': '#991b1b',                 // red-800
  'RESHORING': '#059669',           // emerald-600
  'REGULATION': '#4f46e5',          // indigo-600
  'AI': '#7c3aed',                  // violet-600
  'TIGHTENING': '#64748b',          // slate-500
  'RISKS': '#ef4444',               // red-500
  'EUROPE': '#0284c7',              // sky-600
  'JAPAN': '#dc2626',               // red-600
  'ASIA': '#ca8a04',                // yellow-600
  'DISINFLATION': '#fb923c',        // orange-400
  'SOFT LANDING': '#10b981',        // emerald-500
  'INTEREST RATES': '#64748b',      // slate-500
};

interface TesisGridProps {
  data: TesisRecord[];
  onCellClick?: (record: TesisRecord) => void;
  className?: string;
}

export function TesisGrid({ data, onCellClick, className }: TesisGridProps) {
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);

  // Build grid data structure
  const { gridData, years, maxRank, allThemes } = useMemo(() => {
    const gridData: Record<number, Record<number, TesisRecord>> = {};
    const yearsSet = new Set<number>();
    const allThemes = new Set<string>();
    let maxRank = 0;

    data.forEach(record => {
      if (!gridData[record.year]) {
        gridData[record.year] = {};
      }
      gridData[record.year][record.rank] = record;
      yearsSet.add(record.year);
      allThemes.add(record.themesAssets);
      if (record.rank > maxRank) maxRank = record.rank;
    });

    const years = Array.from(yearsSet).sort((a, b) => a - b);
    return { gridData, years, maxRank, allThemes: Array.from(allThemes) };
  }, [data]);

  const getThemeColor = (theme: string): string => {
    const upperTheme = theme.toUpperCase();
    if (THEME_COLORS[upperTheme]) {
      return THEME_COLORS[upperTheme];
    }
    for (const key in THEME_COLORS) {
      if (upperTheme.includes(key)) {
        return THEME_COLORS[key];
      }
    }
    return '#64748b';
  };

  const getThemeConnections = (theme: string) => {
    const connections: { fromYear: number; fromRank: number; toYear: number; toRank: number }[] = [];

    for (let i = 0; i < years.length - 1; i++) {
      const year1 = years[i];
      const year2 = years[i + 1];

      let rank1 = -1;
      let rank2 = -1;

      for (let r = 1; r <= maxRank; r++) {
        if (gridData[year1]?.[r]?.themesAssets === theme) rank1 = r;
        if (gridData[year2]?.[r]?.themesAssets === theme) rank2 = r;
      }

      if (rank1 !== -1 && rank2 !== -1) {
        connections.push({
          fromYear: year1,
          fromRank: rank1,
          toYear: year2,
          toRank: rank2
        });
      }
    }

    return connections;
  };

  const getDisplayName = (theme: string, year?: number) => {
    if (theme.toUpperCase() === 'BASE CASE' && year) {
      const baseCaseTitles: Record<number, string> = {
        2019: "The Bull Market's|Last Hurrah",
        2020: "The Great Moderation|of Returns",
        2021: "Vaccine-Driven|Global Revival",
        2022: "Inflationary Pressures|& Policy Shifts",
        2023: "Bracing for the|Anticipated Recession",
        2024: "Soft-ish Landing|& Policy Pivot",
        2025: "America First|(Again)",
        2026: "Capex + Policy|= Growth"
      };
      if (baseCaseTitles[year]) return baseCaseTitles[year];
    }

    const abbrevThemes: Record<string, string> = {
      'QUANTITATIVE TIGHTENING': 'QT',
      'QUANTITATIVE EASING': 'QE',
      'MONETARY POLICY': 'MON. POLICY',
      'NEGATIVE RATES': 'NEG. RATES',
      'INTEREST RATES': 'INTEREST RATES',
    };
    const upper = theme.toUpperCase();
    return abbrevThemes[upper] || upper;
  };

  const cellWidth = 100;
  const cellHeight = 48;
  const headerHeight = 36;
  const rankLabelWidth = 60;

  const svgWidth = rankLabelWidth + years.length * cellWidth;
  const svgHeight = headerHeight + maxRank * cellHeight + 10;

  const getX = (yearIndex: number) => rankLabelWidth + yearIndex * cellWidth + cellWidth / 2;
  const getY = (rank: number) => headerHeight + (rank - 1) * cellHeight + cellHeight / 2;

  return (
    <Card className={cn("flex flex-col overflow-hidden", className)}>
      <CardContent className="flex-1 overflow-x-auto overflow-y-auto py-3 px-2 max-h-[calc(100vh-200px)]">
        <svg width={svgWidth} height={svgHeight} className="min-w-full">
          {/* Header row with years */}
          {years.map((year, i) => (
            <text
              key={year}
              x={getX(i)}
              y={20}
              textAnchor="middle"
              className="fill-foreground font-bold text-xs"
            >
              {year}
            </text>
          ))}

          {/* Rank labels */}
          {Array.from({ length: maxRank }, (_, i) => {
            const rank = i + 1;
            return (
              <text
                key={rank}
                x={rankLabelWidth - 6}
                y={getY(rank) + 3}
                textAnchor="end"
                className={cn(
                  "fill-muted-foreground font-medium",
                  rank === 1 ? "text-[10px] uppercase font-bold tracking-tight" : "text-[10px]"
                )}
              >
                {rank === 1 ? 'Base Case' : rank}
              </text>
            );
          })}

          {/* Grid lines */}
          {Array.from({ length: maxRank }, (_, i) => {
            const rank = i + 1;
            return (
              <line
                key={rank}
                x1={rankLabelWidth}
                y1={getY(rank)}
                x2={svgWidth - 5}
                y2={getY(rank)}
                stroke="currentColor"
                strokeOpacity={0.05}
                strokeDasharray="2,2"
              />
            );
          })}

          {/* Connection lines */}
          {allThemes.map(theme => {
            const connections = getThemeConnections(theme);
            if (connections.length === 0) return null;

            const color = getThemeColor(theme);
            const isHighlighted = hoveredTheme === theme;
            const isDimmed = hoveredTheme && !isHighlighted;

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
              {Array.from({ length: maxRank }, (_, i) => {
                const rank = i + 1;
                const record = gridData[year]?.[rank];
                if (!record) return null;

                const color = getThemeColor(record.themesAssets);
                const isHighlighted = hoveredTheme === record.themesAssets;
                const isDimmed = hoveredTheme && !isHighlighted;

                const x = getX(yearIndex);
                const y = getY(rank);
                const boxWidth = cellWidth - 4;
                const boxHeight = cellHeight - 3;

                const rawDisplayText = getDisplayName(record.themesAssets, record.year);
                const displayLines = rawDisplayText.split('|');
                const isTwoLines = displayLines.length > 1;

                return (
                  <g
                    key={`${year}-${rank}`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredTheme(record.themesAssets)}
                    onMouseLeave={() => setHoveredTheme(null)}
                    onClick={() => onCellClick?.(record)}
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
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={cn(
                        "font-semibold pointer-events-none select-none",
                        isTwoLines ? "text-[8px] leading-tight" : "text-[9px]",
                        isDimmed ? "fill-muted-foreground" : "fill-white"
                      )}
                      style={{ textShadow: isDimmed ? 'none' : '0 1px 2px rgba(0,0,0,0.5)' }}
                    >
                      {isTwoLines ? (
                        <>
                          <tspan x={x} dy="-0.4em">{displayLines[0]}</tspan>
                          <tspan x={x} dy="1.1em">{displayLines[1]}</tspan>
                        </>
                      ) : (
                        rawDisplayText
                      )}
                    </text>
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
