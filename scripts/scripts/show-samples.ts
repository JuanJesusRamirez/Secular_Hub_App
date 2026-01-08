import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Show some AI-generated examples from different years/themes
  const examples = await prisma.outlookCall.findMany({
    where: { subThemeGenerated: true },
    select: {
      id: true,
      year: true,
      institution: true,
      theme: true,
      subTheme: true,
      sectionDescription: true,
      subThemeConfidence: true
    },
    orderBy: { id: 'asc' },
    take: 15
  });

  console.log('=== SAMPLE AI-GENERATED RECORDS ===\n');

  for (let i = 0; i < examples.length; i++) {
    const ex = examples[i];
    console.log(`[${i + 1}] ${ex.year} | ${ex.institution} | ${ex.theme}`);
    console.log(`    SubTheme: ${ex.subTheme}`);
    console.log(`    Description: ${ex.sectionDescription?.substring(0, 100)}...`);
    console.log(`    Confidence: ${ex.subThemeConfidence}`);
    console.log('');
  }

  // Stats by year
  console.log('=== COVERAGE BY YEAR ===');
  const byYear = await prisma.outlookCall.groupBy({
    by: ['year'],
    _count: { id: true },
    where: { subTheme: { not: null } },
    orderBy: { year: 'asc' }
  });

  const aiGenByYear = await prisma.outlookCall.groupBy({
    by: ['year'],
    _count: { id: true },
    where: { subThemeGenerated: true },
    orderBy: { year: 'asc' }
  });

  for (const y of byYear) {
    const aiGen = aiGenByYear.find(a => a.year === y.year)?._count.id || 0;
    console.log(`${y.year}: ${y._count.id} total | ${aiGen} AI-generated`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
