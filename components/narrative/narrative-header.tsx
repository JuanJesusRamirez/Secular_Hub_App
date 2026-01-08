"use client";

import { useMemo } from 'react';
import { ThemeRanking } from '@/lib/db/queries';
import { getSemanticColor, getThemeCategory, CATEGORY_INFO } from '@/lib/data/semantic-colors';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';

interface NarrativeHeaderProps {
  selectedTheme: string | null;
  rankings: ThemeRanking[];
  baseCases: { year: number; subtitle: string }[];
  years: number[];
}

export function NarrativeHeader({
  selectedTheme,
  rankings,
  baseCases,
  years
}: NarrativeHeaderProps) {
  // Calculate dynamic headline based on selection
  const headline = useMemo(() => {
    if (selectedTheme && selectedTheme !== 'BASE CASE') {
      // Theme-specific headline
      const themeRankings = rankings
        .filter(r => r.theme === selectedTheme)
        .sort((a, b) => a.year - b.year);

      if (themeRankings.length === 0) return null;

      const firstYear = themeRankings[0];
      const lastYear = themeRankings[themeRankings.length - 1];
      const peakYear = themeRankings.reduce((peak, r) =>
        r.rank < peak.rank ? r : peak, themeRankings[0]);

      const trend = firstYear.rank - lastYear.rank; // positive = improved
      const trendWord = trend > 2 ? 'Rising' : trend < -2 ? 'Declining' : 'Stable';

      return {
        type: 'theme' as const,
        theme: selectedTheme,
        firstRank: firstYear.rank,
        firstYear: firstYear.year,
        lastRank: lastYear.rank,
        lastYear: lastYear.year,
        peakRank: peakYear.rank,
        peakYear: peakYear.year,
        trend,
        trendWord,
        yearsInTop5: themeRankings.filter(r => r.rank <= 5 && r.rank > 0).length,
        totalYears: themeRankings.length,
      };
    }

    // Default narrative headline
    const firstYear = Math.min(...years);
    const lastYear = Math.max(...years);
    const firstBaseCase = baseCases.find(b => b.year === firstYear);
    const lastBaseCase = baseCases.find(b => b.year === lastYear);

    // Find dominant theme of last year (rank 1)
    const lastYearThemes = rankings.filter(r => r.year === lastYear && r.rank === 1);
    const dominantTheme = lastYearThemes[0]?.theme || 'Growth';

    return {
      type: 'overview' as const,
      firstYear,
      lastYear,
      firstSubtitle: firstBaseCase?.subtitle || '',
      lastSubtitle: lastBaseCase?.subtitle || '',
      dominantTheme,
      totalYears: years.length,
    };
  }, [selectedTheme, rankings, baseCases, years]);

  if (!headline) return null;

  if (headline.type === 'theme') {
    const color = getSemanticColor(headline.theme);
    const category = getThemeCategory(headline.theme);
    const categoryInfo = CATEGORY_INFO[category];

    return (
      <div className="bg-gradient-to-r from-muted/50 to-transparent rounded-lg p-4 border-l-4" style={{ borderLeftColor: color }}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="text-2xl font-bold"
                style={{ color }}
              >
                {headline.theme}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {categoryInfo.name}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              From <span className="font-semibold text-foreground">#{headline.firstRank}</span> in {headline.firstYear}
              <ArrowRight className="inline h-3 w-3 mx-1" />
              <span className="font-semibold text-foreground">#{headline.lastRank}</span> in {headline.lastYear}
              {headline.peakRank <= 3 && (
                <span className="ml-2">
                  (Peak: #{headline.peakRank} in {headline.peakYear})
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {headline.trend > 2 ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : headline.trend < -2 ? (
              <TrendingDown className="h-5 w-5 text-red-500" />
            ) : (
              <Minus className="h-5 w-5 text-muted-foreground" />
            )}
            <span className={
              headline.trend > 2 ? 'text-green-600 font-semibold' :
              headline.trend < -2 ? 'text-red-600 font-semibold' :
              'text-muted-foreground'
            }>
              {headline.trendWord}
            </span>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          In Top 5: <span className="font-medium text-foreground">{headline.yearsInTop5}</span> of {headline.totalYears} years
        </div>
      </div>
    );
  }

  // Overview headline
  return (
    <div className="bg-gradient-to-r from-primary/10 via-transparent to-transparent rounded-lg p-4 border-l-4 border-primary">
      <h2 className="text-lg font-bold text-foreground leading-tight">
        From <span className="text-primary">{headline.firstSubtitle || 'Late Cycle'}</span> ({headline.firstYear})
        {' '}to{' '}
        <span className="text-primary">{headline.lastSubtitle || 'New Era'}</span> ({headline.lastYear})
      </h2>
      <p className="text-sm text-muted-foreground mt-1">
        {headline.totalYears} years of Wall Street consensus captured.
        {headline.dominantTheme && (
          <span>
            {' '}<span className="font-medium text-foreground">{headline.dominantTheme}</span> emerges as the defining theme of {headline.lastYear}.
          </span>
        )}
      </p>
    </div>
  );
}
