"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { OverviewResponse } from "@/lib/db/queries";

interface ExecutiveBriefingProps {
  data: OverviewResponse | null;
  isLoading?: boolean;
}

export function ExecutiveBriefing({ data, isLoading }: ExecutiveBriefingProps) {
  if (isLoading) {
    return (
      <Card className="min-h-[400px]">
        <CardContent className="p-8 flex flex-col justify-center">
          <Skeleton className="h-4 w-20 mb-4" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-24 w-full mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="min-h-[400px]">
        <CardContent className="p-8 flex items-center justify-center">
          <span className="text-muted-foreground">No data available</span>
        </CardContent>
      </Card>
    );
  }

  const subtitle = data.briefing?.subtitle ?? `${data.year} Market Outlook`;
  const narrative = data.briefing?.narrative ??
    `Analysis based on ${data.totalCalls} outlook calls from ${data.institutionCount} institutions.`;

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <CardContent className="p-8">
        {/* Year eyebrow */}
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
          {data.year}
        </span>

        {/* Main headline (subtitle) */}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight">
          {subtitle}
        </h1>

        {/* Narrative paragraph */}
        <p className="text-base text-muted-foreground mb-8 max-w-4xl leading-relaxed">
          {narrative}
        </p>

        {/* Top Themes */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Top Themes
          </span>
          <div className="flex flex-wrap gap-2">
            {data.topThemes.map((themeData, index) => (
              <Badge
                key={themeData.theme}
                className={`text-sm py-1 px-3 ${
                  index === 0
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {themeData.theme}
              </Badge>
            ))}
            {data.topThemes.length === 0 && (
              <span className="text-sm text-muted-foreground italic">No themes data available</span>
            )}
          </div>
        </div>

        {/* Footer stats */}
        <p className="text-xs text-muted-foreground mt-6 pt-4 border-t border-border/50">
          Based on {data.totalCalls} outlook calls from {data.institutionCount} institutions
        </p>
      </CardContent>
    </Card>
  );
}

export function ExecutiveBriefingSkeleton() {
  return (
    <Card className="min-h-[400px]">
      <CardContent className="p-8 flex flex-col justify-center animate-pulse">
        <Skeleton className="h-4 w-20 mb-4" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-24 w-full mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}
