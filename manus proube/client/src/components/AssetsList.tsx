/**
 * AssetsList Component
 * Design System: Minimalismo Institucional Moderno
 * - Lista de assets con sentimiento y expectativas
 * - Filtrado por sentimiento
 * - Animaciones suaves en carga
 */

import { useState } from 'react';
import AssetCard from './AssetCard';

interface Asset {
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

interface AssetsListProps {
  assets: Record<string, Asset>;
  title?: string;
  description?: string;
}

export default function AssetsList({
  assets,
  title = 'Análisis de Assets 2026',
  description = 'Sentimiento de mercado y expectativas por clase de activo'
}: AssetsListProps) {
  const [selectedSentiment, setSelectedSentiment] = useState<'All' | 'Bullish' | 'Bearish' | 'Neutral'>('All');

  // Filtrar assets según sentimiento seleccionado
  const filteredAssets = Object.values(assets).filter(asset => {
    if (selectedSentiment === 'All') return true;
    return asset.sentiment === selectedSentiment;
  });

  // Contar sentimientos
  const sentimentCounts = {
    Bullish: Object.values(assets).filter(a => a.sentiment === 'Bullish').length,
    Neutral: Object.values(assets).filter(a => a.sentiment === 'Neutral').length,
    Bearish: Object.values(assets).filter(a => a.sentiment === 'Bearish').length
  };

  return (
    <section className="py-16">
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-primary mb-3">
          {title}
        </h2>
        {description && (
          <p className="text-base text-muted-foreground mb-6">
            {description}
          </p>
        )}

        {/* Filtros de sentimiento */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedSentiment('All')}
            className={`px-4 py-2 rounded text-sm font-medium transition-all duration-200 ${
              selectedSentiment === 'All'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-foreground hover:bg-secondary/80'
            }`}
          >
            Todos ({Object.keys(assets).length})
          </button>
          <button
            onClick={() => setSelectedSentiment('Bullish')}
            className={`px-4 py-2 rounded text-sm font-medium transition-all duration-200 ${
              selectedSentiment === 'Bullish'
                ? 'bg-green-500 text-white'
                : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
            }`}
          >
            📈 Alcista ({sentimentCounts.Bullish})
          </button>
          <button
            onClick={() => setSelectedSentiment('Neutral')}
            className={`px-4 py-2 rounded text-sm font-medium transition-all duration-200 ${
              selectedSentiment === 'Neutral'
                ? 'bg-slate-500 text-white'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            ➡️ Neutral ({sentimentCounts.Neutral})
          </button>
          <button
            onClick={() => setSelectedSentiment('Bearish')}
            className={`px-4 py-2 rounded text-sm font-medium transition-all duration-200 ${
              selectedSentiment === 'Bearish'
                ? 'bg-red-500 text-white'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
            }`}
          >
            📉 Bajista ({sentimentCounts.Bearish})
          </button>
        </div>
      </div>

      {/* Lista de assets */}
      <div className="space-y-4">
        {filteredAssets.length > 0 ? (
          filteredAssets.map((asset, index) => (
            <div
              key={asset.theme}
              className="animate-fade-in"
              style={{
                animationDelay: `${index * 50}ms`,
                animation: 'fadeIn 0.4s ease-out forwards',
                opacity: 0
              }}
            >
              <AssetCard
                theme={asset.theme}
                sentiment={asset.sentiment}
                sentiment_distribution={asset.sentiment_distribution}
                description={asset.description}
                sub_themes={asset.sub_themes}
                institutions_count={asset.institutions_count}
                calls_count={asset.calls_count}
                institutions={asset.institutions}
              />
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No hay assets con sentimiento {selectedSentiment.toLowerCase()}
            </p>
          </div>
        )}
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
