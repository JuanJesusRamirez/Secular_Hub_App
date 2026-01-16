"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OverviewResponse } from "@/lib/db/queries";

interface ExecutiveBriefingProps {
  data: OverviewResponse | null;
  isLoading?: boolean;
  onThemeClick?: (theme: string) => void;
}

export function ExecutiveBriefing({ data, isLoading, onThemeClick }: ExecutiveBriefingProps) {
  if (isLoading) {
    return (
      <Card className="min-h-[300px]">
        <CardContent className="p-6 flex flex-col justify-center">
          <Skeleton className="h-4 w-20 mb-4" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <div className="flex gap-6">
            <Skeleton className="h-40 flex-1" />
            <div className="w-48 space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="min-h-[300px]">
        <CardContent className="p-6 flex items-center justify-center">
          <span className="text-muted-foreground">No data available</span>
        </CardContent>
      </Card>
    );
  }

  const subtitle = data.briefing?.subtitle ?? `${data.year} Market Outlook`;
  const narrative = data.briefing?.narrative ??
    `Analysis based on ${data.totalCalls} outlook calls from ${data.institutionCount} institutions.`;

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-sm border-none">
      <CardContent className="p-6">
        {/* Header Area */}
        <div className="mb-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
            {data.year}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
            {subtitle}
          </h1>
        </div>

        {/* Content Area with Narrative */}
        <div className="flex-1">
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {narrative}
          </p>
        </div>

        {/* Footer stats */}
        <p className="text-[10px] text-muted-foreground mt-4 pt-3 border-t border-border/50">
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
