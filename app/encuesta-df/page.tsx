"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart as PieChartIcon, MessageSquare, Building2, Info } from 'lucide-react';

interface SurveyResponse {
  institution: string;
  answer: string;
}

interface QuestionData {
  id: number;
  question: string;
  stats: Record<string, number>;
  responses: SurveyResponse[];
}

const COLORS = [
  '#0ea5e9', // sky-500
  '#22c55e', // green-500
  '#ef4444', // red-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#64748b', // slate-500
  '#ec4899', // pink-500
];

const ANSWER_COLORS: Record<string, string> = {
  // English Mappings
  'Increase': '#22c55e',
  'Decrease': '#ef4444',
  'Remain the same': '#64748b',
  'Yes': '#22c55e',
  'No': '#ef4444',
  'Overweight': '#22c55e',
  'Underweight': '#ef4444',
  'Neutral': '#64748b',
  'Risk-on': '#22c55e',
  'Risk-off': '#ef4444',
  'Tighten': '#22c55e',
  'Widen': '#ef4444',
  'Appreciate': '#22c55e',
  'Depreciate': '#ef4444',

  // Legacy Spanish (Just in case)
  'Aumentará': '#22c55e',
  'Aumentarán': '#22c55e',
  'Disminuirá': '#ef4444',
  'Bajará': '#ef4444',
  'Bajarán': '#ef4444',
  'Se mantendrá': '#64748b',
  'Se mantendrán': '#64748b',
  'Sí': '#22c55e',
  'OW': '#22c55e',
  'UW': '#ef4444',
  'Se estrecharán': '#22c55e',
  'Se ampliarán': '#ef4444',
  'Se apreciará': '#22c55e',
  'Se depreciará': '#ef4444',
};

const FIRM_RANKING: Record<string, number> = {
  "Goldman Sachs": 1,
  "BlackRock": 2,
  "HSBC": 3,
  "JP Morgan": 4,
  "Morgan Stanley": 5,
  "UBS": 6,
  "BNP Paribas": 7,
  "Capital Economics": 8,
  "Invesco": 9,
  "NatWest": 10,
  "Robeco": 11,
  "State Street": 12,
  "Amundi": 13,
  "Deutsche Bank": 14,
  "Fidelity": 15,
  "ABN AMRO": 16,
  "Barclays": 17,
  "T. Rowe Price": 18
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    // Sort firms based on ranking
    const sortedFirms = [...data.firms].sort((a: string, b: string) => {
      const rankA = FIRM_RANKING[a] || 999;
      const rankB = FIRM_RANKING[b] || 999;
      return rankA - rankB;
    });

    return (
      <div className="bg-popover border text-popover-foreground shadow-md rounded-lg p-3 max-w-[300px] pointer-events-none z-50">
        <div className="font-semibold mb-2 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: data.fill }}></span>
          {data.name}: {data.value}
        </div>
        <div className="flex flex-wrap gap-1">
          {sortedFirms.map((firm: string, idx: number) => {
            const rank = FIRM_RANKING[firm];
            const isTop = rank && rank <= 5;
            return (
              <span
                key={idx}
                className={`text-[10px] px-1.5 py-0.5 rounded border ${isTop ? 'bg-primary/10 border-primary/20 text-primary font-medium' : 'bg-muted text-muted-foreground'}`}
              >
                {rank ? `#${rank} ` : ''}{firm}
              </span>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export default function EncuestaDFPage() {
  const [data, setData] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/data/survey-data.json');
        if (!res.ok) throw new Error('Failed to load data');
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Survey</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-[1600px]">
      <div className="flex flex-col gap-6 mb-8">

        <div className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-primary/10 via-background to-background p-6 md:p-8 shadow-sm">
          <div className="relative z-10 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2.5 rounded-lg text-primary">
                <PieChartIcon className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl text-foreground">
                Survey
              </h1>
            </div>
            <p className="text-lg text-muted-foreground ml-[3.25rem] max-w-2xl">
              Institutional responses and consensus distribution by question
            </p>
          </div>
          {/* Decorative element */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-primary/5 blur-3xl"></div>
        </div>

        {/* Global Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{data.length > 0 ? data[0].responses.length : 0}</div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Institutions</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{data.length}</div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Questions</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {data.map((q) => {
          if (q.id === 19) {
            const sortedResponses = [...q.responses].sort((a, b) => {
              const rankA = FIRM_RANKING[a.institution] || 999;
              const rankB = FIRM_RANKING[b.institution] || 999;
              return rankA - rankB;
            });

            return (
              <Card key={q.id} className="flex flex-col overflow-hidden border-t-4 border-t-primary/20 xl:col-span-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="py-6 px-6 bg-gradient-to-r from-muted/50 to-background border-b">
                  <div className="flex flex-col gap-3">
                    <Badge variant="outline" className="w-fit bg-primary/10 text-primary border-primary/20 px-3 py-1 font-semibold">
                      Question {q.id} (Open Ended)
                    </Badge>
                    <CardTitle className="text-2xl font-bold leading-tight text-primary/90">
                      {q.question}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedResponses.map((resp, idx) => (
                      <div key={idx} className="flex flex-col gap-2 p-4 rounded-lg border bg-card hover:bg-muted/20 transition-colors">
                        <div className="flex items-center justify-between border-b pb-2">
                          <span className="font-bold text-sm text-primary">
                            {FIRM_RANKING[resp.institution] ? `#${FIRM_RANKING[resp.institution]} ` : ''}
                            {resp.institution}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-snug">
                          {resp.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          }

          const chartData = Object.entries(q.stats).map(([name, value]) => ({
            name,
            value,
            firms: q.responses.filter(r => r.answer === name).map(r => r.institution)
          }));
          const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

          return (
            <Card key={q.id} className="flex flex-col overflow-hidden border-t-4 border-t-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="py-6 px-6 bg-gradient-to-r from-muted/50 to-background border-b min-h-[140px] flex flex-col justify-center">
                <div className="flex flex-col gap-3">
                  <Badge variant="outline" className="w-fit bg-primary/10 text-primary border-primary/20 px-3 py-1 font-semibold">
                    Question {q.id}
                  </Badge>
                  <CardTitle className="text-xl font-bold leading-tight text-foreground/90">
                    {q.question}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-6">
                <div className="h-full min-h-[300px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => {
                          // Try to match semantic colors first, then fallback to palette
                          const color = ANSWER_COLORS[entry.name] || COLORS[index % COLORS.length];
                          return <Cell key={`cell-${index}`} fill={color} strokeWidth={1} />;
                        })}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Stat */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8 text-center px-8">
                    {/* Empty center for cleaner look since total is global now */}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12">
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-6 flex gap-4">
            <div className="mt-1">
              <Info className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Methodology Note</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This survey analysis was conducted by consulting the 2026 Outlook reports available on our internal SharePoint.
                The ordering of institutions in the visualizations and tooltips strictly follows their position in the
                <strong> Bloomberg Base Case Conviction Ranking (2026)</strong>.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
