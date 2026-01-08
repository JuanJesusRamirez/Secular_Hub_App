"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface DonutChartProps {
    data: any[];
    title?: string;
    className?: string;
}

export function DonutChart({ data, title, className }: DonutChartProps) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="h-[300px] flex items-center justify-center bg-muted/20">
        <p className="text-muted-foreground">Donut Chart Placeholder</p>
      </CardContent>
    </Card>
  );
}
