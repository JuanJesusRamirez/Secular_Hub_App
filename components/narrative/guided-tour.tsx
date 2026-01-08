"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeRanking } from '@/lib/db/queries';
import { getSemanticColor } from '@/lib/data/semantic-colors';
import { NARRATIVE_ERAS, NARRATIVE_EVENTS } from '@/lib/data/narrative-events';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';

const EXCLUDED_THEMES = ['RISKS'];

interface TourStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  years: number[];
  highlightThemes: string[];
  focusYear?: number;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'intro',
    title: '8 Years of Wall Street Consensus',
    subtitle: '2019 - 2026',
    description: 'This visualization tracks how the dominant investment narratives have evolved over eight years, based on Bloomberg\'s annual compilation of Wall Street outlooks.',
    years: [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
    highlightThemes: [],
  },
  {
    id: 'late-cycle',
    title: 'Late Cycle Jitters',
    subtitle: '2019',
    description: 'The yield curve inverted in August 2019, triggering recession fears. Wall Street debated whether the long post-GFC expansion was finally ending.',
    years: [2019],
    highlightThemes: ['RECESSION', 'SLOWDOWN', 'GROWTH'],
    focusYear: 2019,
  },
  {
    id: 'covid-shock',
    title: 'The Pandemic Shock',
    subtitle: '2020',
    description: 'COVID-19 reshuffled everything. Unprecedented fiscal and monetary stimulus was deployed. The consensus fractured as uncertainty peaked.',
    years: [2020],
    highlightThemes: ['COVID', 'FISCAL', 'MONETARY POLICY', 'VOLATILITY'],
    focusYear: 2020,
  },
  {
    id: 'inflation-rises',
    title: 'Inflation Arrives',
    subtitle: '2021 - 2022',
    description: 'Supply chains broke. Prices surged. The "transitory" debate raged until the Fed pivoted hawkish and began the fastest rate hike cycle in 40 years.',
    years: [2021, 2022],
    highlightThemes: ['INFLATION', 'MONETARY POLICY', 'SUPPLY CHAIN'],
    focusYear: 2022,
  },
  {
    id: 'the-pivot',
    title: 'The Great Pivot',
    subtitle: '2023 - 2024',
    description: 'From banking crisis fears to soft landing optimism. As inflation cooled without recession, consensus formed around rate cuts and economic resilience.',
    years: [2023, 2024],
    highlightThemes: ['SOFT LANDING', 'RATE CUTS', 'RECESSION'],
    focusYear: 2024,
  },
  {
    id: 'new-era',
    title: 'The New Regime',
    subtitle: '2025 - 2026',
    description: 'AI emerges as the defining theme. Political uncertainty returns with tariffs and trade tensions. A new investment regime takes shape.',
    years: [2025, 2026],
    highlightThemes: ['AI', 'TARIFFS', 'TRADE', 'GROWTH'],
    focusYear: 2026,
  },
  {
    id: 'explore',
    title: 'Explore the Full Journey',
    subtitle: 'Your Turn',
    description: 'Click on any theme to see its complete trajectory. Filter by category. Discover the patterns in how Wall Street\'s focus has evolved.',
    years: [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
    highlightThemes: [],
  },
];

interface GuidedTourProps {
  rankings: ThemeRanking[];
  years: number[];
  baseCases: { year: number; subtitle: string }[];
  onComplete?: () => void;
  className?: string;
}

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

