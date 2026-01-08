"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ThemeRanking } from '@/lib/db/queries';

// Themes to exclude from the bump chart (RISKS will be in separate section)
const EXCLUDED_THEMES = ['RISKS'];

// --- Semantic Color Palette ---
const SEMANTIC_PALETTE = {
  MACRO: {
    primary: '#3b82f6', // blue-500
    // Sub-variants for specific themes if needed, otherwise maps to primary
    'GROWTH': '#22c55e',         // green-500 (Growth is positive macro)
    'RECESSION': '#ef4444',      // red-500 (Recession is negative macro)
    'INFLATION': '#f97316',      // orange-500
  },
  POLICY: {
    primary: '#8b5cf6', // violet-500
    'MONETARY POLICY': '#8b5cf6',
    'FISCAL': '#6366f1',
  },
  THEMATIC: {
    primary: '#d946ef', // fuchsia-500
    'AI': '#be185d',    // pink-700 (Special highlight for AI)
    'POLITICS': '#db2777',
  },
  RISK: {
    primary: '#dc2626', // red-600
  },
  DEFAULT: '#94a3b8' // slate-400
};

// Map specific themes to their category color if defined, else generic category
const getThemeCategoryColor = (theme: string, category: string = 'MACRO'): string => {
  // Direct overrides first
  if (theme === 'AI') return SEMANTIC_PALETTE.THEMATIC['AI'];
  if (theme === 'GROWTH') return SEMANTIC_PALETTE.MACRO['GROWTH'];
  if (theme === 'RECESSION') return SEMANTIC_PALETTE.MACRO['RECESSION'];
  if (theme === 'INFLATION') return SEMANTIC_PALETTE.MACRO['INFLATION'];

  // Fallback to category
  if (category?.includes('Policy')) return SEMANTIC_PALETTE.POLICY.primary;
  if (category?.includes('Macro')) return SEMANTIC_PALETTE.MACRO.primary;
  
  return SEMANTIC_PALETTE.THEMATIC.primary;
};

// Era Background Definitions
const ERAS = [
  { start: 2019, end: 2020, label: "Late Cycle", color: "rgba(59, 130, 246, 0.05)" },
  { start: 2020, end: 2021, label: "COVID Shock", color: "rgba(239, 68, 68, 0.05)" },
  { start: 2021, end: 2023, label: "Inflation Crisis", color: "rgba(249, 115, 22, 0.05)" },
  { start: 2023, end: 2026, label: "The New Normal", color: "rgba(16, 185, 129, 0.05)" },
];

interface EvolutionChartProps {
  rankings: ThemeRanking[];
  years: number[];
  baseCases: { year: number; subtitle: string }[];
  onThemeSelect?: (theme: string | null) => void;
  selectedTheme?: string | null;
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

export function EvolutionChart({
  rankings,
  years,
  baseCases,
  onThemeSelect,
  selectedTheme,
  className
}: EvolutionChartProps) {
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);

  // Filter out excluded themes and recalculate ranks (no gaps)
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

  const maxRank = Math.max(...Object.values(maxRankPerYear), 10);
  const cellWidth = 160;   // Wider for better readability
  const cellHeight = 60;   // Taller for larger bubbles
  const headerHeight = 60; // More space for Era labels
  const rankLabelWidth = 85;

  const svgWidth = rankLabelWidth + years.length * cellWidth;
  const svgHeight = headerHeight + (maxRank + 1) * cellHeight + 20;

  const getX = (yearIndex: number) => rankLabelWidth + yearIndex * cellWidth + cellWidth / 2;
  const getY = (rank: number) => headerHeight + rank * cellHeight + cellHeight / 2;

  // Scaling function for node size based on count
  const getNodeSize = (count: number) => {
    const minSize = 25; // Base case rectangular box height
    const maxSize = 55;
    // Simple linear scale relative to maxCount in dataset
    const scaled = (count / maxCount) * (maxSize - minSize) + minSize;
    return Math.min(maxSize, Math.max(minSize, scaled)); 
  };

  return (
    <Card className={cn("flex flex-col overflow-hidden bg-slate-950/20 backdrop-blur-sm border-slate-800", className)}>
      <CardContent className="flex-1 overflow-x-auto py-6 px-4">
        <svg width={svgWidth} height={svgHeight} className="min-w-full">
          
          {/* Era Backgrounds */}
          {ERAS.map((era, i) => {
             const startIdx = years.indexOf(era.start);
             const endIdx = years.indexOf(era.end);
             
             // Only render if era falls within our years range
             if (startIdx === -1) return null;
             
             const effectiveEndIdx = endIdx === -1 ? years.length - 1 : endIdx;
             
             // Calculate x and width
             const startX = getX(startIdx) - cellWidth / 2;
             const endX = getX(effectiveEndIdx) + cellWidth / 2;
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
                   y={15}
                   textAnchor="middle"
                   className="fill-muted-foreground/50 text-[10px] uppercase tracking-widest font-bold"
                 >
                   {era.label}
                 </text>
               </g>
             );
          })}


