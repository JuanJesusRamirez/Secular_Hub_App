import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const { terms } = await request.json();
        const csvPath = path.join(process.cwd(), 'word_rain_data_2022.csv');

        if (!fs.existsSync(csvPath)) {
            return NextResponse.json({ error: 'CSV file not found' }, { status: 404 });
        }

        const fileContent = fs.readFileSync(csvPath, 'utf8');
        const lines = fileContent.split(/\r?\n/);
        const headers = lines[0].split(',').map(h => h.trim());

        const sentimentMap: Record<string, any> = {};

        lines.slice(1).forEach(line => {
            if (!line.trim()) return;
            const values = line.split(',');
            const word = values[headers.indexOf('word')]?.trim().toLowerCase();
            const label = values[headers.indexOf('sentiment_label')]?.trim().toLowerCase();
            const score = parseFloat(values[headers.indexOf('sentiment_score')]);

            let normalizedScore = 0;
            if (label === 'positive') normalizedScore = score;
            else if (label === 'negative') normalizedScore = -score;

            sentimentMap[word] = {
                label,
                score,
                normalizedScore
            };
        });

        const results: Record<string, any> = {};
        terms.forEach((term: string) => {
            const lowerTerm = term.toLowerCase();
            if (sentimentMap[lowerTerm]) {
                results[term] = sentimentMap[lowerTerm];
            } else {
                results[term] = { label: 'neutral', score: 0.5, normalizedScore: 0 };
            }
        });

        return NextResponse.json({ results });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to process sentiment' }, { status: 500 });
    }
}
