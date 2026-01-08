import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check a sample AI-generated record
  const sample = await prisma.outlookCall.findFirst({
    where: { subThemeGenerated: true },
    select: {
      id: true,
      year: true,
      theme: true,
      subTheme: true,
      subThemeGenerated: true,
      subThemeConfidence: true,
      sectionDescription: true,
      sectionDescGenerated: true,
      sectionDescConfidence: true,
      generatedAt: true,
      needsReview: true,
      reviewedAt: true
    }
  });

  console.log('=== SAMPLE AI-GENERATED RECORD ===');
  console.log(JSON.stringify(sample, null, 2));

  // Check an original (non-AI) record from 2025-2026
  const original = await prisma.outlookCall.findFirst({
    where: {
      year: { in: [2025, 2026] },
      subTheme: { not: null }
    },
    select: {
      id: true,
      year: true,
      theme: true,
      subTheme: true,
      subThemeGenerated: true,
      subThemeConfidence: true,
      sectionDescription: true,
      sectionDescGenerated: true,
      sectionDescConfidence: true,
      generatedAt: true,
      needsReview: true
    }
  });

  console.log('\n=== SAMPLE ORIGINAL RECORD (2025-2026) ===');
  console.log(JSON.stringify(original, null, 2));

  // Metadata stats
  console.log('\n=== METADATA COUNTS ===');
  const stats = {
    total: await prisma.outlookCall.count(),
    subThemeGenerated_true: await prisma.outlookCall.count({ where: { subThemeGenerated: true } }),
    subThemeGenerated_false: await prisma.outlookCall.count({ where: { subThemeGenerated: false } }),
    sectionDescGenerated_true: await prisma.outlookCall.count({ where: { sectionDescGenerated: true } }),
    withConfidence: await prisma.outlookCall.count({ where: { subThemeConfidence: { not: null } } }),
    withGeneratedAt: await prisma.outlookCall.count({ where: { generatedAt: { not: null } } }),
    needsReview: await prisma.outlookCall.count({ where: { needsReview: true } })
  };

  for (const [key, value] of Object.entries(stats)) {
    console.log(`${key}: ${value}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
