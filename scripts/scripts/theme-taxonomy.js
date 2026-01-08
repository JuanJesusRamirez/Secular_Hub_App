const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get all unique themes with their categories, ordered by category then count
  const themes = await prisma.outlookCall.groupBy({
    by: ['theme', 'themeCategory'],
    _count: { theme: true },
    orderBy: [
      { themeCategory: 'asc' },
      { _count: { theme: 'desc' } }
    ]
  });

  console.log('COLUMN B THEME TAXONOMY');
  console.log('=======================\n');

  let currentCategory = '';
  themes.forEach(t => {
    if (t.themeCategory !== currentCategory) {
      currentCategory = t.themeCategory;
      console.log('\n[' + currentCategory.toUpperCase() + ']');
    }
    console.log('  ' + t.theme + ' (' + t._count.theme + ')');
  });

  console.log('\n\nTotal unique themes (Column B values): ' + themes.length);
}

main().finally(() => prisma.$disconnect());
