"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface SankeyProps {
  nodes: { id: string; name: string }[];
  links: { source: string; target: string; value: number }[];
  title?: string;
  className?: string;
}

export function SankeyChart({ nodes, links, title, className }: SankeyProps) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="h-[300px] flex items-center justify-center bg-muted/20">
        <p className="text-muted-foreground">Sankey Chart Placeholder</p>
        {/* Integration point for D3 Sankey */}
      </CardContent>
    </Card>
  );
}