          {/* Header row with years */}
          {years.map((year, i) => (
            <text
              key={year}
              x={getX(i)}
              y={45} // Pushed down below Era label
              textAnchor="middle"
              className="fill-foreground font-bold text-lg"
            >
              {year}
            </text>
          ))}

          {/* Connection lines */}
          {allThemes.map(theme => {
            if (theme === 'BASE CASE') return null;
            const connections = getThemeConnections(theme);
            if (connections.length === 0) return null;

            // Get color from one of the nodes (approximate)
            const representativeRanking = filteredRankings.find(r => r.theme === theme);
            const color = getThemeCategoryColor(theme, representativeRanking?.category);
            
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
                      strokeOpacity={isDimmed ? 0.05 : isHighlighted ? 0.8 : 0.3} // Increased opacity
                      className="transition-all duration-300 ease-in-out"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Theme Nodes */}
          {years.map((year, yearIndex) => (
            <g key={year}>
              {Array.from({ length: maxRank + 1 }, (_, rank) => {
                const ranking = gridData[year]?.[rank];
                if (!ranking) return null;

                const color = getThemeCategoryColor(ranking.theme, ranking.category);
                const isHighlighted = selectedTheme === ranking.theme || hoveredTheme === ranking.theme;
                const isDimmed = (selectedTheme || hoveredTheme) && !isHighlighted;
                const isBaseCase = ranking.theme === 'BASE CASE';
                
                const x = getX(yearIndex);
                const y = getY(rank);
                
                // Variable sizing for non-base-case nodes
                // If Base Case, we prefer a wide pill
                const boxWidth = isBaseCase ? cellWidth - 10 : getNodeSize(ranking.count) * 2.5; 
                // Width for bubbles is roughly circular if we want bubbles, or pills?
                // Visual Audit said "Variable Node Size". Let's try Circles for themes, Rects for Base Case.
                
                const nodeRadius = isBaseCase ? 0 : Math.max(16, getNodeSize(ranking.count)); 

                // Get base case subtitle
                const bc = baseCases.find(b => b.year === year);
                const displayText = isBaseCase && bc ? abbreviateSubtitle(bc.subtitle) : ranking.theme;

                return (
                  <g
                    key={`${year}-${rank}`}
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredTheme(ranking.theme)}
                    onMouseLeave={() => setHoveredTheme(null)}
                    onClick={() => onThemeSelect?.(selectedTheme === ranking.theme ? null : ranking.theme)}
                  >
                    {isBaseCase ? (
                       // Base Case = Rectangular Pill
                       <rect
                         x={x - (cellWidth - 10) / 2}
                         y={y - 20}
                         width={cellWidth - 10}
                         height={40}
                         rx={6}
                         fill="#1e293b" // Slate-800
                         stroke={isHighlighted ? '#fff' : '#334155'}
                         strokeWidth={isHighlighted ? 2 : 1}
                         className="transition-all duration-200"
                       />
                    ) : (
                      // Theme = Circle / Bubble
                      <>
                        <circle
                          cx={x}
                          cy={y}
                          r={nodeRadius}
                          fill={color}
                          fillOpacity={isDimmed ? 0.1 : isHighlighted ? 1 : 0.8}
                          stroke={isHighlighted ? '#fff' : 'none'}
                          strokeWidth={2}
                          className="transition-all duration-300 ease-spring"
                        />
                        {/* Count badge (mini) */}
                        {isHighlighted && (
                           <circle cx={x + nodeRadius * 0.707} cy={y - nodeRadius * 0.707} r={8} fill="white" />
                        )}
                      </>
                    )}

                    <text
                      x={x}
                      y={y}
                      dy={isBaseCase ? 1 : 4} // Center vertically
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={cn(
                        "font-bold pointer-events-none select-none transition-all duration-200",
                        isBaseCase ? "text-[11px] fill-slate-200" : "text-[10px] fill-white",
                        // Hide text if bubble is too small and not highlighted? 
                        // For now keep visible but tiny
                        !isBaseCase && nodeRadius < 20 && !isHighlighted ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                      )}
                      style={{ 
                        textShadow: isDimmed ? 'none' : '0 1px 2px rgba(0,0,0,0.5)',
                        fontSize: isBaseCase ? '11px' : Math.max(9, nodeRadius / 2.5) // distinct sizing
                      }}
                    >
                      {/* Truncate text inside bubble if needed */}
                      {!isBaseCase && displayText.length > nodeRadius / 2 ? displayText.slice(0, 4) + '..' : displayText}
                    </text>
                    
                    {/* Tooltip-like popup on hover (SVG overlay) */}
                    {isHighlighted && !isBaseCase && (
                      <g pointerEvents="none">
                         <rect x={x - 50} y={y - nodeRadius - 35} width={100} height={30} rx={4} fill="#0f172a" stroke="#334155" />
                         <text x={x} y={y - nodeRadius - 16} textAnchor="middle" fill="white" fontSize={11} fontWeight="bold">
                           {ranking.theme} ({ranking.count})
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
