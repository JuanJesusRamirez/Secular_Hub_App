import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fix common UTF-8 mojibake patterns
function fixEncoding(text: string | null): string | null {
  if (!text) return text;

  return text
    .replace(/â€™/g, "'")  // Right single quote
    .replace(/â€"/g, "—")  // Em-dash
    .replace(/â€œ/g, '"')  // Left double quote
    .replace(/â€/g, '"')   // Right double quote (partial)
    .replace(/â€¦/g, '…')  // Ellipsis
    .replace(/Ã©/g, 'é')   // é
    .replace(/Ã¨/g, 'è')   // è
    .replace(/Ã /g, 'à')   // à
    .replace(/Ã¢/g, 'â')   // â
    .replace(/Ã®/g, 'î')   // î
    .replace(/Ã´/g, 'ô')   // ô
    .replace(/Ã»/g, 'û')   // û
    .replace(/Ã§/g, 'ç')   // ç
    .replace(/Ã±/g, 'ñ'); // ñ
}

async function main() {
  console.log('=== CHECKING ENCODING ISSUES ===\n');

  // Find records with encoding issues in sectionDescription
  const badDescriptions = await prisma.outlookCall.findMany({
    where: {
      sectionDescription: { contains: 'â' }
    },
    select: { id: true, year: true, sectionDescription: true }
  });

  console.log(`Found ${badDescriptions.length} records with encoding issues in sectionDescription`);

  // Find records with encoding issues in subTheme
  const badSubThemes = await prisma.outlookCall.findMany({
    where: {
      subTheme: { contains: 'â' }
    },
    select: { id: true, year: true, subTheme: true }
  });

  console.log(`Found ${badSubThemes.length} records with encoding issues in subTheme`);

  // Find records with encoding issues in callText
  const badCallTexts = await prisma.outlookCall.findMany({
    where: {
      callText: { contains: 'â' }
    },
    select: { id: true, year: true }
  });

  console.log(`Found ${badCallTexts.length} records with encoding issues in callText`);

  // Preview fixes
  console.log('\n=== PREVIEW FIXES ===\n');

  for (const record of badDescriptions.slice(0, 3)) {
    console.log(`ID: ${record.id}, Year: ${record.year}`);
    console.log(`Before: ${record.sectionDescription?.substring(0, 100)}...`);
    console.log(`After:  ${fixEncoding(record.sectionDescription)?.substring(0, 100)}...`);
    console.log('');
  }

  // Ask for confirmation
  const args = process.argv.slice(2);
  if (args.includes('--fix')) {
    console.log('\n=== APPLYING FIXES ===\n');

    let fixed = 0;

    // Fix sectionDescription
    for (const record of badDescriptions) {
      await prisma.outlookCall.update({
        where: { id: record.id },
        data: { sectionDescription: fixEncoding(record.sectionDescription) }
      });
      fixed++;
    }

    // Fix subTheme
    for (const record of badSubThemes) {
      await prisma.outlookCall.update({
        where: { id: record.id },
        data: { subTheme: fixEncoding(record.subTheme) }
      });
      fixed++;
    }

    // Fix callText
    for (const record of badCallTexts) {
      const full = await prisma.outlookCall.findUnique({
        where: { id: record.id },
        select: { callText: true }
      });
      await prisma.outlookCall.update({
        where: { id: record.id },
        data: { callText: fixEncoding(full?.callText || null) }
      });
      fixed++;
    }

    console.log(`Fixed ${fixed} records total`);
  } else {
    console.log('\nRun with --fix to apply changes');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
