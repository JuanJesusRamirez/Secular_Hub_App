import { prisma } from './client';

export interface ReviewItem {
  id: string;
  outlookCallId: string;
  field: string;
  generatedValue: string;
  confidence: number;
  status: string;
  createdAt: Date;
  outlookCall: {
    year: number;
    institution: string;
    theme: string;
    subTheme: string | null;
    callText: string | null;
  } | null;
}

export interface ReviewQueueOptions {
  status?: string;
  field?: string;
  limit?: number;
  page?: number;
}

/**
 * Get paginated review queue items with associated outlook call data
 */
export async function getReviewQueue(options: ReviewQueueOptions): Promise<{
  items: ReviewItem[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const { status = 'pending', field, limit = 50, page = 1 } = options;
  const skip = (page - 1) * limit;

  const where: any = { status };
  if (field) where.field = field;

  const [items, total] = await Promise.all([
    prisma.reviewQueue.findMany({
      where,
      orderBy: { confidence: 'asc' }, // Lowest confidence first (most needing review)
      take: limit,
      skip,
    }),
    prisma.reviewQueue.count({ where }),
  ]);

  // Fetch related outlook calls
  const enrichedItems = await Promise.all(
    items.map(async (item) => {
      const outlookCall = await prisma.outlookCall.findUnique({
        where: { id: item.outlookCallId },
        select: {
          year: true,
          institution: true,
          theme: true,
          subTheme: true,
          callText: true,
        },
      });
      return { ...item, outlookCall } as ReviewItem;
    })
  );

  return {
    items: enrichedItems,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Approve a review item - accept the generated value as-is
 */
export async function approveReviewItem(id: string, reviewedBy: string = 'system') {
  const item = await prisma.reviewQueue.findUnique({ where: { id } });
  if (!item) throw new Error('Review item not found');

  await prisma.$transaction([
    // Update the outlook call with the generated value (it's already there, but mark as reviewed)
    prisma.outlookCall.update({
      where: { id: item.outlookCallId },
      data: {
        needsReview: false,
        reviewedAt: new Date(),
      },
    }),
    // Mark review item as approved
    prisma.reviewQueue.update({
      where: { id },
      data: {
        status: 'approved',
        reviewedBy,
        reviewedAt: new Date(),
        finalValue: item.generatedValue,
      },
    }),
  ]);

  return { success: true };
}

/**
 * Reject a review item - clear the generated value from the outlook call
 */
export async function rejectReviewItem(id: string, reviewedBy: string = 'system') {
  const item = await prisma.reviewQueue.findUnique({ where: { id } });
  if (!item) throw new Error('Review item not found');

  // Build update data based on which field was rejected
  const updateData: any = {
    needsReview: false,
    reviewedAt: new Date(),
  };

  if (item.field === 'subTheme') {
    updateData.subTheme = null;
    updateData.subThemeGenerated = false;
    updateData.subThemeConfidence = null;
  } else if (item.field === 'sectionDescription') {
    updateData.sectionDescription = null;
    updateData.sectionDescGenerated = false;
    updateData.sectionDescConfidence = null;
  }

  await prisma.$transaction([
    prisma.outlookCall.update({
      where: { id: item.outlookCallId },
      data: updateData,
    }),
    prisma.reviewQueue.update({
      where: { id },
      data: {
        status: 'rejected',
        reviewedBy,
        reviewedAt: new Date(),
      },
    }),
  ]);

  return { success: true };
}

/**
 * Edit a review item - replace with human-corrected value
 */
export async function editReviewItem(id: string, newValue: string, reviewedBy: string = 'system') {
  const item = await prisma.reviewQueue.findUnique({ where: { id } });
  if (!item) throw new Error('Review item not found');

  // Build update data based on which field was edited
  const updateData: any = {
    needsReview: false,
    reviewedAt: new Date(),
  };

  if (item.field === 'subTheme') {
    updateData.subTheme = newValue;
  } else if (item.field === 'sectionDescription') {
    updateData.sectionDescription = newValue;
  }

  await prisma.$transaction([
    prisma.outlookCall.update({
      where: { id: item.outlookCallId },
      data: updateData,
    }),
    prisma.reviewQueue.update({
      where: { id },
      data: {
        status: 'edited',
        reviewedBy,
        reviewedAt: new Date(),
        finalValue: newValue,
      },
    }),
  ]);

  return { success: true };
}

/**
 * Get review queue statistics
 */
export async function getReviewStats() {
  const [pending, approved, rejected, edited] = await Promise.all([
    prisma.reviewQueue.count({ where: { status: 'pending' } }),
    prisma.reviewQueue.count({ where: { status: 'approved' } }),
    prisma.reviewQueue.count({ where: { status: 'rejected' } }),
    prisma.reviewQueue.count({ where: { status: 'edited' } }),
  ]);

  // Get counts by field type
  const [subThemePending, sectionDescPending] = await Promise.all([
    prisma.reviewQueue.count({ where: { status: 'pending', field: 'subTheme' } }),
    prisma.reviewQueue.count({ where: { status: 'pending', field: 'sectionDescription' } }),
  ]);

  return {
    pending,
    approved,
    rejected,
    edited,
    total: pending + approved + rejected + edited,
    byField: {
      subTheme: subThemePending,
      sectionDescription: sectionDescPending,
    },
  };
}

/**
 * Get a single review item by ID
 */
export async function getReviewItemById(id: string): Promise<ReviewItem | null> {
  const item = await prisma.reviewQueue.findUnique({ where: { id } });
  if (!item) return null;

  const outlookCall = await prisma.outlookCall.findUnique({
    where: { id: item.outlookCallId },
    select: {
      year: true,
      institution: true,
      theme: true,
      subTheme: true,
      callText: true,
    },
  });

  return { ...item, outlookCall } as ReviewItem;
}
