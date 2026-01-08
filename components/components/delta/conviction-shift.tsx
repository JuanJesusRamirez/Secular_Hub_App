"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ConvictionShiftProps {
  shifts: {
    theme: string;
    rankYear1: number;
    rankYear2: number;
    delta: number;
  }[];
}

export function ConvictionShift({ shifts }: ConvictionShiftProps) {
  if (!shifts || shifts.length === 0) return null;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Conviction Shifts</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Theme</TableHead>
              <TableHead className="text-right">Y1 Rank</TableHead>
              <TableHead className="text-right">Y2 Rank</TableHead>
              <TableHead className="text-right">Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shifts.map((shift, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{shift.theme}</TableCell>
                <TableCell className="text-right text-muted-foreground">{shift.rankYear1}</TableCell>
                <TableCell className="text-right text-muted-foreground">{shift.rankYear2}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {shift.delta > 0 && (
                      <>
                        <ArrowUp className="w-4 h-4 text-green-500" />
                        <span className="text-green-500 font-bold">+{shift.delta}</span>
                      </>
                    )}
                    {shift.delta < 0 && (
                      <>
                        <ArrowDown className="w-4 h-4 text-red-500" />
                        <span className="text-red-500 font-bold">{shift.delta}</span>
                      </>
                    )}
                    {shift.delta === 0 && (
                      <>
                        <Minus className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-500">0</span>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
