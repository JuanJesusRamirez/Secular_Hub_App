"use client";

import { useState } from 'react';
import { PageHeader } from "@/components/layout/page-header";
import { NarrativeChart } from "@/components/narrative/narrative-chart";
import { NarrativeHeader } from "@/components/narrative/narrative-header";
import { ColorLegend } from "@/components/narrative/color-legend";
import { ThemeJourney } from "@/components/narrative/theme-journey";
import { GuidedTour } from "@/components/narrative/guided-tour";
import { useThemeRankings } from "@/lib/hooks/use-theme-rankings";
import { SemanticCategory } from "@/lib/data/semantic-colors";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Compass, Info } from 'lucide-react';
import { cn } from "@/lib/utils";

type ViewMode = 'guided' | 'explore';

export default function NarrativePage() {
  const {
    data,
    loading,
    error,
    selectedTheme,
    setSelectedTheme
  } = useThemeRankings({ topN: 10 });

  const [viewMode, setViewMode] = useState<ViewMode>('explore');
  const [categoryFilter, setCategoryFilter] = useState<SemanticCategory | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Narrative Evolution"
          description="The Story of Wall Street Consensus"
        />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Narrative Evolution"
          description="The Story of Wall Street Consensus"
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
      {/* Header with Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <PageHeader
          title="Narrative Evolution"
          description="How Wall Street's Focus Has Shifted Over 8 Years"
        />

        <div className="flex items-center gap-2">
          {/* Info Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInfo(!showInfo)}
            className={cn(showInfo && "bg-muted")}
          >
            <Info className="h-4 w-4" />
          </Button>

          {/* Mode Toggle */}
          <div className="flex rounded-lg border bg-muted/50 p-0.5">
            <Button
              variant={viewMode === 'guided' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('guided')}
              className="gap-1.5"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Guided Tour</span>
            </Button>
            <Button
              variant={viewMode === 'explore' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('explore')}
              className="gap-1.5"
            >
              <Compass className="h-4 w-4" />
              <span className="hidden sm:inline">Free Explore</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Info Panel (collapsible) */}
      {showInfo && (
        <Card className="bg-muted/30">
          <CardContent className="py-4">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-1">What is this?</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  This visualization tracks how Bloomberg News ranks themes in their annual
                  &quot;Here&apos;s Everything Wall Street Expects&quot; series. Themes are ordered
                  by editorial judgment of relevance and conviction.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">How to read it</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  <strong>Position</strong>: Higher = more prominent that year.
                  <strong> Lines</strong>: Show how themes moved between years.
                  <strong> Colors</strong>: Encode semantic meaning (green = growth, red = risk, etc.)
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">The Base Case</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  The &quot;BASE CASE&quot; at position 0 is Bloomberg&apos;s identified consensus
                  scenario - the anchor around which all other themes are organized.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guided Tour Mode */}
      {viewMode === 'guided' && (
        <GuidedTour
          rankings={data.rankings}
          years={data.years}
          baseCases={data.baseCases}
          onComplete={() => setViewMode('explore')}
        />
      )}

      {/* Free Explore Mode */}
      {viewMode === 'explore' && (
        <>
          {/* Dynamic Headline */}
          <NarrativeHeader
            selectedTheme={selectedTheme}
            rankings={data.rankings}
            baseCases={data.baseCases}
            years={data.years}
          />

          {/* Color Legend */}
          <ColorLegend
            activeCategory={categoryFilter}
            onCategorySelect={setCategoryFilter}
          />

          {/* Main Chart */}
          <NarrativeChart
            rankings={data.rankings}
            years={data.years}
            baseCases={data.baseCases}
            selectedTheme={selectedTheme}
            onThemeSelect={setSelectedTheme}
            categoryFilter={categoryFilter}
          />

          {/* Theme Journey Panel */}
          {selectedTheme && (
            <div className="grid md:grid-cols-2 gap-6">
              <ThemeJourney
                theme={selectedTheme}
                rankings={data.rankings}
                onClose={() => setSelectedTheme(null)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