export function GuidedTour({
  rankings,
  years,
  baseCases,
  onComplete,
  className
}: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const step = TOUR_STEPS[currentStep];

  // Filter rankings for current step
  const filteredRankings = useMemo(() => {
    const result: ThemeRanking[] = [];
    const stepYears = step.years;

    stepYears.forEach(year => {
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
  }, [rankings, step.years]);

  // Build grid data
  const { gridData, maxRank } = useMemo(() => {
    const gridData: Record<number, Record<number, ThemeRanking | null>> = {};
    let maxRank = 0;

    step.years.forEach(year => {
      gridData[year] = {};
      const yearRankings = filteredRankings.filter(r => r.year === year);
      yearRankings.forEach(r => {
        gridData[year][r.rank] = r;
        if (r.rank > maxRank) maxRank = r.rank;
      });
    });

    return { gridData, maxRank: Math.max(maxRank, 10) };
  }, [filteredRankings, step.years]);

  // Layout
  const cellWidth = 150;
  const cellHeight = 50;
  const headerHeight = 60;
  const rankLabelWidth = 90;

  const svgWidth = rankLabelWidth + step.years.length * cellWidth;
  const svgHeight = headerHeight + (maxRank + 1) * cellHeight + 20;

  const getX = (yearIndex: number) => rankLabelWidth + yearIndex * cellWidth + cellWidth / 2;
  const getY = (rank: number) => headerHeight + rank * cellHeight + cellHeight / 2;

  const goNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const restart = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {TOUR_STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                i === currentStep
                  ? "w-6 bg-primary"
                  : i < currentStep
                    ? "bg-primary/50"
                    : "bg-muted"
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={restart}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goPrev} disabled={currentStep === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goNext}>
            {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Step Content */}
      <Card className="overflow-hidden">
        {/* Step Header */}
        <div className="bg-gradient-to-r from-primary/10 to-transparent p-4 border-b">
          <div className="text-xs text-primary font-medium uppercase tracking-wide">
            {step.subtitle}
          </div>
          <h3 className="text-xl font-bold mt-1">{step.title}</h3>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {step.description}
          </p>
          {step.highlightThemes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {step.highlightThemes.map(theme => (
                <span
                  key={theme}
                  className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                  style={{ backgroundColor: getSemanticColor(theme) }}
                >
                  {theme}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Mini Chart */}
        <CardContent className="py-4 px-2 overflow-x-auto">
          <svg width={svgWidth} height={svgHeight} className="min-w-full">
            {/* Year Headers */}
            {step.years.map((year, i) => {
              const isFocus = step.focusYear === year;
              return (
                <g key={year}>
                  {isFocus && (
                    <rect
                      x={getX(i) - cellWidth / 2}
                      y={0}
                      width={cellWidth}
                      height={svgHeight}
                      fill="hsl(var(--primary) / 0.05)"
                    />
                  )}
                  <text
                    x={getX(i)}
                    y={35}
                    textAnchor="middle"
                    className={cn(
                      "text-base",
                      isFocus ? "fill-primary font-bold" : "fill-foreground font-medium"
                    )}
                  >
                    {year}
                  </text>
                </g>
              );
            })}

            {/* Rank Labels */}
            {Array.from({ length: maxRank + 1 }, (_, rank) => (
              <text
                key={rank}
                x={rankLabelWidth - 8}
                y={getY(rank) + 4}
                textAnchor="end"
                className="fill-muted-foreground text-xs font-medium"
              >
                {rank === 0 ? 'BASE' : rank}
              </text>
            ))}

            {/* Theme Blocks */}
            {step.years.map((year, yearIndex) => (
              <g key={year}>
                {Array.from({ length: maxRank + 1 }, (_, rank) => {
                  const ranking = gridData[year]?.[rank];
                  if (!ranking) return null;

                  const color = getSemanticColor(ranking.theme);
                  const isHighlighted = step.highlightThemes.includes(ranking.theme);
                  const isDimmed = step.highlightThemes.length > 0 && !isHighlighted && ranking.theme !== 'BASE CASE';
                  const isBaseCase = ranking.theme === 'BASE CASE';

                  const x = getX(yearIndex);
                  const y = getY(rank);
                  const boxWidth = cellWidth - 10;
                  const boxHeight = cellHeight - 8;

                  const bc = baseCases.find(b => b.year === year);
                  const displayText = isBaseCase && bc
                    ? abbreviateSubtitle(bc.subtitle)
                    : abbreviateTheme(ranking.theme);

                  return (
                    <g key={`${year}-${rank}`}>
                      <rect
                        x={x - boxWidth / 2}
                        y={y - boxHeight / 2}
                        width={boxWidth}
                        height={boxHeight}
                        rx={4}
                        fill={isBaseCase ? '#1e293b' : color}
                        fillOpacity={isDimmed ? 0.15 : isHighlighted ? 1 : 0.8}
                        stroke={isHighlighted ? '#fff' : 'none'}
                        strokeWidth={2}
                        className="transition-all duration-500"
                      />
                      <text
                        x={x}
                        y={y + 1}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className={cn(
                          "text-[10px] font-semibold pointer-events-none",
                          isDimmed ? "fill-muted-foreground/50" : isBaseCase ? "fill-slate-300" : "fill-white"
                        )}
                        style={{ textShadow: isDimmed ? 'none' : '0 1px 2px rgba(0,0,0,0.4)' }}
                      >
                        {displayText}
                      </text>
                    </g>
                  );
                })}
              </g>
            ))}
          </svg>
        </CardContent>
      </Card>

      {/* Navigation Hint */}
      <div className="text-center text-xs text-muted-foreground">
        Step {currentStep + 1} of {TOUR_STEPS.length}
        {currentStep === TOUR_STEPS.length - 1 && (
          <span className="ml-2">- Click &quot;Finish&quot; to explore freely</span>
        )}
      </div>
    </div>
  );
}
