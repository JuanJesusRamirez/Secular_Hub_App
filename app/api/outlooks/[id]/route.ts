import { NextRequest, NextResponse } from 'next/server';
import { getOutlookById } from '@/lib/db/queries';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const outlook = await getOutlookById(id);

    if (!outlook) {
      return NextResponse.json({ error: 'Outlook not found' }, { status: 404 });
    }

    return NextResponse.json({ data: outlook });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
