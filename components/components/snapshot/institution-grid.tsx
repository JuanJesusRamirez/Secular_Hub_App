import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InstitutionGridProps {
  institutions: { institution: string; count: number }[];
  className?: string;
  onSelect?: (institution: string | null) => void;
  selectedInstitution?: string | null;
}

export function InstitutionGrid({ institutions, className, onSelect, selectedInstitution }: InstitutionGridProps) {
  // Sort by count desc
  const sorted = [...institutions].sort((a, b) => b.count - a.count);

  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">INSTITUTION COVERAGE</h3>
        <span className="text-xs text-muted-foreground">{institutions.length} Firms</span>
      </div>
      
      <div className="relative w-full overflow-hidden rounded-md border bg-background p-4">
        <div className="flex w-full space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          {sorted.map((inst) => (
            <button
              key={inst.institution}
              onClick={() => onSelect?.(selectedInstitution === inst.institution ? null : inst.institution)}
              className="flex-shrink-0 group"
            >
              <div className={cn(
                "flex flex-col items-center justify-center p-3 rounded-lg border transition-all min-w-[120px]",
                selectedInstitution === inst.institution 
                  ? "border-primary bg-primary/10" 
                  : "border-muted hover:border-primary/50"
              )}>
                <span className={cn(
                  "font-semibold text-sm whitespace-nowrap",
                  inst.count > 10 ? "text-primary" : "text-foreground"
                )}>
                  {inst.institution}
                </span>
                <Badge variant="secondary" className="mt-2 text-xs">
                  {inst.count} calls
                </Badge>
              </div>
            </button>
          ))}
          {sorted.length === 0 && (
            <div className="text-sm text-muted-foreground p-4">No institutions found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
