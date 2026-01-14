"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TesisGrid } from "@/components/tesis/tesis-grid";
import { TesisSpotlight } from "@/components/tesis/tesis-spotlight";
import { TesisRecord } from "@/app/api/tesis/route";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

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
      <div className="space-y-6">
        <PageHeader
          title="Tesis Agregadas"
          description="Consensus Thesis vs Actual Outcomes by Year"
        />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Tesis Agregadas"
          description="Consensus Thesis vs Actual Outcomes by Year"
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
      <PageHeader
        title="Tesis Agregadas"
        description="Consensus Thesis vs Actual Outcomes by Year"
      />

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
