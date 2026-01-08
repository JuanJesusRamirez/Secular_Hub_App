import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OutlookCall } from "@/types/outlook";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CallCardProps {
  call: OutlookCall;
  className?: string;
}

export function CallCard({ call, className }: CallCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-sm">{call.institution}</div>
          <Badge variant="outline" className={cn(
            "text-xs",
            call.convictionTier === "High" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" :
            call.convictionTier === "Medium" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100" :
            "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
          )}>
            {call.convictionTier || "Neutral"}
          </Badge>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {call.themeCategory && <span className="font-medium text-foreground">{call.themeCategory}: </span>}
          {expanded ? call.callText : (
            <span className="line-clamp-2">
              {call.callText}
            </span>
          )}
        </div>

        <button 
          onClick={() => setExpanded(!expanded)} 
          className="flex items-center text-xs text-primary hover:underline mt-1"
        >
          {expanded ? (
            <>Show Less <ChevronUp className="h-3 w-3 ml-1" /></>
          ) : (
            <>Read More <ChevronDown className="h-3 w-3 ml-1" /></>
          )}
        </button>
      </CardContent>
    </Card>
  );
}
