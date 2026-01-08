"use client";

import { cn } from '@/lib/utils';
import {
  SemanticCategory,
  SEMANTIC_PALETTE,
  CATEGORY_INFO,
  getThemesByCategory
} from '@/lib/data/semantic-colors';
import { TrendingUp, TrendingDown, Landmark, Shuffle, Target } from 'lucide-react';

interface ColorLegendProps {
  activeCategory?: SemanticCategory | null;
  onCategorySelect?: (category: SemanticCategory | null) => void;
  compact?: boolean;
  className?: string;
}

const CATEGORY_ICONS: Record<SemanticCategory, React.ElementType> = {
  GROWTH_EXPANSION: TrendingUp,
  CONTRACTION_RISK: TrendingDown,
  POLICY_INTERVENTION: Landmark,
  STRUCTURAL_SHIFTS: Shuffle,
  BASE_CASE: Target,
};

const CATEGORIES_ORDER: SemanticCategory[] = [
  'GROWTH_EXPANSION',
  'CONTRACTION_RISK',
  'POLICY_INTERVENTION',
  'STRUCTURAL_SHIFTS',
];

export function ColorLegend({
  activeCategory,
  onCategorySelect,
  compact = false,
  className
}: ColorLegendProps) {

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {CATEGORIES_ORDER.map((category) => {
        const palette = SEMANTIC_PALETTE[category];
        const info = CATEGORY_INFO[category];
        const Icon = CATEGORY_ICONS[category];
        const isActive = activeCategory === category;
        const hasFilter = activeCategory !== null && activeCategory !== undefined;
        const isDimmed = hasFilter && !isActive;

        const themes = getThemesByCategory(category);

        return (
          <button
            key={category}
            onClick={() => onCategorySelect?.(isActive ? null : category)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200",
              "hover:scale-105 active:scale-95",
              isActive
                ? "border-transparent shadow-md"
                : isDimmed
                  ? "border-muted bg-muted/30 opacity-50"
                  : "border-border bg-background hover:bg-muted/50"
            )}
            style={{
              backgroundColor: isActive ? palette.primary : undefined,
              color: isActive ? 'white' : undefined,
            }}
            title={compact ? info.description : undefined}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="text-xs font-medium whitespace-nowrap">
              {info.name}
            </span>
            {!compact && (
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full",
                isActive ? "bg-white/20" : "bg-muted"
              )}>
                {themes.length}
              </span>
            )}
          </button>
        );
      })}

      {/* Clear filter button */}
      {activeCategory && (
        <button
          onClick={() => onCategorySelect?.(null)}
          className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear filter
        </button>
      )}
    </div>
  );
}

// Expanded legend with theme details
export function ColorLegendExpanded({
  activeCategory,
  onCategorySelect,
  className
}: ColorLegendProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-3", className)}>
      {CATEGORIES_ORDER.map((category) => {
        const palette = SEMANTIC_PALETTE[category];
        const info = CATEGORY_INFO[category];
        const Icon = CATEGORY_ICONS[category];
        const isActive = activeCategory === category;
        const themes = getThemesByCategory(category);

        return (
          <button
            key={category}
            onClick={() => onCategorySelect?.(isActive ? null : category)}
            className={cn(
              "flex flex-col items-start gap-2 p-3 rounded-lg border transition-all duration-200",
              "hover:shadow-md",
              isActive
                ? "border-2 shadow-md"
                : "border-border bg-background/50 hover:bg-muted/30"
            )}
            style={{
              borderColor: isActive ? palette.primary : undefined,
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: palette.primary }}
              />
              <Icon
                className="h-4 w-4"
                style={{ color: palette.primary }}
              />
              <span className="text-sm font-semibold">{info.name}</span>
            </div>
            <p className="text-[10px] text-muted-foreground text-left leading-tight">
              {info.description}
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {themes.slice(0, 4).map(theme => (
                <span
                  key={theme}
                  className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                >
                  {theme}
                </span>
              ))}
              {themes.length > 4 && (
                <span className="text-[9px] px-1.5 py-0.5 text-muted-foreground">
                  +{themes.length - 4} more
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
