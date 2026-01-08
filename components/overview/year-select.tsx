"use client";

import { useSelectedYear } from "@/lib/hooks/use-selected-year";
import { AVAILABLE_YEARS } from "@/lib/data/yearly-briefings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";

export function YearSelect() {
  const { year, setYear } = useSelectedYear();

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <Select value={year} onValueChange={setYear}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Select year" />
        </SelectTrigger>
        <SelectContent>
          {/* AVAILABLE_YEARS is already sorted 2026 -> 2019 */}
          {AVAILABLE_YEARS.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
