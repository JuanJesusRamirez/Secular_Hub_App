import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'XAU.csv');
    const fileContent = fs.readFileSync(filePath, 'latin1');
    
    const lines = fileContent.split('\n').map(l => l.trim()).filter(l => l);
    
    const headers = lines[0].split(';');
    
    let commentsLine = null;
    if (lines.length >= 623) {
      commentsLine = lines[622]; // Last line with comments
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
        if (value && value.trim() !== '') {
          // Handle European format: 2.657,16 -> remove dots (thousands separator) and replace comma with dot
          const cleanValue = value.replace(/\./g, '').replace(',', '.');
          const numValue = parseFloat(cleanValue);
          row[header] = isNaN(numValue) ? null : numValue;
        } else {
          row[header] = null;
        }
      });
      
      return row;
    });
    
    return NextResponse.json({
      headers: headers.slice(1),
      data,
      comments
    });
  } catch (error) {
    console.error('Error reading XAU.csv:', error);
    return NextResponse.json(
      { error: 'Failed to read XAU data' },
      { status: 500 }
    );
  }
}