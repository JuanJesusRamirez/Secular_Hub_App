"use client";


import { useEffect, useState, Suspense } from "react";
import { ExecutiveBriefing } from "@/components/overview/executive-briefing";
import { OverviewResponse } from "@/lib/db/queries";
import { Info, ArrowLeft } from "lucide-react";
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Outlook 2026</h1>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  Aggregated analysis of Wall Street year-ahead outlook reports.
                  Conviction Index weighted by high (100), medium (50), and low (0) tier calls.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
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
