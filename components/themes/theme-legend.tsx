"use client";

import { ThemeRanking } from '@/lib/db/queries';
import { cn } from "@/lib/utils";

// Same color scheme as bump-chart
const MACRO_COLORS = [
  '#3b82f6', '#2563eb', '#1d4ed8', '#6366f1',
  '#8b5cf6', '#0ea5e9', '#06b6d4', '#14b8a6',
];

const THEMATIC_COLORS = [
  '#f59e0b', '#d97706', '#b45309', '#f97316',
  '#ea580c', '#ec4899', '#ef4444', '#84cc16',
];

interface ThemeLegendProps {
  rankings: ThemeRanking[];
  selectedTheme?: string | null;
  onThemeSelect?: (theme: string | null) => void;
  className?: string;
}

export function ThemeLegend({
  rankings,
  selectedTheme,
  onThemeSelect,
  className
}: ThemeLegendProps) {
  // Get unique themes with their types
  const themes = new Map<string, { type: 'MACRO' | 'THEMATIC'; color: string }>();

  let macroIndex = 0;
  let thematicIndex = 0;

  rankings.forEach(r => {
    if (!themes.has(r.theme)) {
      const color = r.type === 'MACRO'
        ? MACRO_COLORS[macroIndex++ % MACRO_COLORS.length]
        : THEMATIC_COLORS[thematicIndex++ % THEMATIC_COLORS.length];
      themes.set(r.theme, { type: r.type, color });
    }
  });

  const macroThemes = Array.from(themes.entries()).filter(([, v]) => v.type === 'MACRO');
  const thematicThemes = Array.from(themes.entries()).filter(([, v]) => v.type === 'THEMATIC');

  const ThemeButton = ({ theme, color, type }: { theme: string; color: string; type: string }) => (
    <button
      onClick={() => onThemeSelect?.(selectedTheme === theme ? null : theme)}
      className={cn(
        "flex items-center gap-2 px-2 py-1 rounded text-sm transition-all",
        "hover:bg-muted",
        selectedTheme === theme && "bg-muted ring-1 ring-primary",
        selectedTheme && selectedTheme !== theme && "opacity-40"
      )}
    >
      <span
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className={cn(
        "truncate",
        type === 'THEMATIC' && "italic"
      )}>
        {theme}
      </span>
    </button>
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Macro Themes */}
      <div>
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          Macro Themes
        </h4>
        <div className="flex flex-wrap gap-1">
          {macroThemes.map(([theme, { color, type }]) => (
            <ThemeButton key={theme} theme={theme} color={color} type={type} />
          ))}
        </div>
      </div>

      {/* Thematic Themes */}
      {thematicThemes.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Thematic Events
          </h4>
          <div className="flex flex-wrap gap-1">
            {thematicThemes.map(([theme, { color, type }]) => (
              <ThemeButton key={theme} theme={theme} color={color} type={type} />
            ))}
          </div>
        </div>
      )}

      {/* Clear selection */}
      {selectedTheme && (
        <button
          onClick={() => onThemeSelect?.(null)}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          Clear selection
        </button>
      )}
    </div>
  );
}
