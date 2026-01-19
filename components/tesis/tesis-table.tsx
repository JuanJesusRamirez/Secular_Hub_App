"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TesisRecord } from "@/app/api/tesis/route";

interface TesisTableProps {
  data: TesisRecord[];
  selectedYear?: number;
  onYearSelect?: (year: number) => void;
}

export function TesisTable({ data, selectedYear, onYearSelect }: TesisTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Get unique years sorted in descending order
  const years = Array.from(new Set(data.map(record => record.year)))
    .sort((a, b) => b - a);

  // Filter data by selected year
  const filteredData = selectedYear
    ? data.filter(record => record.year === selectedYear)
    : data;

  // Group by year and rank
  const groupedData = filteredData.reduce((acc, record) => {
    const key = `${record.year}-${record.rank}`;
    if (!acc[key]) {
      acc[key] = record;
    }
    return acc;
  }, {} as Record<string, TesisRecord>);

  const sortedData = Object.values(groupedData).sort((a, b) => {
    if (a.year === b.year) {
      return a.rank - b.rank;
    }
    return b.year - a.year;
  });

  const toggleRow = (key: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedRows(newExpanded);
  };

  // Color mapping for themes (similar to historical page)
  const getThemeColor = (theme: string): string => {
    const colorMap: Record<string, string> = {
      'BASE CASE': 'bg-gray-500',
      'GROWTH': 'bg-green-500',
      'MONETARY POLICY': 'bg-purple-500',
      'TRADE': 'bg-pink-500',
      'INFLATION': 'bg-orange-500',
      'VOLATILITY': 'bg-violet-500',
      'FISCAL': 'bg-blue-500',
      'POLITICS': 'bg-red-500',
      'RECESSION': 'bg-red-700',
      'CHINA': 'bg-yellow-600',
      'ESG': 'bg-emerald-500',
      'BREXIT': 'bg-indigo-500',
    };
    
    const upperTheme = theme.toUpperCase();
    for (const key in colorMap) {
      if (upperTheme.includes(key)) {
        return colorMap[key];
      }
    }
    return 'bg-slate-500';
  };

  return (
    <div className="space-y-4">
      {/* Year Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={!selectedYear ? "default" : "outline"}
          size="sm"
          onClick={() => onYearSelect?.(0)}
        >
          All Years
        </Button>
        {years.map(year => (
          <Button
            key={year}
            variant={selectedYear === year ? "default" : "outline"}
            size="sm"
            onClick={() => onYearSelect?.(year)}
          >
            {year}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="space-y-3">
        {sortedData.map(record => {
          const key = `${record.year}-${record.rank}-${record.themesAssets}`;
          const isExpanded = expandedRows.has(key);

          return (
            <Card key={key} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                {/* Header Row */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleRow(key)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Badge variant="outline" className="font-mono">
                      {record.year}
                    </Badge>
                    <Badge variant="secondary" className="w-8 justify-center">
                      #{record.rank}
                    </Badge>
                    <Badge className={`${getThemeColor(record.themesAssets)} text-white`}>
                      {record.themesAssets}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t bg-muted/20 p-6 space-y-4">
                    {/* Consensus Thesis */}
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                        Consensus Thesis
                      </h4>
                      <p className="text-sm leading-relaxed">
                        {record.consensusThesis || 'No data available'}
                      </p>
                    </div>

                    {/* Tesis Ex Post */}
                    {record.tesisExPost && (
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                          Actual Outcome (Ex-Post Thesis)
                        </h4>
                        <p className="text-sm leading-relaxed text-orange-700 dark:text-orange-300">
                          {record.tesisExPost}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {sortedData.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No data available for the selected filters
          </CardContent>
        </Card>
      )}
    </div>
  );
}
