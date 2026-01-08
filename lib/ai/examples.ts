import { prisma } from '@/lib/db/client';

/**
 * Fetches real examples of subTheme from 2025-2026 data for few-shot learning.
 * Only returns human-created examples (not AI-generated).
 */
export async function getSubThemeExamples(theme: string, limit = 5): Promise<string> {
  // First try to get examples with the same theme
  let examples = await prisma.outlookCall.findMany({
    where: {
      year: { in: [2025, 2026] },
      theme: theme,
      subTheme: { not: null },
      subThemeGenerated: false, // Only human-created examples
    },
    select: {
      theme: true,
      subTheme: true,
      callText: true,
    },
    take: limit,
  });

  // Fallback to any theme if no examples found for this specific theme
  if (examples.length === 0) {
    examples = await prisma.outlookCall.findMany({
      where: {
        year: { in: [2025, 2026] },
        subTheme: { not: null },
        subThemeGenerated: false,
      },
      select: {
        theme: true,
        subTheme: true,
        callText: true,
      },
      take: limit,
    });
  }

  return formatSubThemeExamples(examples);
}

/**
 * Fetches real examples of sectionDescription from 2025-2026 data for few-shot learning.
 * Only returns human-created examples (not AI-generated).
 */
export async function getSectionDescExamples(theme: string, limit = 5): Promise<string> {
  // First try to get examples with the same theme
  let examples = await prisma.outlookCall.findMany({
    where: {
      year: { in: [2025, 2026] },
      theme: theme,
      sectionDescription: { not: null },
      sectionDescGenerated: false, // Only human-created examples
    },
    select: {
      theme: true,
      subTheme: true,
      sectionDescription: true,
      callText: true,
    },
    take: limit,
  });

  // Fallback to any theme if no examples found for this specific theme
  if (examples.length === 0) {
    examples = await prisma.outlookCall.findMany({
      where: {
        year: { in: [2025, 2026] },
        sectionDescription: { not: null },
        sectionDescGenerated: false,
      },
      select: {
        theme: true,
        subTheme: true,
        sectionDescription: true,
        callText: true,
      },
      take: limit,
    });
  }

  return formatSectionDescExamples(examples);
}

function formatSubThemeExamples(examples: Array<{
  theme: string;
  subTheme: string | null;
  callText: string | null;
}>): string {
  if (examples.length === 0) {
    return 'No examples available. Generate based on best judgment.';
  }

  return examples.map((ex, i) =>
    `Example ${i + 1}:
  Theme: ${ex.theme}
  SubTheme: ${ex.subTheme}
  Call excerpt: "${truncateText(ex.callText, 200)}"`
  ).join('\n\n');
}

function formatSectionDescExamples(examples: Array<{
  theme: string;
  subTheme: string | null;
  sectionDescription: string | null;
  callText: string | null;
}>): string {
  if (examples.length === 0) {
    return 'No examples available. Generate based on best judgment.';
  }

  return examples.map((ex, i) =>
    `Example ${i + 1}:
  Theme: ${ex.theme}
  SubTheme: ${ex.subTheme || 'N/A'}
  Section Description: "${ex.sectionDescription}"
  Call excerpt: "${truncateText(ex.callText, 200)}"`
  ).join('\n\n');
}

function truncateText(text: string | null, maxLength: number): string {
  if (!text) return '[No text available]';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
