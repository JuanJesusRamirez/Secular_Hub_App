"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ThemeRanking } from '@/lib/db/queries';
import { getSemanticColor, SemanticCategory } from '@/lib/data/semantic-colors';
import { NARRATIVE_ERAS, NARRATIVE_EVENTS, getEventTypeColor } from '@/lib/data/narrative-events';

const EXCLUDED_THEMES = ['RISKS'];

interface NarrativeChartProps {
  rankings: ThemeRanking[];
  years: number[];
  baseCases: { year: number; subtitle: string }[];
  onThemeSelect?: (theme: string | null) => void;
  selectedTheme?: string | null;
  categoryFilter?: SemanticCategory | null;
  className?: string;
}

// Abbreviate base case subtitle to fit in tile
function abbreviateSubtitle(subtitle: string): string {
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

// Abbreviate long theme names
function abbreviateTheme(theme: string): string {
  const abbrevThemes: Record<string, string> = {
    'QUANTITATIVE TIGHTENING': 'QT',
    'QUANTITATIVE EASING': 'QE',
    'MONETARY POLICY': 'MON. POLICY',
    'SUPPLY CHAIN': 'SUPPLY CHAIN',
    'NEGATIVE RATES': 'NEG. RATES',
  };
  return abbrevThemes[theme] || theme;
}

export function NarrativeChart({
  rankings,
  years,
  baseCases,
  onThemeSelect,
  selectedTheme,
  categoryFilter,
  className
}: NarrativeChartProps) {
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null);

  // Filter out excluded themes and recalculate ranks
  const filteredRankings = useMemo(() => {
    const result: ThemeRanking[] = [];
    years.forEach(year => {
      const yearRankings = rankings
        .filter(r => r.year === year && !EXCLUDED_THEMES.includes(r.theme))
        .sort((a, b) => a.rank - b.rank);

      yearRankings.forEach((r, index) => {
        if (r.theme === 'BASE CASE') {
          result.push({ ...r, rank: 0 });
        } else {
          const baseCaseIndex = yearRankings.findIndex(x => x.theme === 'BASE CASE');
          const adjustedIndex = index > baseCaseIndex ? index : index + 1;
          result.push({ ...r, rank: adjustedIndex });
        }
      });
    });
    return result;
  }, [rankings, years]);

  // Build grid data
  const { gridData, allThemes, maxRankPerYear, maxCount } = useMemo(() => {
    const gridData: Record<number, Record<number, ThemeRanking | null>> = {};
    const allThemes = new Set<string>();
    const maxRankPerYear: Record<number, number> = {};
    let maxCount = 0;

    years.forEach(year => {
      gridData[year] = {};
      const yearRankings = filteredRankings.filter(r => r.year === year);
      let maxRank = 0;
      yearRankings.forEach(r => {
        gridData[year][r.rank] = r;
        allThemes.add(r.theme);
        if (r.rank > maxRank) maxRank = r.rank;
        if (r.count > maxCount) maxCount = r.count;
      });
      maxRankPerYear[year] = maxRank;
    });

    return { gridData, allThemes: Array.from(allThemes), maxRankPerYear, maxCount };
  }, [filteredRankings, years]);

  const getThemeConnections = (theme: string) => {
    const connections: { fromYear: number; fromRank: number; toYear: number; toRank: number }[] = [];
    for (let i = 0; i < years.length - 1; i++) {
      const year1 = years[i];
      const year2 = years[i + 1];
      const r1 = filteredRankings.find(r => r.year === year1 && r.theme === theme);
      const r2 = filteredRankings.find(r => r.year === year2 && r.theme === theme);
      if (r1 && r2) {
        connections.push({ fromYear: year1, fromRank: r1.rank, toYear: year2, toRank: r2.rank });
      }
    }
    return connections;
  };

  // Layout constants
  const maxRank = Math.max(...Object.values(maxRankPerYear), 10);
  const cellWidth = 145;
  const cellHeight = 56;
  const headerHeight = 80; // Extra space for era labels + events
  const rankLabelWidth = 90;

  const svgWidth = rankLabelWidth + years.length * cellWidth;
  const svgHeight = headerHeight + (maxRank + 1) * cellHeight + 20;

  const getX = (yearIndex: number) => rankLabelWidth + yearIndex * cellWidth + cellWidth / 2;
  const getY = (rank: number) => headerHeight + rank * cellHeight + cellHeight / 2;

  // Node size based on count (variable sizing)
  const getNodeSize = (count: number) => {
    const minSize = 22;
    const maxSize = 48;
    const scaled = (count / maxCount) * (maxSize - minSize) + minSize;
    return Math.min(maxSize, Math.max(minSize, scaled));
  };

  return (
    <Card className={cn("flex flex-col overflow-hidden", className)}>
      <CardContent className="flex-1 overflow-x-auto py-4 px-2">
        <svg width={svgWidth} height={svgHeight} className="min-w-full">
          {/* Era Backgrounds */}
          {NARRATIVE_ERAS.map((era, i) => {
            const startIdx = years.indexOf(era.startYear);
            if (startIdx === -1) return null;

            let endIdx = years.indexOf(era.endYear);
            if (endIdx === -1) endIdx = years.length - 1;

            const startX = getX(startIdx) - cellWidth / 2;
            const endX = getX(endIdx) + cellWidth / 2;
            const width = endX - startX;

            return (
              <g key={`era-${i}`}>
                <rect
                  x={startX}
                  y={0}
                  width={width}
                  height={svgHeight}
                  fill={era.color}
                />
                <text
                  x={startX + width / 2}
                  y={16}
                  textAnchor="middle"
                  className="fill-muted-foreground/60 text-[10px] uppercase tracking-widest font-semibold"
                >
                  {era.label}
                </text>
              </g>
            );
          })}

          {/* Event Annotation Markers */}
          {NARRATIVE_EVENTS.map((event, i) => {
            const yearIdx = years.indexOf(event.year);
            if (yearIdx === -1) return null;

            const x = getX(yearIdx);
            const isHovered = hoveredEvent === event.year;

            return (
              <g
                key={`event-${i}`}
                onMouseEnter={() => setHoveredEvent(event.year)}
                onMouseLeave={() => setHoveredEvent(null)}
                className="cursor-pointer"
              >
                {/* Vertical marker line */}
                <line
                  x1={x}
                  y1={35}
                  x2={x}
                  y2={headerHeight - 5}
                  stroke={getEventTypeColor(event.type)}
                  strokeWidth={isHovered ? 3 : 2}
                  strokeOpacity={isHovered ? 1 : 0.6}
                  strokeDasharray="4,3"
                />
                {/* Event dot */}
                <circle
                  cx={x}
                  cy={35}
                  r={isHovered ? 6 : 4}
                  fill={getEventTypeColor(event.type)}
                  className="transition-all duration-200"
                />
                {/* Event short label */}
                <text
                  x={x}
                  y={48}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[9px] font-medium"
                >
                  {event.shortLabel}
                </text>

                {/* Tooltip on hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={x - 110}
                      y={55}
                      width={220}
                      height={42}
                      rx={6}
                      fill="hsl(var(--popover))"
                      stroke="hsl(var(--border))"
                      strokeWidth={1}
                      className="drop-shadow-lg"
                    />
                    <text
                      x={x}
                      y={72}
                      textAnchor="middle"
                      className="fill-popover-foreground text-[11px] font-bold"
                    >
                      {event.label}
                    </text>
                    <text
                      x={x}
                      y={88}
                      textAnchor="middle"
                      className="fill-muted-foreground text-[10px]"
                    >
                      {event.impact}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Year Headers */}
          {years.map((year, i) => (
            <text
              key={year}
              x={getX(i)}
              y={headerHeight - 8}
              textAnchor="middle"
              className="fill-foreground font-bold text-base"
            >
              {year}
            </text>
          ))}

          {/* Rank Labels */}
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

          {/* Grid Lines */}
          {Array.from({ length: maxRank + 1 }, (_, rank) => (
            <line
              key={rank}
              x1={rankLabelWidth}
              y1={getY(rank)}
              x2={svgWidth - 5}
              y2={getY(rank)}
              stroke="currentColor"
              strokeOpacity={rank === 0 ? 0.15 : 0.05}
              strokeDasharray={rank === 0 ? "none" : "2,2"}
            />
          ))}

          {/* Connection Lines */}
          {allThemes.map(theme => {
            if (theme === 'BASE CASE') return null;
            const connections = getThemeConnections(theme);
            if (connections.length === 0) return null;

            const color = getSemanticColor(theme);
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
                    <g key={i}>
                      {/* Glow effect on highlight */}
                      {isHighlighted && (
                        <path
                          d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                          fill="none"
                          stroke={color}
                          strokeWidth={8}
                          strokeOpacity={0.25}
                          className="transition-all duration-300"
                        />
                      )}
                      <path
                        d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                        fill="none"
                        stroke={color}
                        strokeWidth={isHighlighted ? 4 : 2}
                        strokeOpacity={isDimmed ? 0.05 : isHighlighted ? 0.9 : 0.4}
                        className="transition-all duration-300"
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Theme Blocks */}
          {years.map((year, yearIndex) => (
            <g key={year}>
              {Array.from({ length: maxRank + 1 }, (_, rank) => {
                const ranking = gridData[year]?.[rank];
                if (!ranking) return null;

                const color = getSemanticColor(ranking.theme);
                const isHighlighted = selectedTheme === ranking.theme || hoveredTheme === ranking.theme;
                const isDimmed = (selectedTheme || hoveredTheme) && !isHighlighted;
                const isBaseCase = ranking.theme === 'BASE CASE';

                const x = getX(yearIndex);
                const y = getY(rank);

                // Variable sizing based on count
                const nodeRadius = isBaseCase ? 0 : getNodeSize(ranking.count);
                const boxWidth = isBaseCase ? cellWidth - 8 : nodeRadius * 2.5;
                const boxHeight = isBaseCase ? cellHeight - 6 : nodeRadius * 2;

                const bc = baseCases.find(b => b.year === year);
                const displayText = isBaseCase && bc
                  ? abbreviateSubtitle(bc.subtitle)
                  : abbreviateTheme(ranking.theme);

                return (
                  <g
                    key={`${year}-${rank}`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredTheme(ranking.theme)}
                    onMouseLeave={() => setHoveredTheme(null)}
                    onClick={() => onThemeSelect?.(selectedTheme === ranking.theme ? null : ranking.theme)}
                  >
                    {/* Glow effect */}
                    {isHighlighted && !isBaseCase && (
                      <rect
                        x={x - boxWidth / 2 - 4}
                        y={y - boxHeight / 2 - 4}
                        width={boxWidth + 8}
                        height={boxHeight + 8}
                        rx={8}
                        fill={color}
                        fillOpacity={0.25}
                        className="transition-all duration-200"
                      />
                    )}

                    <rect
                      x={x - boxWidth / 2}
                      y={y - boxHeight / 2}
                      width={boxWidth}
                      height={boxHeight}
                      rx={isBaseCase ? 6 : 8}
                      fill={isBaseCase ? '#1e293b' : color}
                      fillOpacity={isDimmed ? 0.08 : isHighlighted ? 1 : 0.9}
                      stroke={isHighlighted ? '#fff' : isBaseCase ? '#334155' : 'none'}
                      strokeWidth={isHighlighted ? 2 : 1}
                      className="transition-all duration-200"
                    />

                    <text
                      x={x}
                      y={y + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={cn(
                        "font-semibold pointer-events-none select-none",
                        isDimmed ? "fill-muted-foreground" : isBaseCase ? "fill-slate-200" : "fill-white"
                      )}
                      style={{
                        fontSize: isBaseCase ? '11px' : '10px',
                        textShadow: isDimmed ? 'none' : '0 1px 2px rgba(0,0,0,0.5)'
                      }}
                    >
                      {displayText}
                    </text>

                    {/* Count badge on hover */}
                    {isHighlighted && !isBaseCase && (
                      <g>
                        <circle
                          cx={x + boxWidth / 2 - 4}
                          cy={y - boxHeight / 2 + 4}
                          r={10}
                          fill="white"
                          stroke={color}
                          strokeWidth={1.5}
                        />
                        <text
                          x={x + boxWidth / 2 - 4}
                          y={y - boxHeight / 2 + 5}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-foreground text-[9px] font-bold"
                        >
                          {ranking.count}
                        </text>
                      </g>
                    )}

                    {/* Tooltip for BASE CASE */}
                    {isHighlighted && isBaseCase && bc && (
                      <g>
                        <rect
                          x={x - 110}
                          y={y - boxHeight / 2 - 32}
                          width={220}
                          height={26}
                          rx={4}
                          fill="hsl(var(--popover))"
                          stroke="hsl(var(--border))"
                          strokeWidth={1}
                          className="drop-shadow-lg"
                        />
                        <text
                          x={x}
                          y={y - boxHeight / 2 - 15}
                          textAnchor="middle"
                          className="fill-popover-foreground text-[11px] font-medium"
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
