"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface LineChartProps {
    data: any[];
    title?: string;
    className?: string;
}

export function LineChart({ data, title, className }: LineChartProps) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="h-[300px] flex items-center justify-center bg-muted/20">
        <p className="text-muted-foreground">Line Chart Placeholder</p>
      </CardContent>
    </Card>
  );
}
