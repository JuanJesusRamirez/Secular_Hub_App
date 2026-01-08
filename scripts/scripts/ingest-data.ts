import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { themeMapping as themeMap } from './theme-mapping';
import { institutionMapping as instMap } from './institution-mapping';

interface ExcelRow {
  id: string;
  Year?: string | number;
  Theme?: string;
  Institution?: string;
  Sub_theme?: string;
  Section_description?: string;
  Call_text?: string;
  Rank?: string | number;
}

const prisma = new PrismaClient();

async function ingest() {
  const filePath = path.join(process.cwd(), 'Bloomberg_Outlooks_2019_2026.xlsx');
  if (!fs.existsSync(filePath)) {
    console.error('Excel file not found');
    process.exit(1);
  }

  console.log('Reading Excel file...');
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json<ExcelRow>(sheet);

  console.log(`Found ${data.length} records. Starting ingestion...`);

  let processed = 0;

  for (const row of data) {
    const originalTheme = row.Theme ? row.Theme.toString().trim() : 'Unknown';
    const category = themeMap[originalTheme] || 'Thematic';
    const originalInst = row.Institution ? row.Institution.toString().trim() : 'Unknown';
    const cleanInst = instMap[originalInst] || originalInst;
    
    const rank = row.Rank ? parseInt(String(row.Rank)) : null;
    let conviction = 'low';
    if (rank) {
      if (rank <= 10) conviction = 'high';
      else if (rank <= 30) conviction = 'medium';
    }

    const callText = row.Call_text ? row.Call_text.toString() : '';
    const wordCount = callText.trim().split(/\s+/).length;

    await prisma.outlookCall.create({
      data: {
        id: row.id,
        year: row.Year ? parseInt(String(row.Year)) : 0,
        institution: originalInst,
        institutionCanonical: cleanInst,
        theme: originalTheme,
        subTheme: row.Sub_theme ? row.Sub_theme.toString() : null,
        themeCategory: category,
        sectionDescription: row.Section_description ? row.Section_description.toString() : null,
        callText: callText,
        rank: rank,
        convictionTier: conviction,
        wordCount: wordCount
      }
    });

    processed++;
    if (processed % 100 === 0) {
      process.stdout.write(`\rProcessed ${processed} records...`);
    }
  }

  console.log(`\nIngestion complete. Processed ${processed} records.`);
}

ingest()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
