import { NextRequest, NextResponse } from 'next/server';
import { getOutlooks } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
    const institution = searchParams.get('institution') || undefined;
    const theme = searchParams.get('theme') || undefined;
    const themeCategory = searchParams.get('theme_category') || undefined;
    const conviction = searchParams.get('conviction') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const search = searchParams.get('search') || undefined;
    const includeMetadata = searchParams.get('include_metadata') === 'true';

    const result = await getOutlooks({
      year,
      institution,
      theme,
      themeCategory,
      conviction,
      limit,
      page,
      search,
    });

    // Optionally include AI generation metadata
    const responseData = includeMetadata
      ? result.data.map((call: typeof result.data[number]) => ({
          ...call,
          _metadata: {
            subThemeGenerated: call.subThemeGenerated,
            subThemeConfidence: call.subThemeConfidence,
            sectionDescGenerated: call.sectionDescGenerated,
            sectionDescConfidence: call.sectionDescConfidence,
            needsReview: call.needsReview,
            generatedAt: call.generatedAt,
            reviewedAt: call.reviewedAt,
          },
        }))
      : result.data;

    return NextResponse.json({
      data: responseData,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
      filters_applied: { year, institution, theme, themeCategory, conviction, search },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
