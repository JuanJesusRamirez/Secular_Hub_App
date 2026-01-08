import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: { value: number; direction: "up" | "down" | "flat" };
  icon?: React.ReactNode;
  className?: string;
  variant?: "default" | "gauge" | "highlight";
  subtitle?: string;
  gaugeColor?: "green" | "yellow" | "gray";
}

export function StatCard({
  title,
  value,
  change,
  icon,
  className,
  variant = "default",
  subtitle,
  gaugeColor = "gray",
}: StatCardProps) {
  if (variant === "gauge") {
    const numericValue = typeof value === "number" ? value : parseInt(String(value), 10) || 0;
    const gaugeColorClasses = {
      green: "text-emerald-500",
      yellow: "text-amber-500",
      gray: "text-slate-400",
    };
    const gaugeBgClasses = {
      green: "stroke-emerald-500",
      yellow: "stroke-amber-500",
      gray: "stroke-slate-400",
    };

    return (
      <Card className={cn("min-h-[160px]", className)}>
        <CardContent className="p-6 flex flex-col items-center justify-center h-full">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            {title}
          </span>
          <div className="relative w-24 h-24">
            {/* Background circle */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/20"
              />
              {/* Progress arc */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(numericValue / 100) * 251.2} 251.2`}
                className={gaugeBgClasses[gaugeColor]}
              />
            </svg>
            {/* Center value */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn("text-2xl font-mono font-bold", gaugeColorClasses[gaugeColor])}>
                {numericValue}
              </span>
            </div>
          </div>
          {subtitle && (
            <span className={cn("mt-3 text-sm font-medium", gaugeColorClasses[gaugeColor])}>
              {subtitle}
            </span>
          )}
        </CardContent>
      </Card>
    );
  }

  if (variant === "highlight") {
    return (
      <Card className={cn("min-h-[160px]", className)}>
        <CardContent className="p-6 flex flex-col justify-center h-full">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
          <span className="text-2xl font-bold mt-2 leading-tight">{value}</span>
          {subtitle && (
            <span className="text-sm text-muted-foreground mt-1">{subtitle}</span>
          )}
          {icon && <div className="mt-3 text-muted-foreground">{icon}</div>}
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={cn(className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-muted-foreground">
              {title}
            </span>
            <span className="text-2xl font-bold">{value}</span>
          </div>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        {change && (
          <div className="mt-4 flex items-center text-sm">
            {change.direction === "up" && (
              <ArrowUp className="mr-1 h-4 w-4 text-success" />
            )}
            {change.direction === "down" && (
              <ArrowDown className="mr-1 h-4 w-4 text-destructive" />
            )}
            {change.direction === "flat" && (
              <ArrowRight className="mr-1 h-4 w-4 text-warning" />
            )}
            <span
              className={cn(
                change.direction === "up" && "text-success",
                change.direction === "down" && "text-destructive",
                change.direction === "flat" && "text-warning"
              )}
            >
              {Math.abs(change.value)}%
            </span>
            <span className="ml-2 text-muted-foreground">vs last year</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
