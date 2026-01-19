"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TesisGrid } from "@/components/tesis/tesis-grid";
import { TesisSpotlight } from "@/components/tesis/tesis-spotlight";
import { TesisRecord } from "@/app/api/tesis/route";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function TesisPage() {
  const [data, setData] = useState<TesisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch('/api/tesis');

        if (!response.ok) {
          throw new Error('Failed to fetch tesis data');
        }

        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Error fetching tesis data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Historical Evolution"
          description="How have themes evolved over time, and how accurate were past expectations?"
        />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Historical Evolution"
          description="How have themes evolved over time, and how accurate were past expectations?"
        />
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {error}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-primary/10 via-background to-background p-6 md:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col gap-2">
            <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2.5 rounded-lg text-primary">
                    <TrendingUp className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl text-foreground">
                    Historical Evolution
                </h1>
            </div>
            <p className="text-lg text-muted-foreground ml-[3.25rem] max-w-2xl">
                How have themes evolved over time, and how accurate were past expectations?
            </p>
        </div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-primary/5 blur-3xl"></div>
      </div>

      {/* Main Grid */}
      <TesisGrid
        data={data}
        onCellClick={(record) => {
          setSelectedTheme(record.themesAssets);
          setSelectedYear(record.year);
        }}
      />

      {/* Spotlight Below Grid */}
      {selectedTheme && selectedYear > 0 && (
        <TesisSpotlight
          theme={selectedTheme}
          year={selectedYear}
          data={data}
          onClose={() => {
            setSelectedTheme(null);
            setSelectedYear(0);
          }}
        />
      )}
    </div>
  );
}
