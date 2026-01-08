"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SentimentData {
  name: string;
  value: number;
  [key: string]: any;
}

interface SentimentDonutProps {
  data: SentimentData[];
  title?: string;
  className?: string;
}

const COLORS = {
  Bullish: '#10b981', // green-500
  Bearish: '#ef4444', // red-500
  Neutral: '#6b7280', // gray-500
  Mixed: '#f59e0b',   // amber-500
};

export function SentimentDonut({ data, title, className }: SentimentDonutProps) {
  // Calculate total for percentage
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  
  // Find dominant sentiment
  const dominant = [...data].sort((a, b) => b.value - a.value)[0];

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    // Custom label logic if needed, or use Legend
    return null; 
  };

  return (
    <Card className={cn("flex flex-col", className)}>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="flex-1 min-h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={(COLORS as any)[entry.name] || '#8884d8'} 
                  strokeWidth={0}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => [`${value || 0} calls`, 'Count'] as [string, string]}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
            <span className="text-2xl font-bold">{dominant?.name || "N/A"}</span>
            <span className="text-xs text-muted-foreground">Dominant</span>
        </div>
      </CardContent>
    </Card>
  );
}
