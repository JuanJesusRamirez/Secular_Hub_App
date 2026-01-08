"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface DeltaStat {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
  color?: string; // e.g., "text-green-500"
}

export function DeltaStatRow({ stats }: { stats: DeltaStat[] }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <Card key={idx} className="p-4 flex flex-col justify-between hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{stat.value}</span>
                {stat.trend === "up" && <ArrowUp className="w-5 h-5 text-green-500" />}
                {stat.trend === "down" && <ArrowDown className="w-5 h-5 text-red-500" />}
                {stat.trend === "neutral" && <Minus className="w-5 h-5 text-gray-500" />}
            </div>
            <div className="flex flex-col mt-2">
                <span className="text-sm font-medium text-foreground">{stat.label}</span>
                {stat.subValue && <span className="text-xs text-muted-foreground">{stat.subValue}</span>}
            </div>
        </Card>
      ))}
    </div>
  );
}
