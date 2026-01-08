import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

/**
 * GET /api/migration/status
 * Get migration progress and data coverage statistics
 */
export async function GET() {
  try {
    // Get the latest migration run
    const latestRun = await prisma.migrationRun.findFirst({
      orderBy: { startedAt: 'desc' },
    });

    // Get coverage stats - records with both subTheme and sectionDescription
    const coverageByYear = await prisma.$queryRaw<
      Array<{ year: number; total: number; withSubTheme: number; withSectionDesc: number; withBoth: number }>
    >`
      SELECT
        year,
        COUNT(*) as total,
        SUM(CASE WHEN sub_theme IS NOT NULL THEN 1 ELSE 0 END) as withSubTheme,
        SUM(CASE WHEN section_description IS NOT NULL THEN 1 ELSE 0 END) as withSectionDesc,
        SUM(CASE WHEN sub_theme IS NOT NULL AND section_description IS NOT NULL THEN 1 ELSE 0 END) as withBoth
      FROM outlook_calls
      GROUP BY year
      ORDER BY year
    `;

    // Get AI generation stats
    const aiGenerationStats = await prisma.$queryRaw<
      Array<{ year: number; aiSubTheme: number; aiSectionDesc: number }>
    >`
      SELECT
        year,
        SUM(CASE WHEN sub_theme_generated = 1 THEN 1 ELSE 0 END) as aiSubTheme,
        SUM(CASE WHEN section_desc_generated = 1 THEN 1 ELSE 0 END) as aiSectionDesc
      FROM outlook_calls
      GROUP BY year
      ORDER BY year
    `;

    // Format coverage data
    const coverage = coverageByYear.map(row => {
      const aiStats = aiGenerationStats.find(a => a.year === row.year);
      return {
        year: row.year,
        total: Number(row.total),
        subTheme: {
          filled: Number(row.withSubTheme),
          percentage: Math.round((Number(row.withSubTheme) / Number(row.total)) * 100),
          aiGenerated: aiStats ? Number(aiStats.aiSubTheme) : 0,
        },
        sectionDescription: {
          filled: Number(row.withSectionDesc),
          percentage: Math.round((Number(row.withSectionDesc) / Number(row.total)) * 100),
          aiGenerated: aiStats ? Number(aiStats.aiSectionDesc) : 0,
        },
        complete: {
          count: Number(row.withBoth),
          percentage: Math.round((Number(row.withBoth) / Number(row.total)) * 100),
        },
      };
    });

    // Calculate overall stats
    const totals = coverageByYear.reduce(
      (acc, row) => ({
        total: acc.total + Number(row.total),
        withSubTheme: acc.withSubTheme + Number(row.withSubTheme),
        withSectionDesc: acc.withSectionDesc + Number(row.withSectionDesc),
        withBoth: acc.withBoth + Number(row.withBoth),
      }),
      { total: 0, withSubTheme: 0, withSectionDesc: 0, withBoth: 0 }
    );

    return NextResponse.json({
      data: {
        latestRun: latestRun
          ? {
              id: latestRun.id,
              status: latestRun.status,
              startedAt: latestRun.startedAt,
              completedAt: latestRun.completedAt,
              totalRecords: latestRun.totalRecords,
              processedCount: latestRun.processedCount,
              errorCount: latestRun.errorCount,
              progress: latestRun.totalRecords > 0
                ? Math.round((latestRun.processedCount / latestRun.totalRecords) * 100)
                : 0,
            }
          : null,
        coverage,
        overall: {
          total: totals.total,
          subThemePercentage: Math.round((totals.withSubTheme / totals.total) * 100),
          sectionDescPercentage: Math.round((totals.withSectionDesc / totals.total) * 100),
          completePercentage: Math.round((totals.withBoth / totals.total) * 100),
        },
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
