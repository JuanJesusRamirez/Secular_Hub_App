import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const scoring = searchParams.get('scoring') || 'importance';
        const limitParam = searchParams.get('limit') || '200';
        const limit = parseInt(limitParam, 10) || 200;
        const mode = searchParams.get('mode') || 'words';
        const yearParam = searchParams.get('year') || '2026';

        let year: number;
        if (yearParam === 'all') {
            year = 0;
        } else {
            year = parseInt(yearParam, 10) || 2026;
        }

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
        }).catch(() => null);

        // If cache exists and is less than 24 hours old, return it
        if (cached && (Date.now() - new Date(cached.updatedAt).getTime() < 24 * 60 * 60 * 1000)) {
            console.log(`🚀 Serving from Cache: ${year}-${mode}-${scoring}`);
            return NextResponse.json(JSON.parse(cached.data));
        }

        console.log(`🔍 Cache Miss: Fetching from Database for ${year}-${mode}-${scoring}`);

        // 2. Fetch from Database using Raw SQL to bypass outdated Prisma client types
        const tableName = mode === 'phrases' ? 'phrase_analysis' : 'word_analysis';
        const orderBy = scoring === 'frequency' ? 'frequency DESC' : 'tfidf_score DESC';

        const analysisRows: any[] = await prisma.$queryRawUnsafe(`
            SELECT 
                term, 
                year, 
                tfidf_score as "tfidfScore", 
                semantic_position as "semanticPosition", 
                frequency, 
                relative_frequency as "relativeFreq", 
                sentiment_label as "sentimentLabel", 
                sentiment_score as "sentimentScore"
            FROM "${tableName}"
            WHERE "year" = $1
            ORDER BY ${orderBy}
            LIMIT $2
        `, year, limit);

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

        // Fetch available years for the indicator using Raw SQL
        const yearsRows: any[] = await prisma.$queryRawUnsafe(`
            SELECT DISTINCT "year" FROM "${tableName}" ORDER BY "year" ASC
        `);
        const uniqueYears = yearsRows.map(r => r.year);

        const responseData = {
            year: year === 0 ? 'all' : year,
            wordCount: processedData.length,
            totalDocuments: 1, // Placeholder
            uniqueInstitutions: 1, // Placeholder
            words: processedData.map(w => ({ text: w.text, value: w.value })),
            wordRainWords: wordRainData,
            availableYears: uniqueYears.length > 0 ? uniqueYears : [2022, 2025],
            mode: mode,
            scoring: scoring,
            analysisData: processedData
        };

        // 3. Save to Cache for next time
        // Note: WordCloudCache should exist in your DB since we did db push
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
        }).catch(err => console.error("Cache save error:", err));

        return NextResponse.json(responseData);
    } catch (error) {
        console.error('Error fetching analysis:', error);
        return NextResponse.json({ error: 'Failed to process analysis data' }, { status: 500 });
    }
}
