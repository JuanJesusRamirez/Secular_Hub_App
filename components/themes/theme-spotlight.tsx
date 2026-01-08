"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeRanking } from '@/lib/db/queries';
import { TrendingUp, TrendingDown, Minus, X } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ThemeSpotlightProps {
  theme: string;
  rankings: ThemeRanking[];
  onClose?: () => void;
  className?: string;
}

export function ThemeSpotlight({ theme, rankings, onClose, className }: ThemeSpotlightProps) {
  const themeData = useMemo(() => {
    const data = rankings.filter(r => r.theme === theme).sort((a, b) => a.year - b.year);
    if (data.length === 0) return null;

    const type = data[0].type;
    const category = data[0].category;
    const totalCalls = data.reduce((sum, r) => sum + r.count, 0);
    const peakYear = data.reduce((best, r) => r.rank < best.rank ? r : best, data[0]);
    const lowestYear = data.reduce((worst, r) => r.rank > worst.rank ? r : worst, data[0]);

    // Calculate trend (first year vs last year)
    const firstRank = data[0].rank;
    const lastRank = data[data.length - 1].rank;
    const trend = firstRank - lastRank; // Positive = improved (lower rank is better)

    return {
      type,
      category,
      totalCalls,
      peakYear,
      lowestYear,
      trend,
      journey: data
    };
  }, [theme, rankings]);

  if (!themeData) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="py-8 text-center text-muted-foreground">
          Select a theme from the chart to see details
        </CardContent>
      </Card>
    );
  }

  const { type, category, totalCalls, peakYear, lowestYear, trend, journey } = themeData;

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-500';
  const trendText = trend > 0 ? 'Rising' : trend < 0 ? 'Declining' : 'Stable';

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-bold">{theme}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={type === 'MACRO' ? 'default' : 'secondary'}>
                {type}
              </Badge>
              <span className="text-sm text-muted-foreground">{category}</span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">{totalCalls}</div>
            <div className="text-xs text-muted-foreground">Total Calls</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">#{peakYear.rank}</div>
            <div className="text-xs text-muted-foreground">Peak ({peakYear.year})</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className={cn("text-2xl font-bold flex items-center justify-center gap-1", trendColor)}>
              <TrendIcon className="h-5 w-5" />
            </div>
            <div className="text-xs text-muted-foreground">{trendText}</div>
          </div>
        </div>

        {/* Journey Timeline */}
        <div>
          <h4 className="text-sm font-medium mb-2">Ranking Journey</h4>
          <div className="space-y-1">
            {journey.map((r, i) => {
              const prevRank = i > 0 ? journey[i - 1].rank : r.rank;
              const change = prevRank - r.rank;

              return (
                <div
                  key={r.year}
                  className="flex items-center gap-3 text-sm py-1.5 px-2 rounded hover:bg-muted/50"
                >
                  <span className="font-mono w-12 text-muted-foreground">{r.year}</span>
                  <span className={cn(
                    "font-bold w-8",
                    r.rank === 0 && "text-blue-500"
                  )}>
                    #{r.rank}
                  </span>
                  <div className="flex-1 flex items-center gap-2">
                    <div
                      className="h-2 bg-blue-500/20 rounded-full"
                      style={{ width: `${Math.min(r.count * 2, 100)}%` }}
                    >
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min(r.count / 2, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-16">
                      {r.count} calls
                    </span>
                  </div>
                  {i > 0 && change !== 0 && (
                    <span className={cn(
                      "text-xs font-medium",
                      change > 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {change > 0 ? `+${change}` : change}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Narrative */}
        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground">
            {theme === 'BASE CASE' ? (
              <>The anchor theme representing Bloomberg's central market scenario each year.</>
            ) : trend > 2 ? (
              <>This theme has <strong className="text-green-500">risen significantly</strong> in importance, moving from #{journey[0].rank} in {journey[0].year} to #{journey[journey.length - 1].rank} in {journey[journey.length - 1].year}.</>
            ) : trend < -2 ? (
              <>This theme has <strong className="text-red-500">declined</strong> in focus, dropping from #{journey[0].rank} in {journey[0].year} to #{journey[journey.length - 1].rank} in {journey[journey.length - 1].year}.</>
            ) : (
              <>This theme has remained relatively stable in Wall Street's attention over the years.</>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
