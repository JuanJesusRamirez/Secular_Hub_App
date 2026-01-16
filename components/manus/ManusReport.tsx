
"use client";

import { useEffect, useState } from 'react';
import Header from './Header';
import StatsOverview from './StatsOverview';
import AssetsList from './AssetsList';
import { MANUS_ASSETS_DATA } from '@/lib/data/manus-data';

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

// Helper to simulate data loading for smoothness
const useAssetsData = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<typeof MANUS_ASSETS_DATA | null>(null);

    useEffect(() => {
        // Imitate fetch delay
        const timer = setTimeout(() => {
            setData(MANUS_ASSETS_DATA);
            setLoading(false);
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    return { loading, data };
};

export default function ManusReport() {
    const { loading, data } = useAssetsData();
    // Safe cast since we know the structure matches
    const assets = (data || {}) as unknown as Record<string, Asset>;

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center bg-white rounded-xl">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
                    <p className="text-muted-foreground">Cargando análisis de mercado...</p>
                </div>
            </div>
        );
    }

    // Calcular estadísticas
    const values = Object.values(assets);
    const bullishCount = values.filter((a) => a.sentiment === 'Bullish').length;
    const bearishCount = values.filter((a) => a.sentiment === 'Bearish').length;
    const neutralCount = values.filter((a) => a.sentiment === 'Neutral').length;
    const totalCalls = values.reduce((sum, a) => sum + a.calls_count, 0);
    const totalInstitutions = new Set(
        values.flatMap((a) => a.institutions)
    ).size;

    const stats = [
        {
            number: String(bullishCount),
            label: 'Assets Alcistas',
            description: 'Sentimiento positivo del mercado'
        },
        {
            number: String(totalCalls),
            label: 'Análisis Totales',
            description: 'Perspectivas de inversión'
        },
        {
            number: String(totalInstitutions),
            label: 'Instituciones',
            description: 'Cobertura global'
        }
    ];

    return (
        <div className="bg-white min-h-screen animate-in fade-in duration-500">
            <Header />

            <main className="container max-w-7xl mx-auto px-6">
                {/* Estadísticas clave */}
                <StatsOverview stats={stats} />

                {/* Divisor sutil */}
                <div className="h-px bg-slate-100 my-12" />

                {/* Resumen ejecutivo */}
                <section className="py-16">
                    <div className="max-w-3xl">
                        <h2 className="text-3xl font-bold text-primary mb-6">
                            Análisis de Sentimiento 2026
                        </h2>
                        <div className="space-y-4 text-slate-700 leading-relaxed text-lg">
                            <p>
                                Este informe presenta un análisis comprensivo del sentimiento de mercado para 2026, basado en {totalCalls} perspectivas de inversión de {totalInstitutions} instituciones financieras globales. Cada clase de activo ha sido evaluada en términos de su sentimiento dominante (Alcista, Neutral o Bajista) y sus expectativas estratégicas.
                            </p>
                            <p>
                                El análisis de sentimiento se ha extraído mediante procesamiento de lenguaje natural de los outlooks de inversión, identificando patrones de optimismo, cautela y pesimismo. La distribución de sentimientos refleja el consenso institucional sobre las perspectivas de cada asset para el próximo año.
                            </p>
                            <p>
                                Sentimiento general: <span className="font-semibold text-green-700">{bullishCount} assets alcistas</span>, <span className="font-semibold text-slate-700">{neutralCount} neutrales</span>, y <span className="font-semibold text-red-700">{bearishCount} bajistas</span>.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Divisor sutil */}
                <div className="h-px bg-slate-100 my-12" />

                {/* Lista de assets con sentimiento */}
                <AssetsList
                    assets={assets}
                    title="Análisis de Assets por Sentimiento"
                    description="Explorar el sentimiento de mercado, expectativas y distribución de opiniones institucionales para cada clase de activo"
                />

                {/* Metodología */}
                <section className="py-16 bg-slate-50/50 rounded-xl px-8 my-12">
                    <div className="max-w-3xl">
                        <h2 className="text-3xl font-bold text-primary mb-6">
                            Metodología
                        </h2>
                        <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
                            <p>
                                <strong>Análisis de Sentimiento:</strong> Se aplicó procesamiento de lenguaje natural a {totalCalls} perspectivas de inversión para clasificar el sentimiento de cada institución como Alcista (optimista), Neutral (equilibrado) o Bajista (pesimista).
                            </p>
                            <p>
                                <strong>Agregación por Asset:</strong> Los sentimientos se agruparon por clase de activo, determinando el sentimiento dominante basado en la distribución de opiniones institucionales.
                            </p>
                            <p>
                                <strong>Expectativas de Mercado:</strong> Se extrajeron las expectativas estratégicas de cada asset desde los resúmenes ejecutivos de los outlooks, proporcionando contexto sobre los factores clave que impulsan el sentimiento.
                            </p>
                            <p>
                                <strong>Cobertura Institucional:</strong> El análisis incluye perspectivas de las principales instituciones financieras globales, asegurando una representación equilibrada del consenso de mercado.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 text-center text-sm text-slate-400">
                    <p>Informe de Análisis de Sentimiento 2026 • Perspectivas de Inversión Global</p>
                    <p className="mt-2">Datos procesados desde {totalCalls} análisis de {totalInstitutions} instituciones financieras</p>
                </footer>
            </main>
        </div>
    );
}
