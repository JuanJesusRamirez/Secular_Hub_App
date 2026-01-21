
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
                                {theme !== "RISKS" && <SentimentBadge sentiment={sentiment} size="sm" />}
                            </div>

                            {/* Descripción */}
                            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                {isExpanded ? description : `${description.substring(0, 150)}...`}
                            </p>

                            {/* Distribución de sentimientos: Barra + Leyenda explicativa */}
                            <div className="space-y-3 mb-4">
                                {/* Barra visual */}
                                <div className="flex h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                    {percentages.Bullish > 0 && (
                                        <div
                                            className="bg-green-500 border-r border-white/10"
                                            style={{ width: `${percentages.Bullish}%` }}
                                        />
                                    )}
                                    {percentages.Neutral > 0 && (
                                        <div
                                            className="bg-slate-400 border-r border-white/10"
                                            style={{ width: `${percentages.Neutral}%` }}
                                        />
                                    )}
                                    {percentages.Bearish > 0 && (
                                        <div
                                            className="bg-red-500"
                                            style={{ width: `${percentages.Bearish}%` }}
                                        />
                                    )}
                                </div>

                                {/* Leyenda con porcentajes */}
                                <div className="flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-bold uppercase tracking-wider">
                                    {percentages.Bullish > 0 && (
                                        <div className="flex items-center gap-2 text-green-700">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            <span>Bullish {percentages.Bullish}%</span>
                                        </div>
                                    )}
                                    {percentages.Neutral > 0 && (
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <div className="w-2 h-2 rounded-full bg-slate-400" />
                                            <span>Neutral {percentages.Neutral}%</span>
                                        </div>
                                    )}
                                    {percentages.Bearish > 0 && (
                                        <div className="flex items-center gap-2 text-red-600">
                                            <div className="w-2 h-2 rounded-full bg-red-500" />
                                            <span>Bearish {percentages.Bearish}%</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Estadísticas */}
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                <span>📊 {calls_count} analyses</span>
                                <span>🏢 {institutions_count} institutions</span>
                            </div>
                        </div>

                        <ChevronDown
                            className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''
                                }`}
                        />
                    </div>

                    {/* Contenido expandido */}
                    {isExpanded && (
                        <div className="mt-6 pt-6 border-t border-border space-y-4">


                            {/* Main institutions */}
                            {institutions.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">
                                        Key Institutions
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



                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}
