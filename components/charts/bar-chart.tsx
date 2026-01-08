"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface BarChartProps {
    data: any[];
    title?: string;
    className?: string;
}

export function BarChart({ data, title, className }: BarChartProps) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="h-[300px] flex items-center justify-center bg-muted/20">
        <p className="text-muted-foreground">Bar Chart Placeholder</p>
      </CardContent>
    </Card>
  );
}
