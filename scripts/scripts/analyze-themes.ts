import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

interface ExcelRow {
  Theme?: string;
  [key: string]: unknown;
}

const filePath = path.join(process.cwd(), 'Bloomberg_Outlooks_2019_2026.xlsx');
console.log(`Reading file from: ${filePath}`);

if (!fs.existsSync(filePath)) {
  console.error('File not found!');
  process.exit(1);
}

const wb = XLSX.readFile(filePath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json<ExcelRow>(sheet);

const themes = new Set<string>();
data.forEach((r) => {
  if (r.Theme) {
    themes.add(r.Theme.toString().trim());
  }
});

const sortedThemes = Array.from(themes).sort();
fs.writeFileSync('themes.json', JSON.stringify(sortedThemes, null, 2));
console.log('Themes written to themes.json');
