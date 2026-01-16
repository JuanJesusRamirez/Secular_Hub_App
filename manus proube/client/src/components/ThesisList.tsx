/**
 * ThesisList Component
 * Design System: Minimalismo Institucional Moderno
 * - Lista de tesis con separadores sutiles
 * - Ordenadas por ranking
 * - Animaciones suaves en carga
 */

import ThesisCard from './ThesisCard';

interface Thesis {
  rank: number;
  theme: string;
  year: number;
  thesis: string;
}

interface ThesisListProps {
  theses: Thesis[];
  title?: string;
  description?: string;
}

export default function ThesisList({
  theses,
  title = 'Tesis de Inversión 2026',
  description = 'Análisis detallado de las predicciones globales'
}: ThesisListProps) {
  return (
    <section className="py-16">
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-primary mb-3">
          {title}
        </h2>
        {description && (
          <p className="text-base text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {theses.map((thesis, index) => (
          <div
            key={thesis.rank}
            className="animate-fade-in"
            style={{
              animationDelay: `${index * 50}ms`,
              animation: 'fadeIn 0.4s ease-out forwards',
              opacity: 0
            }}
          >
            <ThesisCard
              rank={thesis.rank}
              theme={thesis.theme}
              thesis={thesis.thesis}
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
