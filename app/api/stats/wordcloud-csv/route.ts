import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const scoring = searchParams.get('scoring') || 'importance';
        const limitParam = searchParams.get('limit') || '150';
        const limit = parseInt(limitParam, 10) || 150;

        const csvPath = path.join(process.cwd(), 'word_rain_data_2022.csv');

        if (!fs.existsSync(csvPath)) {
            return NextResponse.json({ error: 'CSV file not found' }, { status: 404 });
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
                return row;
            })
            .map(row => {
                const tfidf = parseFloat(row.tfidf_score) || 0;
                const freq = parseInt(row.frequency) || 0;
                return {
                    text: row.word,
                    tfidf: tfidf,
                    frequency: freq,
                    semanticPosition: row.semantic_position,
                    value: scoring === 'frequency' ? freq : tfidf,
                    sentiment: row.sentiment_label,
                    sentimentScore: parseFloat(row.sentiment_score) || 0
                };
            });

        // Format for WordCloud component
        const sortedWords = words
            .sort((a, b) => b.value - a.value)
            .slice(0, limit);

        // Prepare full data for Word Rain
        const wordRainData = sortedWords.map(w => {
            let adjustedScore = w.sentimentScore;
            if (w.sentiment === 'Negative') adjustedScore = -w.sentimentScore;
            else if (w.sentiment === 'Neutral') adjustedScore = 0; // neutral usually stays near 0

            return {
                text: w.text,
                semanticX: parseFloat(w.semanticPosition) || 0.5,
                avgTfidf: w.tfidf,
                yearData: {
                    2022: {
                        frequency: w.frequency,
                        tfidf: w.tfidf,
                        sentiment: adjustedScore
                    }
                }
            };
        });

        return NextResponse.json({
            year: 2022,
            wordCount: sortedWords.length,
            totalDocuments: 1,
            uniqueInstitutions: 1,
            words: sortedWords.map(w => ({ text: w.text, value: w.value })),
            wordRainWords: wordRainData,
            availableYears: [2022],
            mode: 'words',
            scoring: scoring,
            csv_data: sortedWords
        });
    } catch (error) {
        console.error('Error reading CSV:', error);
        return NextResponse.json({ error: 'Failed to process CSV' }, { status: 500 });
    }
}
