"use client";

import { PageHeader } from "@/components/layout/page-header";
import { BumpChart } from "@/components/themes/bump-chart";
import { ThemeSpotlight } from "@/components/themes/theme-spotlight";
import { useThemeRankings } from "@/lib/hooks/use-theme-rankings";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function HistoricalPage() {
  const {
    data,
    loading,
    error,
    selectedTheme,
    setSelectedTheme
  } = useThemeRankings({ topN: 10 });

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Narrative Evolution"
          description="Bloomberg Editorial Ranking by Relevance"
        />
        <Skeleton className="h-[650px] w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Narrative Evolution"
          description="Bloomberg Editorial Ranking by Relevance"
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
    <div className="space-y-6">
      <PageHeader
        title="Narrative Evolution"
        description="Bloomberg Editorial Ranking by Relevance"
      />

      {/* Main Bump Chart */}
      <BumpChart
        rankings={data.rankings}
        years={data.years}
        baseCases={data.baseCases}
        selectedTheme={selectedTheme}
        onThemeSelect={setSelectedTheme}
      />

      {/* Theme Spotlight (only shown when a theme is selected) */}
      {selectedTheme && (
        <ThemeSpotlight
          theme={selectedTheme}
          rankings={data.rankings}
          onClose={() => setSelectedTheme(null)}
          className="max-w-md"
        />
      )}
    </div>
  );
}
