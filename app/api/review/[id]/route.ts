import { NextRequest, NextResponse } from 'next/server';
import {
  getReviewItemById,
  approveReviewItem,
  rejectReviewItem,
  editReviewItem,
} from '@/lib/db/review-queries';

/**
 * GET /api/review/[id]
 * Get a single review item by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const item = await getReviewItemById(id);

    if (!item) {
      return NextResponse.json({ error: 'Review item not found' }, { status: 404 });
    }

    return NextResponse.json({ data: item });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PATCH /api/review/[id]
 * Update a review item (approve, reject, or edit)
 *
 * Body:
 *   action: 'approve' | 'reject' | 'edit'
 *   value?: string (required for 'edit' action)
 *   reviewedBy?: string
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const { action, value, reviewedBy = 'user' } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'approve':
        result = await approveReviewItem(id, reviewedBy);
        break;

      case 'reject':
        result = await rejectReviewItem(id, reviewedBy);
        break;

      case 'edit':
        if (!value || typeof value !== 'string') {
          return NextResponse.json(
            { error: 'Value is required for edit action' },
            { status: 400 }
          );
        }
        result = await editReviewItem(id, value, reviewedBy);
        break;

      default:
        return NextResponse.json(
          { error: `Invalid action: ${action}. Must be approve, reject, or edit.` },
          { status: 400 }
        );
    }

    return NextResponse.json({ data: result });
  } catch (error: any) {
    console.error('API Error:', error);

    if (error.message === 'Review item not found') {
      return NextResponse.json({ error: 'Review item not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
