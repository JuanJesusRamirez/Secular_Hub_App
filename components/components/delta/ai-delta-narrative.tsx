"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AiNarrativeProps {
  narrative: {
    whatsNew: string;
    whatIntensified: string;
    whatFaded: string;
    notableReversals: string;
  } | null;
  isLoading: boolean;
}

export function AiDeltaNarrative({ narrative, isLoading }: AiNarrativeProps) {
  const handleCopy = () => {
    if (!narrative) return;
    const text = `
AI Delta Narrative:
What's New: ${narrative.whatsNew}
What Intensified: ${narrative.whatIntensified}
What Faded: ${narrative.whatFaded}
Notable Reversals: ${narrative.notableReversals}
    `.trim();
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <Card className="mb-6 relative overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" /> AI Delta Narrative
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
             <div className="h-4 bg-muted animate-pulse rounded w-full"></div>
             <div className="h-4 bg-muted animate-pulse rounded w-5/6"></div>
        </CardContent>
      </Card>
    );
  }

  if (!narrative) return null;

  return (
    <Card className="mb-6 border-purple-500/20 bg-purple-500/5">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-purple-500" /> AI Narrative
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy to clipboard">
          <Copy className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
            <div>
                <h4 className="font-semibold text-purple-600 mb-1 flex items-center gap-2">
                    <span className="text-lg">🆕</span> What&apos;s New
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{narrative.whatsNew}</p>
            </div>
            <div>
                <h4 className="font-semibold text-red-600 mb-1 flex items-center gap-2">
                    <span className="text-lg">🔥</span> What Intensified
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{narrative.whatIntensified}</p>
            </div>
        </div>
        <div className="space-y-4">
            <div>
                <h4 className="font-semibold text-blue-600 mb-1 flex items-center gap-2">
                    <span className="text-lg">❄️</span> What Faded
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{narrative.whatFaded}</p>
            </div>
             <div>
                <h4 className="font-semibold text-orange-600 mb-1 flex items-center gap-2">
                    <span className="text-lg">🔄</span> Notable Reversals
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{narrative.notableReversals}</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
