import { NextRequest, NextResponse } from 'next/server';
import { getYearOverview } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam, 10) : 2026;

    if (isNaN(year) || year < 2019 || year > 2026) {
      return NextResponse.json(
        { error: 'Invalid year. Must be between 2019 and 2026.' },
        { status: 400 }
      );
    }

    const overview = await getYearOverview(year);

    // Manual JSON serialization to handle BigInt values
    const json = JSON.stringify(overview, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    );

    return new Response(json, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[API] /api/overview Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: String(error) },
      { status: 500 }
    );
  }
}
