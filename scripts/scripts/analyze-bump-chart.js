const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const macroCategories = ['Macro Outlook', 'Monetary Policy', 'Inflation & Prices', 'Fiscal Policy'];
  const thematicCategory = 'Thematic';
  const years = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

  for (const year of years) {
    console.log('\n' + '='.repeat(60));
    console.log(`YEAR ${year} - Bloomberg Editorial Ranking`);
    console.log('='.repeat(60));

    const calls = await prisma.outlookCall.findMany({
      where: {
        year,
        themeCategory: { in: [...macroCategories, thematicCategory] }
      },
      select: { theme: true, themeCategory: true, rank: true },
      orderBy: { rank: 'asc' }
    });

    // Get unique themes preserving Bloomberg's rank order
    const seen = new Set();
    const orderedThemes = [];
    calls.forEach(c => {
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
    const counts = {};
    calls.forEach(c => { counts[c.theme] = (counts[c.theme] || 0) + 1; });

    // Print rankings
    let position = 0;
    orderedThemes.slice(0, 12).forEach(t => {
      const marker = t.type === 'MACRO' ? 'M' : 'T';
      const pos = t.theme === 'BASE CASE' ? '0' : String(position + 1);
      console.log(`${pos.padStart(2)}. [${marker}] ${t.theme.padEnd(22)} ${counts[t.theme].toString().padStart(4)} calls`);
      if (t.theme !== 'BASE CASE') position++;
    });
  }
}

main().finally(() => prisma.$disconnect());
