"use client";

import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface ThemeNode {
  name: string;
  value: number; // call count
  children?: ThemeNode[];
}

interface ThemeTreemapProps {
  data: { theme: string; count: number }[];
  onThemeClick?: (theme: string) => void;
  className?: string;
  title?: string;
}

const CustomContent = (props: any) => {
  const { root, depth, x, y, width, height, index, payload, colors, rank, name, value, onThemeClick } = props;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: '#3b82f6', // blue-500 base
          fillOpacity: 0.1 + (value / (root.value || 1)) * 0.9, // Opacity based on value relative to root
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
        className="cursor-pointer hover:fill-blue-400 transition-colors"
        onClick={() => onThemeClick && onThemeClick(name)}
      />
      {width > 50 && height > 30 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          fill="#fff"
          fontSize={Math.min(width / 5, 14)}
          className="pointer-events-none font-medium select-none drop-shadow-md"
        >
          {name}
        </text>
      )}
      {width > 50 && height > 50 && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 16}
          textAnchor="middle"
          fill="#fff"
          fontSize={10}
          className="pointer-events-none select-none drop-shadow-md opacity-80"
        >
          {value}
        </text>
      )}
    </g>
  );
};

export function ThemeTreemap({ data, onThemeClick, className, title }: ThemeTreemapProps) {
  // Transform flat data to treemap structure
  // We need a single root
  const treeData = [
    {
      name: 'Themes',
      children: data.map(d => ({ name: d.theme, value: d.count })),
    }
  ];

  return (
    <Card className={cn("flex flex-col", className)}>
       {title && (
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          <span className="text-xs text-muted-foreground">Click blocks for details</span>
        </CardHeader>
      )}
      <CardContent className="flex-1 min-h-[400px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treeData}
              dataKey="value"
              stroke="#fff"
              fill="#8884d8"
              content={<CustomContent onThemeClick={onThemeClick} />}
            >
              <Tooltip 
                 content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover text-popover-foreground p-2 rounded shadow border text-sm">
                          <p className="font-semibold">{data.name}</p>
                          <p>{data.value} calls</p>
                        </div>
                      );
                    }
                    return null;
                 }}
              />
            </Treemap>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No theme data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
