/**
 * AssetCard Component
 * Design System: Minimalismo Institucional Moderno
 * - Card con información de asset, sentimiento y expectativas
 * - Línea de acento izquierda
 * - Distribución de sentimientos
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import SentimentBadge from './SentimentBadge';

interface AssetCardProps {
  theme: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  sentiment_distribution: {
    Bullish?: number;
    Bearish?: number;
    Neutral?: number;
  };
  description: string;
  sub_themes: string[];
  institutions_count: number;
  calls_count: number;
  institutions: string[];
}

export default function AssetCard({
  theme,
  sentiment,
  sentiment_distribution,
  description,
  sub_themes,
  institutions_count,
  calls_count,
  institutions
}: AssetCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calcular porcentajes de sentimiento
  const total = Object.values(sentiment_distribution).reduce((a, b) => a + b, 0);
  const percentages = {
    Bullish: Math.round(((sentiment_distribution.Bullish || 0) / total) * 100),
    Bearish: Math.round(((sentiment_distribution.Bearish || 0) / total) * 100),
    Neutral: Math.round(((sentiment_distribution.Neutral || 0) / total) * 100)
  };

  return (
    <div className="border border-border rounded overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="flex">
        {/* Línea de acento izquierda */}
        <div className="w-1 bg-primary flex-shrink-0" />

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 p-6 text-left hover:bg-secondary/50 transition-colors duration-200"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {/* Encabezado con tema y sentimiento */}
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  {theme}
                </h3>
                <SentimentBadge sentiment={sentiment} size="sm" />
              </div>

              {/* Descripción */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {description.substring(0, 150)}...
              </p>

              {/* Barra de distribución de sentimientos */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 flex gap-0.5 h-2 bg-slate-100 rounded overflow-hidden">
                  {percentages.Bullish > 0 && (
                    <div
                      className="bg-green-500"
                      style={{ width: `${percentages.Bullish}%` }}
                      title={`Bullish: ${percentages.Bullish}%`}
                    />
                  )}
                  {percentages.Neutral > 0 && (
                    <div
                      className="bg-slate-400"
                      style={{ width: `${percentages.Neutral}%` }}
                      title={`Neutral: ${percentages.Neutral}%`}
                    />
                  )}
                  {percentages.Bearish > 0 && (
                    <div
                      className="bg-red-500"
                      style={{ width: `${percentages.Bearish}%` }}
                      title={`Bearish: ${percentages.Bearish}%`}
                    />
                  )}
                </div>
              </div>

              {/* Estadísticas */}
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>📊 {calls_count} análisis</span>
                <span>🏢 {institutions_count} instituciones</span>
              </div>
            </div>

            <ChevronDown
              className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </div>

          {/* Contenido expandido */}
          {isExpanded && (
            <div className="mt-6 pt-6 border-t border-border space-y-4">
              {/* Sub-temas */}
              {sub_themes.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">
                    Temas Relacionados
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sub_themes.map((theme, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Instituciones principales */}
              {institutions.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">
                    Instituciones Principales
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {institutions.map((inst, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200"
                      >
                        {inst}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Distribución de sentimientos detallada */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
                  Distribución de Sentimientos
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700 font-medium">Alcista</span>
                    <span className="text-sm font-semibold text-green-700">
                      {sentiment_distribution.Bullish || 0} ({percentages.Bullish}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 font-medium">Neutral</span>
                    <span className="text-sm font-semibold text-slate-700">
                      {sentiment_distribution.Neutral || 0} ({percentages.Neutral}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-700 font-medium">Bajista</span>
                    <span className="text-sm font-semibold text-red-700">
                      {sentiment_distribution.Bearish || 0} ({percentages.Bearish}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Descripción completa */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">
                  Expectativas del Mercado
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
