
// Script to seed or verify demo data
// Usage: npx ts-node scripts/seed-demo-data.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Checking Demo Data Integrity...');

    const count = await prisma.outlookCall.count({
        where: { year: 2026 }
    });

    console.log(`Found ${count} records for 2026.`);

    if (count < 100) {
        console.warn('⚠️  Warning: Low data count for 2026. Demo might look empty.');
        // In a real scenario, we might insert fallbacks here.
    }

    // Check for calculated fields
    const uncalculated = await prisma.outlookCall.count({
        where: { themeCategory: '' }
    });

    if (uncalculated > 0) {
        console.warn(`⚠️  ${uncalculated} records missing computed 'themeCategory'. Run ingestion again or patch.`);
    } else {
        console.log('✅ All records have computed categories.');
    }

    // Ensure we have at least these top themes for the script to make sense
    const topThemes = ['Artificial Intelligence', 'Deglobalization', 'Energy Transition'];
    for (const theme of topThemes) {
        const exists = await prisma.outlookCall.findFirst({
            where: { theme: { contains: theme } } // simplistic check
        });
        if (exists) {
            console.log(`✅ Theme '${theme}' present.`);
        } else {
            console.warn(`❌ Mission critical theme '${theme}' NOT found! Demo script needs adjustment.`);
        }
    }

    console.log('Demo Data Check Complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
