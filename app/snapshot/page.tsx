"use client";

import { useState } from "react";
import { ConsensusSummary } from "@/components/snapshot/consensus-summary";
import { ThemeTreemap } from "@/components/snapshot/theme-treemap";
import { SentimentDonut } from "@/components/snapshot/sentiment-donut";
import { InstitutionGrid } from "@/components/snapshot/institution-grid";
import { ThemeDetailModal } from "@/components/snapshot/theme-detail-modal";
import { StatCard } from "@/components/ui/stat-card";
import { useSnapshotData } from "@/lib/hooks/use-snapshot-data";
import { OutlookCall } from "@/types/outlook";
import { FileText, Building2 } from "lucide-react";
import SnapshotLoading from "./loading";
import { fallbackSentimentData } from "@/lib/mock-data";

export default function SnapshotPage() {
  const { themes, institutions, outlooks, stats, loading, error } = useSnapshotData(2026);
  
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [modalCalls, setModalCalls] = useState<OutlookCall[]>([]);
  const [loadingModal, setLoadingModal] = useState(false);

  // Sentiment data - using fallback since explicit sentiment field is not in OutlookCall model
  // In production, this would come from AI sentiment analysis or a dedicated field
  const sentimentData = fallbackSentimentData;

  const handleThemeClick = async (theme: string) => {
    setSelectedTheme(theme);
    setLoadingModal(true);
    try {
      // Fetch calls specifically for this theme to ensure we have list
      const query = new URLSearchParams({ 
        year: '2026', 
        theme: theme,
        limit: '20'
      });
      if (selectedInstitution) query.append('institution', selectedInstitution);
      
      const res = await fetch(`/api/outlooks?${query.toString()}`);
      const data = await res.json();
      setModalCalls(data.data || []);
    } catch (e) {
      console.error("Failed to fetch theme details", e);
      setModalCalls([]); // Fallback to empty or filter from existing
    } finally {
      setLoadingModal(false);
    }
  };

  const handleInstitutionSelect = (inst: string | null) => {
    setSelectedInstitution(inst);
    // Optional: Refresh data or filter views?
    // For now, it just acts as a filter for the Modal drill-down context 
    // and visually highlights in the grid (handled by grid component).
  };

  if (loading) return <SnapshotLoading />;
  if (error) return <div className="p-8 text-destructive">Error loading snapshot: {error}</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Top Section: Summary & KPI */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* AI Summary - Spans 2 cols */}
        <div className="lg:col-span-2">
          <ConsensusSummary />
        </div>

        {/* KPI Grid - Spans 1 col, internal grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <StatCard 
             title="Total Calls" 
             value={stats?.total_records || 0} 
             change={{ value: 26, direction: 'up' }}
             icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard 
             title="Institutions" 
             value={stats?.institutions?.length || 0} 
             change={{ value: 12, direction: 'up' }}
             icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
      </div>

      {/* Middle Section: Treemap & Sentiment */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
           <ThemeTreemap 
             title="Theme Hierarchy" 
             data={themes} 
             onThemeClick={handleThemeClick} 
             className="h-full"
           />
        </div>
        <div className="md:col-span-1">
           <SentimentDonut 
             title="Sentiment Distribution" 
             data={sentimentData} 
             className="h-full"
           />
        </div>
      </div>

      {/* Bottom Section: Institutions */}
      <div>
        <InstitutionGrid 
          institutions={institutions} 
          onSelect={handleInstitutionSelect}
          selectedInstitution={selectedInstitution}
        />
      </div>

      {/* Modal */}
      {selectedTheme && (
        <ThemeDetailModal 
          isOpen={!!selectedTheme} 
          onClose={() => setSelectedTheme(null)} 
          theme={selectedTheme}
          calls={modalCalls}
        />
      )}
    </div>
  );
}
