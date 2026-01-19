import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'DXY.csv');
    // Read as UTF-8 since pandas to_csv default is utf-8
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    const lines = fileContent.split('\n').map(l => l.trim()).filter(l => l);
    
    if (lines.length === 0) {
        return NextResponse.json({ headers: [], data: [], comments: {} });
    }

    const headers = lines[0].split(';');
    
    const data = lines.slice(1).map(line => {
      const values = line.split(';');
      const row: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index];
        if (header === 'Dates') {
            row.date = value;
        } else {
            if (value && value.trim() !== '') {
                const numValue = parseFloat(value);
                row[header] = isNaN(numValue) ? null : numValue;
            } else {
                row[header] = null;
            }
        }
      });
      
      return row;
    });
    
    return NextResponse.json({
      headers: headers.filter(h => h !== 'Dates'),
      data,
      comments: {} // No comments in this file structure yet
    });
  } catch (error) {
    console.error('Error reading DXY.csv:', error);
    return NextResponse.json(
      { error: 'Failed to read DXY data' },
      { status: 500 }
    );
  }
}
