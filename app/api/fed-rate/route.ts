import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'Rate FED.csv');
    const fileContent = fs.readFileSync(filePath, 'latin1');
    
    const lines = fileContent.split('\n').map(l => l.trim()).filter(l => l);
    
    const headers = lines[0].split(';');
    
    let commentsLine: string | null = null;
    for (let i = lines.length - 1; i >= 0; i--) {
      const columns = lines[i].split(';');
      const firstCol = columns[0];
      if (!firstCol || !firstCol.includes('/')) {
        if (columns.length > 1) {
          commentsLine = lines[i];
          break;
        }
      }
    }
    
    const comments: { [key: string]: string } = {};
    if (commentsLine) {
      const commentValues = commentsLine.split(';');
      headers.slice(1).forEach((header, index) => {
        const comment = commentValues[index + 1];
        if (comment && comment.trim()) {
          comments[header] = comment.trim();
        }
      });
    }
    
    const data = lines.slice(1).filter(line => {
      const firstCol = line.split(';')[0];
      return firstCol && firstCol.includes('/');
    }).map(line => {
      const values = line.split(';');
      const row: any = {
        date: values[0]
      };
      
      headers.slice(1).forEach((header, index) => {
        const value = values[index + 1];
        row[header] = value && value.trim() !== '' ? parseFloat(value) : null;
      });
      
      return row;
    });
    
    return NextResponse.json({
      headers: headers.slice(1),
      data,
      comments
    });
  } catch (error) {
    console.error('Error reading Rate FED.csv:', error);
    return NextResponse.json(
      { error: 'Failed to read FED Rate data' },
      { status: 500 }
    );
  }
}