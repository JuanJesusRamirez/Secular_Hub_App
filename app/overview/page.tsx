"use client";


import { useEffect, useState, Suspense } from "react";
import { ExecutiveBriefing } from "@/components/overview/executive-briefing";
import { OverviewResponse } from "@/lib/db/queries";
import { Info, ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ManusReport from "@/components/manus/ManusReport";
import AssetsDashboard from "@/components/assets/AssetsDashboard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function OverviewContent() {
  const yearNum = 2026; // Fixed to 2026 only
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'default' | 'manus' | 'assets'>('manus');

  useEffect(() => {
    async function fetchOverview() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/overview?year=${yearNum}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.statusText}`);
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load overview");
      } finally {
        setLoading(false);
      }
    }
    fetchOverview();
  }, [yearNum]);

  const handleThemeClick = (theme: string) => {
    if (theme === "OUTLOOK ANALYSIS") {
      setViewMode('manus');
    } else if (theme === "INTEREST TOPICS") {
      setViewMode('assets');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="w-full relative overflow-hidden rounded-xl border bg-gradient-to-r from-primary/10 via-background to-background p-6 md:p-8 shadow-sm mb-8">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2.5 rounded-lg text-primary">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl text-foreground flex items-center gap-2">
                Overview 2026
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-5 w-5 text-muted-foreground/60 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">
                        Aggregated analysis of Wall Street year-ahead outlook reports.
                        Conviction Index weighted by high (100), medium (50), and low (0) tier calls.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h1>
            </div>
            <p className="text-lg text-muted-foreground ml-[3.25rem] max-w-2xl">
              Where do institutions converge (and diverge) on the 2026 outlook?
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-primary/5 blur-3xl"></div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      {/* Executive Briefing - Blue Box */}
      <ExecutiveBriefing
        data={data}
        isLoading={loading}
        onThemeClick={handleThemeClick}
      />

      {/* Deep Dive Analysis Section */}
      <div className="space-y-4">
        {/* Buttons Below the Blue Box */}
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => setViewMode('manus')}
            variant={viewMode === 'manus' ? 'default' : 'outline'}
            size="lg"
            className="min-w-[200px] font-semibold"
          >
            OUTLOOK ANALYSIS
          </Button>
          <Button
            onClick={() => setViewMode('assets')}
            variant={viewMode === 'assets' ? 'default' : 'outline'}
            size="lg"
            className="min-w-[200px] font-semibold"
          >
            INTEREST TOPICS
          </Button>
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in duration-500">
          {viewMode === 'manus' && <ManusReport />}
          {viewMode === 'assets' && (
            <div className="border rounded-xl shadow-sm overflow-hidden">
              <AssetsDashboard />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  return (
    <Suspense fallback={<OverviewLoadingSkeleton />}>
      <OverviewContent />
    </Suspense>
  );
}

function OverviewLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
      </div>
      <div className="h-80 bg-muted rounded animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 bg-muted rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}
