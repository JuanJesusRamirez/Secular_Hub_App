
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
    title = '2026 Asset Analysis',
    description = 'Market sentiment and expectations by asset class'
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

    const stats = {
        bullish: sentimentCounts.Bullish,
        neutral: sentimentCounts.Neutral,
        bearish: sentimentCounts.Bearish,
    };

    return (
        <section className="py-8">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-primary mb-4">{title}</h2>
                <div className="space-y-4 max-w-3xl text-muted-foreground leading-relaxed">
                    <p>{description}</p>
                    <p>
                        Sentiment analysis has been extracted using natural language processing from
                        investment outlooks, identifying patterns of optimism, caution, and pessimism.
                        The sentiment distribution reflects the institutional consensus on the outlook for each asset for the coming year.
                    </p>
                    <p className="font-medium text-slate-900 border-t border-slate-100 pt-4">
                        Overall Sentiment: <span className="text-green-600 font-bold">{stats.bullish} bullish assets</span>, {stats.neutral} neutral, and <span className="text-red-600 font-bold">Risks</span>.
                    </p>
                </div>
            </div>

            {/* Filtros de sentimiento */}
            <div className="flex flex-wrap gap-3 mb-8">
                <button
                    onClick={() => setSelectedSentiment('All')}
                    className={`px-4 py-2 rounded text-sm font-medium transition-all duration-200 ${selectedSentiment === 'All'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                        }`}
                >
                    All ({Object.keys(assets).length})
                </button>
                <button
                    onClick={() => setSelectedSentiment('Bullish')}
                    className={`px-4 py-2 rounded text-sm font-medium transition-all duration-200 ${selectedSentiment === 'Bullish'
                        ? 'bg-green-500 text-white'
                        : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                        }`}
                >
                    📈 Bullish ({sentimentCounts.Bullish})
                </button>
                <button
                    onClick={() => setSelectedSentiment('Neutral')}
                    className={`px-4 py-2 rounded text-sm font-medium transition-all duration-200 ${selectedSentiment === 'Neutral'
                        ? 'bg-slate-500 text-white'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                >
                    ➡️ Neutral ({sentimentCounts.Neutral})
                </button>
                <button
                    onClick={() => setSelectedSentiment('Bearish')}
                    className={`px-4 py-2 rounded text-sm font-medium transition-all duration-200 ${selectedSentiment === 'Bearish'
                        ? 'bg-red-500 text-white'
                        : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                        }`}
                >
                    📉 Risks ({sentimentCounts.Bearish})
                </button>
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
                                // Note: animation CSS needs to be global or inline, defined below
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
                            No assets found with {selectedSentiment.toLowerCase()} sentiment
                        </p>
                    </div>
                )}
            </div>

            <style jsx>{`
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
