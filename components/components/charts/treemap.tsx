"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface TreemapProps {
  data: { name: string; value: number; category?: string }[];
  onNodeClick?: (node: { name: string }) => void;
  title?: string;
  className?: string;
}

export function TreemapChart({ data, onNodeClick, title, className }: TreemapProps) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="h-[300px] flex items-center justify-center bg-muted/20">
        <p className="text-muted-foreground">Treemap Chart Placeholder</p>
        {/* Integration point for Recharts Treemap */}
      </CardContent>
    </Card>
  );
}
