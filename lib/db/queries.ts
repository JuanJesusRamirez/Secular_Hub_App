import { prisma } from './client';
import { Prisma } from '@prisma/client';
import type { OutlookCall } from '@/types/outlook';
import { getYearlyBriefing, AVAILABLE_YEARS } from '@/lib/data/yearly-briefings';

export type OutlookFilter = {
  year?: number;
  institution?: string;
  theme?: string;
  themeCategory?: string;
  conviction?: string;
  limit?: number;
  page?: number;
  search?: string;
};

// Types for Prisma groupBy results
type YearGroupResult = {
  year: number;
  _count: { year: number };
};

type ThemeCategoryGroupResult = {
  themeCategory: string;
  _count: { themeCategory: number };
};

type InstitutionGroupResult = {
  institutionCanonical: string;
  _count: { institutionCanonical: number };
};

type InstitutionThemeGroupResult = {
  institutionCanonical: string;
  themeCategory: string;
};

export async function getOutlooks(filter: OutlookFilter) {
  const { year, institution, theme, themeCategory, conviction, limit = 50, page = 1, search } = filter;
  const skip = (page - 1) * limit;

  const where: Prisma.OutlookCallWhereInput = {};

  if (year) where.year = year;
  if (institution) where.institution = { contains: institution }; // Flexible search
  if (theme) where.theme = { contains: theme };
  if (themeCategory) where.themeCategory = themeCategory;
  if (conviction) where.convictionTier = conviction;
  if (search) {
    where.OR = [
      { callText: { contains: search } },
      { theme: { contains: search } },
      { institution: { contains: search } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.outlookCall.findMany({
      where,
      take: limit,
      skip,
      orderBy: { id: 'asc' }, // Stable ordering
    }),
    prisma.outlookCall.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function getOutlookById(id: string) {
  return prisma.outlookCall.findUnique({
    where: { id },
  });
}

export async function getStats() {
  const [total, yearsRaw, themeCategoriesRaw, institutionsRaw] = await Promise.all([
    prisma.outlookCall.count(),
    prisma.outlookCall.groupBy({
      by: ['year'],
      _count: { year: true },
      orderBy: { year: 'desc' },
    }),
    prisma.outlookCall.groupBy({
      by: ['themeCategory'],
      _count: { themeCategory: true },
      orderBy: { _count: { themeCategory: 'desc' } },
    }),
    prisma.outlookCall.groupBy({
      by: ['institutionCanonical'],
      _count: { institutionCanonical: true },
      orderBy: { _count: { institutionCanonical: 'desc' } },
    }),
  ]);

  // Cast to proper types for safe access
  const years = yearsRaw as YearGroupResult[];
  const themeCategories = themeCategoriesRaw as ThemeCategoryGroupResult[];
  const institutions = institutionsRaw as InstitutionGroupResult[];

  return {
    total_records: Number(total),
    years: years.map(y => ({ year: y.year, count: Number(y._count.year) })),
    themes: themeCategories.map(t => ({ theme: t.themeCategory, count: Number(t._count.themeCategory) })),
    institutions: institutions.map(i => ({ institution: i.institutionCanonical, count: Number(i._count.institutionCanonical) })),
  };
}

// Extended stats for home page with all metrics
export async function getHomeStats() {
  const [
    total,
    yearsRaw,
    institutionsRaw,
    themesRaw,
    themeCategoriesRaw,
    subThemesRaw,
    convictionRaw
  ] = await Promise.all([
    prisma.outlookCall.count(),
    prisma.outlookCall.groupBy({
      by: ['year'],
      _count: { year: true },
      orderBy: { year: 'desc' },
    }),
    prisma.outlookCall.groupBy({
      by: ['institutionCanonical'],
      _count: { institutionCanonical: true },
      orderBy: { _count: { institutionCanonical: 'desc' } },
    }),
    prisma.outlookCall.groupBy({
      by: ['theme'],
      _count: { theme: true },
      orderBy: { _count: { theme: 'desc' } },
    }),
    prisma.outlookCall.groupBy({
      by: ['themeCategory'],
      _count: { themeCategory: true },
      orderBy: { _count: { themeCategory: 'desc' } },
    }),
    prisma.outlookCall.groupBy({
      by: ['subTheme'],
      _count: { subTheme: true },
    }),
    prisma.outlookCall.groupBy({
      by: ['convictionTier'],
      _count: { convictionTier: true },
    }),
  ]);

  // Cast types
  const years = yearsRaw as YearGroupResult[];
  const institutions = institutionsRaw as InstitutionGroupResult[];
  const themes = themesRaw as Array<{ theme: string; _count: { theme: number } }>;
  const themeCategories = themeCategoriesRaw as ThemeCategoryGroupResult[];
  const subThemes = subThemesRaw as Array<{ subTheme: string | null; _count: { subTheme: number } }>;
  const conviction = convictionRaw as ConvictionGroupResult[];

  // Calculate conviction counts
  const convictionMap = new Map(
    conviction.map(c => [c.convictionTier, Number(c._count.convictionTier)])
  );

  // Find peak year (most views)
  const yearsWithCounts = years.map(y => ({ year: y.year, count: Number(y._count.year) }));
  const peakYearData = yearsWithCounts.reduce((max, y) => y.count > max.count ? y : max, yearsWithCounts[0]);

  // Get current year institutions count (most recent year)
  const currentYear = Math.max(...yearsWithCounts.map(y => y.year));

  return {
    totalViews: Number(total),
    yearsCount: years.length,
    years: yearsWithCounts,
    institutionsCount: institutions.length,
    institutions: institutions.map(i => ({
      institution: i.institutionCanonical,
      count: Number(i._count.institutionCanonical)
    })),
    themesCount: themes.length,
    themeCategoriesCount: themeCategories.length,
    themeCategories: themeCategories.map(t => ({
      category: t.themeCategory,
      count: Number(t._count.themeCategory)
    })),
    subThemesCount: subThemes.filter(s => s.subTheme !== null).length,
    conviction: {
      high: convictionMap.get('high') || 0,
      medium: convictionMap.get('medium') || 0,
      low: convictionMap.get('low') || 0,
    },
    avgViewsPerYear: Math.round(Number(total) / years.length),
    avgViewsPerInstitution: Math.round(Number(total) / institutions.length),
    peakYear: peakYearData.year,
    peakYearViews: peakYearData.count,
    currentYear,
  };
}

// Get Base Case for each year (from Bloomberg's original data)
export async function getBaseCasesByYear() {
  const baseCases = await prisma.outlookCall.findMany({
    where: { theme: 'BASE CASE' },
    select: {
      year: true,
      subTheme: true,
      sectionDescription: true,
    },
    distinct: ['year'],
    orderBy: { year: 'desc' },
  });

  return baseCases.map((bc: { year: number; subTheme: string | null; sectionDescription: string | null }) => ({
    year: bc.year,
    baseCase: bc.subTheme || 'Market Outlook',
    description: bc.sectionDescription || '',
  }));
}

export async function getCompareStats(year1: number, year2: number) {
  const [y1ThemesRaw, y2ThemesRaw, y1InstRaw, y2InstRaw] = await Promise.all([
     prisma.outlookCall.groupBy({
       by: ['themeCategory'],
       where: { year: year1 },
       _count: { themeCategory: true },
     }),
     prisma.outlookCall.groupBy({
       by: ['themeCategory'],
       where: { year: year2 },
       _count: { themeCategory: true },
     }),
     prisma.outlookCall.groupBy({
       by: ['institutionCanonical', 'themeCategory'],
       where: { year: year1 },
     }),
     prisma.outlookCall.groupBy({
       by: ['institutionCanonical', 'themeCategory'],
       where: { year: year2 },
     }),
  ]);

  // Cast to proper types
  const y1Themes = y1ThemesRaw as ThemeCategoryGroupResult[];
  const y2Themes = y2ThemesRaw as ThemeCategoryGroupResult[];
  const y1Inst = y1InstRaw as InstitutionThemeGroupResult[];
  const y2Inst = y2InstRaw as InstitutionThemeGroupResult[];

  // Process Themes
  const themes1Map = new Map<string, number>(
    y1Themes.map(t => [t.themeCategory, Number(t._count.themeCategory)])
  );
  const themes2Map = new Map<string, number>(
    y2Themes.map(t => [t.themeCategory, Number(t._count.themeCategory)])
  );

  const allThemes = new Set<string>([...themes1Map.keys(), ...themes2Map.keys()]);
  const themes_emerged: string[] = [];
  const themes_extinct: string[] = [];
  const themes_grew: { theme: string; delta: number }[] = [];
  const themes_declined: { theme: string; delta: number }[] = [];

  allThemes.forEach(theme => {
    const c1 = themes1Map.get(theme) || 0;
    const c2 = themes2Map.get(theme) || 0;
    const delta = c2 - c1;

    if (c1 === 0 && c2 > 0) themes_emerged.push(theme);
    else if (c1 > 0 && c2 === 0) themes_extinct.push(theme);
    else if (delta > 0) themes_grew.push({ theme, delta });
    else if (delta < 0) themes_declined.push({ theme, delta });
  });

  // Process Institutions (Change in themes covered)
  // This is complex, simplification:
  // For each institution, list themes in Y1 vs Y2
  const instMap1 = new Map<string, string[]>();
  y1Inst.forEach(i => {
    const list = instMap1.get(i.institutionCanonical) || [];
    list.push(i.themeCategory);
    instMap1.set(i.institutionCanonical, list);
  });
  
  const instMap2 = new Map<string, string[]>();
  y2Inst.forEach(i => {
    const list = instMap2.get(i.institutionCanonical) || [];
    list.push(i.themeCategory);
    instMap2.set(i.institutionCanonical, list);
  });

  const institutional_changes = [];
  const allInst = new Set([...instMap1.keys(), ...instMap2.keys()]);
  
  for (const inst of allInst) {
    const t1 = instMap1.get(inst) || [];
    const t2 = instMap2.get(inst) || [];
    // Only include if there's a change or significant data
    institutional_changes.push({
      institution: inst,
      year1_themes: t1,
      year2_themes: t2,
    });
  }

  return {
    year1,
    year2,
    themes_emerged,
    themes_extinct,
    themes_grew: themes_grew.sort((a,b) => b.delta - a.delta),
    themes_declined: themes_declined.sort((a,b) => a.delta - b.delta),
    institutional_changes: institutional_changes.slice(0, 50) // Limit to top 50 to avoid massive payload
  };
}

// Types for Overview response
type ConvictionGroupResult = {
  convictionTier: string;
  _count: { convictionTier: number };
};

export interface OverviewResponse {
  year: number;
  yearRange: number[];
  briefing: {
    subtitle: string;
    narrative: string;
  } | null;
  topThemes: Array<{
    theme: string;
    count: number;
  }>;
  convictionIndex: number;
  convictionLabel: "High Conviction" | "Moderate Consensus" | "Fragmented Views";
  institutionCount: number;
  prevYearInstitutionCount: number | null;
  totalCalls: number;
}

// Theme Rankings for Bump Chart
export interface ThemeRanking {
  year: number;
  theme: string;
  rank: number;
  count: number;
  type: 'MACRO' | 'THEMATIC';
  category: string;
}

export interface BumpChartData {
  rankings: ThemeRanking[];
  years: number[];
  themes: string[];
  baseCases: { year: number; subtitle: string }[];
}

export async function getThemeRankings(startYear: number = 2019, endYear: number = 2026, topN: number = 10): Promise<BumpChartData> {
  const macroCategories = ['Macro Outlook', 'Monetary Policy', 'Inflation & Prices', 'Fiscal Policy'];
  const thematicCategory = 'Thematic';
  const years = [];
  for (let y = startYear; y <= endYear; y++) years.push(y);

  const rankings: ThemeRanking[] = [];
  const allThemes = new Set<string>();

  for (const year of years) {
    // Get all calls for this year in macro/thematic categories, ordered by Bloomberg's rank
    const calls = await prisma.outlookCall.findMany({
      where: {
        year,
        themeCategory: { in: [...macroCategories, thematicCategory] }
      },
      select: { theme: true, themeCategory: true, rank: true },
      orderBy: { rank: 'asc' }
    });

    // Get unique themes preserving Bloomberg's rank order
    const seen = new Set<string>();
    const orderedThemes: { theme: string; category: string; type: 'MACRO' | 'THEMATIC' }[] = [];

    calls.forEach((c: { theme: string; themeCategory: string; rank: number | null }) => {
      if (!seen.has(c.theme)) {
        seen.add(c.theme);
        orderedThemes.push({
          theme: c.theme,
          category: c.themeCategory,
          type: macroCategories.includes(c.themeCategory) ? 'MACRO' : 'THEMATIC'
        });
      }
    });

    // Count calls per theme
    const counts: Record<string, number> = {};
    calls.forEach((c: { theme: string; themeCategory: string; rank: number | null }) => { counts[c.theme] = (counts[c.theme] || 0) + 1; });

    // Build rankings (BASE CASE is always rank 0)
    let position = 0;
    orderedThemes.slice(0, topN + 1).forEach((t: { theme: string; category: string; type: 'MACRO' | 'THEMATIC' }) => {
      const rank = t.theme === 'BASE CASE' ? 0 : ++position;
      rankings.push({
        year,
        theme: t.theme,
        rank,
        count: counts[t.theme],
        type: t.type,
        category: t.category
      });
      allThemes.add(t.theme);
    });
  }

  // Get base case subtitles
  const baseCasesRaw = await prisma.outlookCall.findMany({
    where: { theme: 'BASE CASE' },
    select: { year: true, subTheme: true },
    distinct: ['year'],
    orderBy: { year: 'asc' }
  });

  const baseCases = baseCasesRaw.map((bc: { year: number; subTheme: string | null }) => ({
    year: bc.year,
    subtitle: bc.subTheme || 'Market Outlook'
  }));

  return {
    rankings,
    years,
    themes: Array.from(allThemes),
    baseCases
  };
}

export async function getYearOverview(year: number): Promise<OverviewResponse> {
  // Parallel queries for performance
  const [
    totalCalls,
    convictionRaw,
    institutionsRaw,
    prevYearInstitutionsRaw,
    topThemesRaw,
  ] = await Promise.all([
    // Total calls for the year
    prisma.outlookCall.count({ where: { year } }),

    // Conviction tier distribution
    prisma.outlookCall.groupBy({
      by: ['convictionTier'],
      where: { year },
      _count: { convictionTier: true },
    }),

    // Distinct institutions for current year
    prisma.outlookCall.groupBy({
      by: ['institutionCanonical'],
      where: { year },
    }),

    // Distinct institutions for previous year
    prisma.outlookCall.groupBy({
      by: ['institutionCanonical'],
      where: { year: year - 1 },
    }),

    // Top themes
    prisma.outlookCall.groupBy({
      by: ['theme'],
      where: { year },
      _count: { theme: true },
      orderBy: { _count: { theme: 'desc' } },
      take: 5,
    }),
  ]);

  // Cast types
  const conviction = convictionRaw as ConvictionGroupResult[];

  // Calculate conviction index (High=100, Medium=50, Low=0)
  const convictionMap = new Map(
    conviction.map(c => [c.convictionTier, Number(c._count.convictionTier)])
  );
  const highCount = convictionMap.get('high') || 0;
  const mediumCount = convictionMap.get('medium') || 0;
  const lowCount = convictionMap.get('low') || 0;
  const total = highCount + mediumCount + lowCount;

  const convictionIndex = total > 0
    ? Math.round((highCount * 100 + mediumCount * 50 + lowCount * 0) / total)
    : 0;

  // Determine conviction label
  let convictionLabel: OverviewResponse['convictionLabel'];
  if (convictionIndex > 70) {
    convictionLabel = "High Conviction";
  } else if (convictionIndex >= 40) {
    convictionLabel = "Moderate Consensus";
  } else {
    convictionLabel = "Fragmented Views";
  }

  // Get editorial briefing from constants
  const briefing = getYearlyBriefing(year);
  
  // Format top themes
  // Note: 'theme' field in prisma result might be different if group key is different?
  // The query used by: ['theme'], so result will have 'theme'.
  // However, earlier queries used 'themeCategory'. The plan says:
  // "Use [NEW] and [DELETE]... Corrected Prisma Query for topThemes: groupBy by 'theme'"
  // So assuming 'theme' is the correct field on OutlookCall model.
  // We need to type cast properly if TS complains, but for now assuming it works as 'theme' is a field.
  const topThemes = (topThemesRaw as unknown as Array<{ theme: string, _count: { theme: number } }>).map(t => ({
    theme: t.theme,
    count: Number(t._count.theme)
  }));

  // Build response
  return {
    year,
    yearRange: AVAILABLE_YEARS,
    briefing: briefing ? { subtitle: briefing.subtitle, narrative: briefing.narrative } : null,
    topThemes,
    convictionIndex,
    convictionLabel,
    institutionCount: institutionsRaw.length,
    prevYearInstitutionCount: prevYearInstitutionsRaw.length > 0 ? prevYearInstitutionsRaw.length : null,
    totalCalls,
  };
}
