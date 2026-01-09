import { NextRequest, NextResponse } from 'next/server';
import { getReviewQueue, getReviewStats } from '@/lib/db/review-queries';

export const dynamic = 'force-dynamic';

/**
 * GET /api/review
 * Get review queue items or stats
 *
 * Query params:
 *   stats=true       - Return stats instead of items
 *   status=pending   - Filter by status (pending, approved, rejected, edited)
 *   field=subTheme   - Filter by field type (subTheme, sectionDescription)
 *   limit=50         - Items per page
 *   page=1           - Page number
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Return stats if requested
    if (searchParams.get('stats') === 'true') {
      const stats = await getReviewStats();
      return NextResponse.json({ data: stats });
    }

    // Otherwise return paginated queue items
    const status = searchParams.get('status') || 'pending';
    const field = searchParams.get('field') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    const result = await getReviewQueue({ status, field, limit, page });

    return NextResponse.json({
      data: result.items,
      meta: {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        limit,
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
