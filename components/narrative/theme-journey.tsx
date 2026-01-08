"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ThemeRanking } from '@/lib/db/queries';
import { getSemanticColor, getThemeCategory, CATEGORY_INFO, SEMANTIC_PALETTE } from '@/lib/data/semantic-colors';
import { NARRATIVE_EVENTS, NarrativeEvent } from '@/lib/data/narrative-events';
import { X, TrendingUp, TrendingDown, Minus, Flame, Star, AlertTriangle } from 'lucide-react';

interface ThemeJourneyProps {
  theme: string;
  rankings: ThemeRanking[];
  onClose?: () => void;
  className?: string;
}

export function ThemeJourney({
  theme,
  rankings,
  onClose,
  className
}: ThemeJourneyProps) {
  const themeData = useMemo(() => {
    const themeRankings = rankings
      .filter(r => r.theme === theme)
      .sort((a, b) => a.year - b.year);

    if (themeRankings.length === 0) return null;

    const color = getSemanticColor(theme);
    const category = getThemeCategory(theme);
    const categoryInfo = CATEGORY_INFO[category];
    const palette = SEMANTIC_PALETTE[category];

    // Calculate stats
    const totalCalls = themeRankings.reduce((sum, r) => sum + r.count, 0);
    const peakYearData = themeRankings.reduce((peak, r) =>
      (r.rank > 0 && r.rank < peak.rank) || peak.rank === 0 ? r : peak,
      themeRankings[0]);
    const worstYearData = themeRankings.reduce((worst, r) =>
      r.rank > worst.rank ? r : worst,
      themeRankings[0]);

    const firstRank = themeRankings[0].rank;
    const lastRank = themeRankings[themeRankings.length - 1].rank;
    const trend = firstRank - lastRank; // positive = improved

    const yearsInTop3 = themeRankings.filter(r => r.rank > 0 && r.rank <= 3).length;
    const yearsInTop5 = themeRankings.filter(r => r.rank > 0 && r.rank <= 5).length;

    // Find related events
    const relatedEvents = NARRATIVE_EVENTS.filter(e =>
      e.themesAffected.includes(theme)
    );

    // Calculate year-over-year changes
    const yearlyChanges = themeRankings.map((r, i) => {
      if (i === 0) return { ...r, change: 0 };
      const prevRank = themeRankings[i - 1].rank;
      return { ...r, change: prevRank - r.rank }; // positive = improved
    });

    return {
      theme,
      color,
      category,
      categoryInfo,
      palette,
      rankings: themeRankings,
      yearlyChanges,
      totalCalls,
      peakYear: peakYearData.year,
      peakRank: peakYearData.rank,
      worstYear: worstYearData.year,
      worstRank: worstYearData.rank,
      trend,
      yearsInTop3,
      yearsInTop5,
      totalYears: themeRankings.length,
      relatedEvents,
    };
  }, [theme, rankings]);

  if (!themeData) return null;

  const maxCount = Math.max(...themeData.rankings.map(r => r.count));

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {/* Color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: themeData.color }}
      />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle
                className="text-xl"
                style={{ color: themeData.color }}
              >
                {theme}
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {themeData.categoryInfo.name}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {themeData.categoryInfo.description}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Stats Grid */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="text-lg font-bold">{themeData.totalCalls}</div>
            <div className="text-[10px] text-muted-foreground">Total Calls</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="text-lg font-bold">
              #{themeData.peakRank}
              <span className="text-xs text-muted-foreground ml-1">({themeData.peakYear})</span>
            </div>
            <div className="text-[10px] text-muted-foreground">Peak Rank</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-1">
              {themeData.trend > 2 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : themeData.trend < -2 ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : (
                <Minus className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={cn(
                "text-lg font-bold",
                themeData.trend > 2 ? "text-green-600" :
                themeData.trend < -2 ? "text-red-600" : ""
              )}>
                {themeData.trend > 0 ? '+' : ''}{themeData.trend}
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground">Net Change</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="text-lg font-bold">
              {themeData.yearsInTop5}/{themeData.totalYears}
            </div>
            <div className="text-[10px] text-muted-foreground">Years in Top 5</div>
          </div>
        </div>

        {/* Sparkline / Mini Timeline */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Ranking Journey</span>
            <span className="text-muted-foreground">
              {themeData.rankings[0].year} - {themeData.rankings[themeData.rankings.length - 1].year}
            </span>
          </div>

          {/* Mini rank sparkline */}
          <div className="flex items-end gap-1 h-12 px-1">
            {themeData.yearlyChanges.map((r, i) => {
              const heightPct = ((11 - r.rank) / 10) * 100; // Invert so rank 1 is tallest
              const isFirst = i === 0;
              const isLast = i === themeData.yearlyChanges.length - 1;

              return (
                <div
                  key={r.year}
                  className="flex-1 flex flex-col items-center gap-0.5"
                  title={`${r.year}: Rank #${r.rank} (${r.count} calls)`}
                >
                  <div
                    className="w-full rounded-t transition-all duration-300"
                    style={{
                      height: `${Math.max(10, heightPct)}%`,
                      backgroundColor: themeData.color,
                      opacity: r.rank <= 3 ? 1 : r.rank <= 5 ? 0.7 : 0.4,
                    }}
                  />
                  <span className="text-[8px] text-muted-foreground">
                    {r.year.toString().slice(-2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Yearly Breakdown */}
        <div className="space-y-1.5">
          <div className="text-xs font-medium">Year by Year</div>
          <div className="space-y-1">
            {themeData.yearlyChanges.map((r) => (
              <div
                key={r.year}
                className="flex items-center gap-2 text-xs"
              >
                <span className="w-10 text-muted-foreground">{r.year}</span>
                <div className="flex items-center gap-1 w-10">
                  {r.rank <= 3 && <Star className="h-3 w-3 text-amber-500" />}
                  <span className={cn(
                    "font-mono font-bold",
                    r.rank === 1 ? "text-amber-600" :
                    r.rank <= 3 ? "text-foreground" : "text-muted-foreground"
                  )}>
                    #{r.rank}
                  </span>
                </div>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(r.count / maxCount) * 100}%`,
                      backgroundColor: themeData.color,
                    }}
                  />
                </div>
                <span className="w-8 text-right text-muted-foreground">{r.count}</span>
                {r.change !== 0 && (
                  <span className={cn(
                    "w-6 text-right text-[10px] font-medium",
                    r.change > 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {r.change > 0 ? '+' : ''}{r.change}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Related Events */}
        {themeData.relatedEvents.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-1 text-xs font-medium">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              Key Events Affecting This Theme
            </div>
            <div className="space-y-1">
              {themeData.relatedEvents.map((event) => (
                <div
                  key={event.year}
                  className="flex items-center gap-2 text-xs p-1.5 rounded bg-muted/30"
                >
                  <span className="font-mono text-muted-foreground">{event.year}</span>
                  <span className="font-medium">{event.label}</span>
                  <span className="text-muted-foreground">- {event.impact}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Narrative Summary */}
        <div className="text-xs text-muted-foreground leading-relaxed pt-2 border-t">
          {theme === 'BASE CASE' ? (
            <span>The <strong className="text-foreground">BASE CASE</strong> represents Bloomberg's editorially-identified consensus scenario for each year - the anchor around which all other themes are ranked.</span>
          ) : themeData.trend > 3 ? (
            <span><strong className="text-foreground">{theme}</strong> showed significant momentum, rising {themeData.trend} ranks from #{themeData.rankings[0].rank} in {themeData.rankings[0].year} to #{themeData.rankings[themeData.rankings.length - 1].rank} by {themeData.rankings[themeData.rankings.length - 1].year}. {themeData.yearsInTop3 > 0 && `Reached top 3 in ${themeData.yearsInTop3} year${themeData.yearsInTop3 > 1 ? 's' : ''}.`}</span>
          ) : themeData.trend < -3 ? (
            <span><strong className="text-foreground">{theme}</strong> declined in prominence, falling {Math.abs(themeData.trend)} ranks over the period. Peak attention was in {themeData.peakYear} at #{themeData.peakRank}.</span>
          ) : (
            <span><strong className="text-foreground">{theme}</strong> remained relatively stable in Wall Street's thematic focus, averaging rank #{Math.round(themeData.rankings.reduce((sum, r) => sum + r.rank, 0) / themeData.rankings.length)} across {themeData.totalYears} years.</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
