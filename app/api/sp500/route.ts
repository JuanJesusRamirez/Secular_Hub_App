import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'SP500.csv');
    const fileContent = fs.readFileSync(filePath, 'latin1'); // Use latin1 encoding
    
    // Split by lines and filter out empty lines
    const lines = fileContent.split('\n').map(l => l.trim()).filter(l => l);
    
    // Parse header (line 1)
    const headers = lines[0].split(';');
    
    // Find the comments line - it should be line 257 (index 256)
    let commentsLine = null;
    if (lines.length >= 257) {
      commentsLine = lines[256]; // Line 257 (0-indexed)
    }
    
    // Parse comments
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
    
    // Parse data (exclude comment lines - only lines with dates)
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
      headers: headers.slice(1), // Exclude date
      data,
      comments
    });
  } catch (error) {
    console.error('Error reading SP500.csv:', error);
    return NextResponse.json(
      { error: 'Failed to read SP500 data' },
      { status: 500 }
    );
  }
}
