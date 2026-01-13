import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const scoring = searchParams.get('scoring') || 'importance';
        const limitParam = searchParams.get('limit') || '200';
        const limit = parseInt(limitParam, 10) || 200;
        const mode = searchParams.get('mode') || 'words';
        const yearParam = searchParams.get('year') || '2022';

        const year = parseInt(yearParam, 10) || 2022;

        const csvFile = mode === 'phrases'
            ? `word_rain_phrases_data_${year}.csv`
            : `word_rain_data_${year}.csv`;

        const csvPath = path.join(process.cwd(), csvFile);

        if (!fs.existsSync(csvPath)) {
            return NextResponse.json({ error: `CSV file not found: ${csvFile}` }, { status: 404 });
        }

        const fileContent = fs.readFileSync(csvPath, 'utf8');
        const lines = fileContent.split(/\r?\n/);
        const headers = lines[0].split(',').map(h => h.trim());

        const words = lines.slice(1)
            .filter(line => line.trim() !== '')
            .map(line => {
                const values = line.split(',');
                const row: any = {};
                headers.forEach((header, i) => {
                    row[header] = values[i]?.trim();
                });

                const text = row.word || row.text;
                const tfidf = parseFloat(row.tfidf_score) || 0;
                const freq = parseInt(row.frequency) || 0;
                const semanticPosition = parseFloat(row.semantic_position) || 0.5;
                const sentiment = row.sentiment_label?.toLowerCase();
                const sentimentScore = parseFloat(row.sentiment_score) || 0;

                let adjustedSentiment = sentimentScore;
                if (sentiment === 'negative') adjustedSentiment = -sentimentScore;
                else if (sentiment === 'neutral' || !sentiment) adjustedSentiment = 0;
                else if (sentiment === 'positive') adjustedSentiment = sentimentScore;

                return {
                    text,
                    tfidf,
                    frequency: freq,
                    semanticPosition,
                    value: scoring === 'frequency' ? freq : tfidf,
                    sentiment,
                    sentimentScore,
                    adjustedSentiment
                };
            });

        const sortedWords = words
            .sort((a, b) => b.value - a.value)
            .slice(0, limit);

        const wordRainData = sortedWords.map(w => ({
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

        return NextResponse.json({
            year: year,
            wordCount: sortedWords.length,
            totalDocuments: 1,
            uniqueInstitutions: 1,
            words: sortedWords.map(w => ({ text: w.text, value: w.value })),
            wordRainWords: wordRainData,
            availableYears: [year],
            mode: mode,
            scoring: scoring,
            csv_data: sortedWords
        });
    } catch (error) {
        console.error('Error reading CSV:', error);
        return NextResponse.json({ error: 'Failed to process CSV' }, { status: 500 });
    }
}
