import { NextResponse } from 'next/server';
import { getStats } from '@/lib/db/queries';

export async function GET() {
  try {
    const stats = await getStats();
    console.log('[API] /api/stats: Stats fetched. Serializing manually.');
    const json = JSON.stringify(stats, (key, value) =>
        typeof value === 'bigint' ? Number(value) : value
    );
    return new Response(json, { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('[API] /api/stats Error:', error);
    // @ts-ignore
    if (error.stack) console.error(error.stack);
    return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
  }
}
