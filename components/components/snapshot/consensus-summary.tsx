import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Copy } from "lucide-react";
import { useAiSummary } from "@/lib/hooks/use-ai-summary";

export function ConsensusSummary() {
  const { summary, loading, regenerate } = useAiSummary();

  const handleCopy = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
    }
  };

  return (
    <Card className="border-l-4 border-l-primary/50 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 bg-[url('/grid-pattern.svg')] w-full h-full pointer-events-none" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <span className="mr-2">📝</span> AI API Consensus Summary
        </CardTitle>
        <div className="flex space-x-2 z-10">
          <Button variant="ghost" size="icon" onClick={regenerate} disabled={loading} title="Regenerate">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleCopy} disabled={!summary} title="Copy">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
            <p className="italic">
              "{summary || "No summary available. Click regenerate to create one."}"
            </p>
          </div>
        )}
        <div className="mt-4 text-xs text-muted-foreground border-t pt-2">
          * This summary is AI-generated from Bloomberg's editorial compilation.
        </div>
      </CardContent>
    </Card>
  );
}
