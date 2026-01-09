import { NextRequest, NextResponse } from 'next/server';
import { getCompareStats } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year1 = parseInt(searchParams.get('year1') || '');
    const year2 = parseInt(searchParams.get('year2') || '');

    if (isNaN(year1) || isNaN(year2)) {
      return NextResponse.json({ error: 'year1 and year2 are required parameters' }, { status: 400 });
    }

    const result = await getCompareStats(year1, year2);
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
