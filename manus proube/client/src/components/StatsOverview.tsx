/**
 * StatsOverview Component
 * Design System: Minimalismo Institucional Moderno
 * - Números grandes en monoespaciada (IBM Plex Mono)
 * - Estadísticas clave con etiquetas
 * - Elemento distintivo: números de gran tamaño
 */

interface Stat {
  number: string;
  label: string;
  description?: string;
}

interface StatsOverviewProps {
  stats: Stat[];
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col">
            <div className="stat-number mb-2">{stat.number}</div>
            <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase">
              {stat.label}
            </p>
            {stat.description && (
              <p className="text-sm text-muted-foreground mt-2">
                {stat.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
