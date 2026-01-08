import { NextRequest, NextResponse } from 'next/server';
import { getThemeRankings } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startYear = parseInt(searchParams.get('start') || '2019');
  const endYear = parseInt(searchParams.get('end') || '2026');
  const topN = parseInt(searchParams.get('top') || '10');

  try {
    const data = await getThemeRankings(startYear, endYear, topN);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching theme rankings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch theme rankings' },
      { status: 500 }
    );
  }
}
