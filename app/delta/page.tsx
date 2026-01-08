"use client";

import { useDeltaData } from "@/lib/hooks/use-delta-data";
import { YearSelector } from "@/components/delta/year-selector";
import { DeltaStatRow } from "@/components/delta/delta-stat-row";
import { AiDeltaNarrative } from "@/components/delta/ai-delta-narrative";
import { ThemeSankey } from "@/components/delta/theme-sankey";
import { ConvictionShift } from "@/components/delta/conviction-shift";
import { InstitutionPivots } from "@/components/delta/institution-pivots";
import { useCompareYears } from "@/lib/hooks/use-compare-years";
import {
  getDeltaStats,
  mockSankeyData,
  mockConvictionShifts,
  mockInstitutionPivots,
} from "@/lib/mock-data";

export default function DeltaPage() {
  const { year1, year2 } = useCompareYears();
  const { comparison, institutions, aiNarrative, isLoading, error } = useDeltaData();

  // Parse years as numbers for stats display
  const y1 = parseInt(year1, 10);
  const y2 = parseInt(year2, 10);

  // Stats row - uses mock data generator with current years
  const stats = getDeltaStats(y1, y2);

  // Use API data if available, fallback to mock data for demo resilience
  const displaySankey = comparison?.sankey || mockSankeyData;
  const displayShifts = comparison?.shifts || mockConvictionShifts;
  const displayPivots = institutions?.pivots || mockInstitutionPivots;
  const displayNarrative = aiNarrative?.data || null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Year-over-Year Delta</h1>
            <p className="text-muted-foreground">Comparative analysis of outlooks from {year1} to {year2}</p>
        </div>
        <YearSelector />
      </div>

      {/* Stats Row */}
      <DeltaStatRow stats={stats} />

      {/* AI Narrative */}
      <AiDeltaNarrative narrative={displayNarrative} isLoading={isLoading && !displayNarrative} />

      {/* Theme Migration Flow */}
      <ThemeSankey data={displaySankey} />

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ConvictionShift shifts={displayShifts} />
        <InstitutionPivots pivots={displayPivots} />
      </div>
    </div>
  );
}
