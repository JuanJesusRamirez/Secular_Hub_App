import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

export interface TesisRecord {
  themesAssets: string;
  rank: number;
  year: number;
  consensusThesis: string;
  tesisExPost: string;
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'tesis agregadas.csv');
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Parse CSV with semicolon delimiter
    const parsed = Papa.parse(fileContent, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
    });

    const data: TesisRecord[] = parsed.data.map((row: any) => ({
      themesAssets: row['Themes + Assets'] || '',
      rank: parseInt(row['Rank']) || 0,
      year: parseInt(row['Year']) || 0,
      consensusThesis: row['Consensus Thesis'] || '',
      tesisExPost: row['Tesis Ex Post'] || '',
    }));

    // Filter out invalid records
    const validData = data.filter(
      record => record.themesAssets && record.year && record.rank
    );

    return NextResponse.json(validData);
  } catch (error) {
    console.error('Error reading tesis data:', error);
    return NextResponse.json(
      { error: 'Failed to load tesis data' },
      { status: 500 }
    );
  }
}
