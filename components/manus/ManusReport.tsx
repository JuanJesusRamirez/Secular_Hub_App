
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
                    <p className="text-muted-foreground">Loading market analysis...</p>
                </div>
            </div>
        );
    }

    // Calculate statistics
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
            label: 'Bullish Assets',
            description: 'Positive market sentiment'
        },
        {
            number: String(totalCalls),
            label: 'Total Analyses',
            description: 'Investment Outlooks'
        },
        {
            number: String(totalInstitutions),
            label: 'Institutions',
            description: 'Global Coverage'
        }
    ];

    return (
        <div className="bg-white min-h-screen animate-in fade-in duration-500">
            <Header />

            <main className="container max-w-7xl mx-auto px-6">
                {/* Estadísticas clave */}
                <StatsOverview stats={stats} />

                {/* Divisor sutil */}
                <div className="h-px bg-slate-100 my-4" />

                <section className="py-8">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-primary mb-6 text-center">
                            2026 Sentiment Analysis
                        </h2>
                        <div className="space-y-4 text-slate-700 leading-relaxed text-lg text-justify">
                            <p>
                                This report presents a comprehensive analysis of market sentiment for 2026, based on {totalCalls} investment perspectives from {totalInstitutions} global financial institutions. Each asset class has been evaluated in terms of its dominant sentiment (Bullish, Neutral, or Bearish) and its strategic expectations.
                            </p>
                            <p>
                                Sentiment analysis has been extracted using natural language processing from investment outlooks, identifying patterns of optimism, caution, and pessimism. The sentiment distribution reflects the institutional consensus on the outlook for each asset for the coming year.
                            </p>
                            <p className="text-center font-medium">
                                Overall Sentiment: <span className="font-semibold text-green-700">{bullishCount} bullish assets</span>, <span className="font-semibold text-slate-700">{neutralCount} neutral</span>, and <span className="font-semibold text-red-700">{bearishCount} bearish</span>.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Subtle divider */}
                <div className="h-px bg-slate-100 my-4" />

                {/* Asset list with sentiment */}
                <AssetsList
                    assets={assets}
                    title="Asset Analysis by Sentiment"
                    description="Explore market sentiment, expectations, and distribution of institutional opinions for each asset class"
                />

                {/* Methodology */}
                <section className="py-6 bg-slate-50/50 rounded-xl px-6 my-4">
                    <div className="max-w-3xl">
                        <h2 className="text-3xl font-bold text-primary mb-6">
                            Methodology
                        </h2>
                        <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
                            <p>
                                <strong>Sentiment Analysis:</strong> Natural language processing was applied to {totalCalls} investment perspectives to classify each institution's sentiment as Bullish (optimistic), Neutral (balanced), or Bearish (pessimistic).
                            </p>
                            <p>
                                <strong>Aggregation by Asset:</strong> Sentiments were grouped by asset class, determining the dominant sentiment based on the distribution of institutional opinions.
                            </p>
                            <p>
                                <strong>Market Expectations:</strong> Strategic expectations for each asset were extracted from the executive summaries of the outlooks, providing context on the key factors driving sentiment.
                            </p>
                            <p>
                                <strong>Institutional Coverage:</strong> The analysis includes outlooks from major global financial institutions, ensuring a balanced representation of market consensus.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-8 text-center text-sm text-slate-400">
                    <p>2026 Sentiment Analysis Report • Global Investment Outlooks</p>
                    <p className="mt-2">Data processed from {totalCalls} analyses of {totalInstitutions} financial institutions</p>
                </footer>
            </main>
        </div>
    );
}
