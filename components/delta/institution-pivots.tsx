"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

interface InstitutionPivotProps {
  pivots: {
    institution: string;
    themeYear1: string;
    themeYear2: string;
    isPivot: boolean;
  }[];
}

export function InstitutionPivots({ pivots }: InstitutionPivotProps) {
  if (!pivots || pivots.length === 0) return null;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Institutional Pivots</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pivots.map((pivot, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md transition-colors border-b last:border-0">
              <div className="font-semibold text-sm w-1/3">{pivot.institution}</div>
              <div className="flex items-center gap-2 flex-1 justify-end">
                <Badge variant="outline" className="text-xs text-muted-foreground truncate max-w-[100px]" title={pivot.themeYear1}>
                  {pivot.themeYear1}
                </Badge>
                <ArrowRight className={`w-4 h-4 ${pivot.isPivot ? "text-orange-500" : "text-muted-foreground/30"}`} />
                <Badge variant={pivot.isPivot ? "default" : "secondary"} className="text-xs truncate max-w-[100px]" title={pivot.themeYear2}>
                  {pivot.themeYear2}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
