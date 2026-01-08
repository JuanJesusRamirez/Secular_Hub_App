"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { OverviewResponse } from "@/lib/db/queries";

interface AnalyticsGridProps {
  data: OverviewResponse | null;
  isLoading?: boolean;
}

export function AnalyticsGrid({ data, isLoading }: AnalyticsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="min-h-[160px]">
            <CardContent className="p-6 flex flex-col items-center justify-center h-full">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-20 w-20 rounded-full mb-3" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Determine conviction gauge color
  const getConvictionColor = (index: number): "green" | "yellow" | "gray" => {
    if (index > 70) return "green";
    if (index >= 40) return "yellow";
    return "gray";
  };

  // Calculate institution change
  const institutionChange = data.prevYearInstitutionCount
    ? data.institutionCount - data.prevYearInstitutionCount
    : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {/* Tile 1: Consensus Conviction Index */}
      <StatCard
        variant="gauge"
        title="Conviction Index"
        value={data.convictionIndex}
        gaugeColor={getConvictionColor(data.convictionIndex)}
        subtitle={data.convictionLabel}
      />

      {/* Tile 2: Institutional Coverage */}
      <StatCard
        variant="highlight"
        title="Active Institutions"
        value={data.institutionCount}
        subtitle={
          institutionChange !== null
            ? `${institutionChange >= 0 ? "+" : ""}${institutionChange} vs prev year`
            : undefined
        }
        icon={<Building2 className="h-5 w-5 text-emerald-500" />}
      />

      {/* Tile 3: Total Outlook Calls */}
      <StatCard
        variant="highlight"
        title="Total Calls"
        value={data.totalCalls}
        subtitle={`For ${data.year}`}
      />
    </div>
  );
}

export function AnalyticsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="min-h-[160px] animate-pulse">
          <CardContent className="p-6 flex flex-col items-center justify-center h-full">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-20 w-20 rounded-full mb-3" />
            <Skeleton className="h-4 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
