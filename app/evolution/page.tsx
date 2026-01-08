"use client";

import { PageHeader } from "@/components/layout/page-header";
import { EvolutionChart } from "@/components/themes/evolution-chart";
import { ThemeSpotlight } from "@/components/themes/theme-spotlight";
import { useThemeRankings } from "@/lib/hooks/use-theme-rankings";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function EvolutionPage() {
  const {
    data,
    loading,
    error,
    selectedTheme,
    setSelectedTheme
  } = useThemeRankings({ topN: 15 }); // Increased N for more detail in the 'evolution' view

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Market Narrative Flow" 
          description="Advanced analysis of consensus evolution, conviction, and thematic clustering."
        />
        <Skeleton className="h-[750px] w-full bg-slate-900/10" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Market Narrative Flow" 
          description="Advanced analysis of consensus evolution, conviction, and thematic clustering."
        />
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {error || 'Failed to load theme data'}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-start justify-between">
         <PageHeader 
            title="Market Narrative Flow" 
            description="Visualizing the rise and fall of Wall Street consensus themes (2019-2026)."
         />
         <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full border">
            <Info className="h-3.5 w-3.5" />
            <span>Bubble size = Consensus Conviction</span>
         </div>
      </div>

      {/* Main Evolution Chart */}
      <EvolutionChart
        rankings={data.rankings}
        years={data.years}
        baseCases={data.baseCases}
        selectedTheme={selectedTheme}
        onThemeSelect={setSelectedTheme}
        className="flex-1 min-h-[700px] border-none shadow-2xl"
      />

      {/* Theme Spotlight (only shown when a theme is selected) */}
      {selectedTheme && (
        <ThemeSpotlight
          theme={selectedTheme}
          rankings={data.rankings}
          onClose={() => setSelectedTheme(null)}
          className="max-w-md fixed right-8 bottom-8 shadow-2xl border-slate-700 z-50 backdrop-blur-xl bg-slate-950/80"
        />
      )}
    </div>
  );
}
