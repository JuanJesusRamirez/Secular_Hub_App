"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, Sankey, Tooltip } from "recharts";

interface ThemeSankeyProps {
  data: {
    nodes: { name: string }[];
    links: { source: number; target: number; value: number }[];
  } | null;
}

export function ThemeSankey({ data }: ThemeSankeyProps) {
  // Mock data if null, to show structure
  const safeData = data || {
    nodes: [{ name: "Inflation" }, { name: "Growth" }, { name: "AI" }, { name: "Inflation" }, { name: "Growth" }, { name: "Ai Infra" }],
    links: [
        { source: 0, target: 3, value: 50 },
        { source: 1, target: 4, value: 30 },
        { source: 2, target: 5, value: 20 }
    ]
  };

  return (
    <Card className="mb-6 h-[400px]">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
             Theme Migration Flow
             <span className="text-xs font-normal text-muted-foreground">Flow thickness = Call Volume</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[320px] w-full">
        {(!data || data.nodes.length === 0) ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">No flow data available</div>
        ) : (
            <ResponsiveContainer width="100%" height="100%">
            <Sankey
                data={safeData}
                node={{ strokeWidth: 0 }}
                nodePadding={50}
                margin={{
                    left: 20,
                    right: 20,
                    top: 20,
                    bottom: 20,
                }}
                link={{ stroke: '#7c3aed', strokeOpacity: 0.2 }} // Purple-ish
            >
                <Tooltip />
            </Sankey>
            </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
