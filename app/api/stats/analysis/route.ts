import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const scoring = searchParams.get('scoring') || 'importance';
        const limitParam = searchParams.get('limit') || '200';
        const limit = parseInt(limitParam, 10) || 200;
        const mode = searchParams.get('mode') || 'words';
        const yearParam = searchParams.get('year') || '2022';
        const year = parseInt(yearParam, 10) || 2022;

        // 1. Try to fetch from Cache first
        const cacheKey = {
            year,
            mode: mode as string,
            scoring: scoring as string,
            wordLimit: limit
        };

        const cached = await prisma.wordCloudCache.findUnique({
            where: {
                year_mode_scoring_wordLimit: cacheKey
            }
        });

        // If cache exists and is less than 24 hours old, return it
        if (cached && (Date.now() - new Date(cached.updatedAt).getTime() < 24 * 60 * 60 * 1000)) {
            console.log(`🚀 Serving from Cache: ${year}-${mode}-${scoring}`);
            return NextResponse.json(JSON.parse(cached.data));
        }

        console.log(`🔍 Cache Miss: Fetching from Database for ${year}-${mode}-${scoring}`);

        // 2. Fetch from Database using Prisma
        const analysisRows = mode === 'phrases'
            ? await prisma.phraseAnalysis.findMany({
                where: { year },
                orderBy: scoring === 'frequency' ? { frequency: 'desc' } : { tfidfScore: 'desc' },
                take: limit,
            })
            : await prisma.wordAnalysis.findMany({
                where: { year },
                orderBy: scoring === 'frequency' ? { frequency: 'desc' } : { tfidfScore: 'desc' },
                take: limit,
            });

        if (!analysisRows || analysisRows.length === 0) {
            return NextResponse.json({
                error: `No data found in database for year ${year} (${mode})`
            }, { status: 404 });
        }

        const processedData = analysisRows.map(row => {
            const tfidf = row.tfidfScore;
            const freq = row.frequency;
            const sentiment = row.sentimentLabel?.toLowerCase();
            const sentimentScore = row.sentimentScore;

            let adjustedSentiment = sentimentScore;
            if (sentiment === 'negative') adjustedSentiment = -sentimentScore;
            else if (sentiment === 'neutral' || !sentiment) adjustedSentiment = 0;
            else if (sentiment === 'positive') adjustedSentiment = sentimentScore;

            return {
                text: row.term,
                tfidf,
                frequency: freq,
                semanticPosition: row.semanticPosition,
                value: scoring === 'frequency' ? freq : tfidf,
                sentiment: row.sentimentLabel,
                sentimentScore,
                adjustedSentiment
            };
        });

        const wordRainData = processedData.map(w => ({
            text: w.text,
            semanticX: w.semanticPosition,
            avgTfidf: w.tfidf,
            yearData: {
                [year]: {
                    frequency: w.frequency,
                    tfidf: w.tfidf,
                    sentiment: w.adjustedSentiment
                }
            }
        }));

        // Fetch available years for the indicator
        const availableYearsData = mode === 'phrases'
            ? await prisma.phraseAnalysis.findMany({ select: { year: true }, distinct: ['year'] })
            : await prisma.wordAnalysis.findMany({ select: { year: true }, distinct: ['year'] });

        const availableYears = availableYearsData.map(y => y.year).sort();

        const responseData = {
            year: year,
            wordCount: processedData.length,
            totalDocuments: 1, // Placeholder
            uniqueInstitutions: 1, // Placeholder
            words: processedData.map(w => ({ text: w.text, value: w.value })),
            wordRainWords: wordRainData,
            availableYears: availableYears.length > 0 ? availableYears : [2022, 2025],
            mode: mode,
            scoring: scoring,
            analysisData: processedData // Renamed from csv_data
        };

        // 3. Save to Cache for next time
        await prisma.wordCloudCache.upsert({
            where: {
                year_mode_scoring_wordLimit: cacheKey
            },
            update: {
                data: JSON.stringify(responseData),
                updatedAt: new Date()
            },
            create: {
                ...cacheKey,
                data: JSON.stringify(responseData),
                totalDocs: 1,
                uniqueInst: 1
            }
        });

        return NextResponse.json(responseData);
    } catch (error) {
        console.error('Error fetching analysis:', error);
        return NextResponse.json({ error: 'Failed to process analysis data' }, { status: 500 });
    }
}
