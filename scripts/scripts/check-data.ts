import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get stats
  const total = await prisma.outlookCall.count();
  const withSubTheme = await prisma.outlookCall.count({ where: { subTheme: { not: null } } });
  const withSectionDesc = await prisma.outlookCall.count({ where: { sectionDescription: { not: null } } });

  console.log('=== DATA STATS ===');
  console.log('Total records:', total);
  console.log('With subTheme:', withSubTheme);
  console.log('With sectionDescription:', withSectionDesc);
  console.log('Missing subTheme:', total - withSubTheme);
  console.log('Missing sectionDescription:', total - withSectionDesc);

  // Get counts by year
  const byYear = await prisma.outlookCall.groupBy({
    by: ['year'],
    _count: { id: true },
    orderBy: { year: 'asc' }
  });
  console.log('\n=== BY YEAR ===');
  for (const y of byYear) {
    console.log(y.year + ':', y._count.id);
  }

  // Get examples with both fields from 2025-2026
  const examples = await prisma.outlookCall.findMany({
    where: {
      year: { in: [2025, 2026] },
      subTheme: { not: null },
      sectionDescription: { not: null }
    },
    select: {
      id: true,
      year: true,
      institution: true,
      theme: true,
      subTheme: true,
      sectionDescription: true,
      callText: true
    },
    take: 5
  });

  console.log('\n=== EXAMPLES WITH BOTH FIELDS (2025-2026) ===');
  for (let i = 0; i < examples.length; i++) {
    const ex = examples[i];
    console.log('\n--- Example', i+1, '---');
    console.log('ID:', ex.id);
    console.log('Year:', ex.year);
    console.log('Institution:', ex.institution);
    console.log('Theme:', ex.theme);
    console.log('SubTheme:', ex.subTheme);
    console.log('SectionDescription:', ex.sectionDescription);
    console.log('CallText (first 300 chars):', (ex.callText || '').substring(0, 300));
  }

  // Get a few records missing fields (for processing)
  const missing = await prisma.outlookCall.findMany({
    where: {
      year: { in: [2019, 2020, 2021, 2022, 2023, 2024] },
      OR: [
        { subTheme: null },
        { sectionDescription: null }
      ]
    },
    select: {
      id: true,
      year: true,
      institution: true,
      theme: true,
      themeCategory: true,
      callText: true
    },
    take: 3
  });

  console.log('\n=== SAMPLE RECORDS NEEDING PROCESSING ===');
  for (let i = 0; i < missing.length; i++) {
    const m = missing[i];
    console.log('\n--- Record', i+1, '---');
    console.log('ID:', m.id);
    console.log('Year:', m.year);
    console.log('Institution:', m.institution);
    console.log('Theme:', m.theme);
    console.log('ThemeCategory:', m.themeCategory);
    console.log('CallText:', m.callText);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
