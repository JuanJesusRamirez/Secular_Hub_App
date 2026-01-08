"use client";

import * as React from "react";
import { useCompareYears } from "@/lib/hooks/use-compare-years";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCw } from "lucide-react";

export function YearSelector() {
  const { year1, year2, setYears } = useCompareYears();
  const [localYear1, setLocalYear1] = React.useState(year1);
  const [localYear2, setLocalYear2] = React.useState(year2);

  const years = ["2020", "2021", "2022", "2023", "2024", "2025", "2026"];

  React.useEffect(() => {
    setLocalYear1(year1);
    setLocalYear2(year2);
  }, [year1, year2]);

  const handleCompare = () => {
    setYears(localYear1, localYear2);
  };

  return (
    <div className="flex items-center space-x-2 bg-background/50 p-2 rounded-lg border">
      <Select value={localYear1} onValueChange={setLocalYear1}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Year 1" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ArrowRight className="h-4 w-4 text-muted-foreground" />

      <Select value={localYear2} onValueChange={setLocalYear2}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Year 2" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={handleCompare} size="sm" variant="secondary">
        <RefreshCw className="mr-2 h-3 w-3" />
        Compare
      </Button>
    </div>
  );
}
