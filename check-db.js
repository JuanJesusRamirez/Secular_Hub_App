const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Total de registros
  const count = await prisma.outlookCall.count();
  console.log('=== TOTAL REGISTROS EN POSTGRESQL ===');
  console.log('Total outlook calls:', count);

  // Conteo por año
  const byYear = await prisma.outlookCall.groupBy({
    by: ['year'],
    _count: { year: true },
    orderBy: { year: 'desc' }
  });
  console.log('\n=== REGISTROS POR AÑO ===');
  byYear.forEach(y => console.log(`  ${y.year}: ${y._count.year} calls`));

  // Instituciones únicas
  const institutions = await prisma.outlookCall.groupBy({
    by: ['institutionCanonical'],
    _count: { institutionCanonical: true },
    orderBy: { _count: { institutionCanonical: 'desc' } },
    take: 10
  });
  console.log('\n=== TOP 10 INSTITUCIONES ===');
  institutions.forEach(i => console.log(`  ${i.institutionCanonical}: ${i._count.institutionCanonical} calls`));

  // Categorías de temas
  const categories = await prisma.outlookCall.groupBy({
    by: ['themeCategory'],
    _count: { themeCategory: true },
    orderBy: { _count: { themeCategory: 'desc' } }
  });
  console.log('\n=== CATEGORÍAS DE TEMAS ===');
  categories.forEach(c => console.log(`  ${c.themeCategory}: ${c._count.themeCategory} calls`));

  // Muestra de datos reales
  console.log('\n=== EJEMPLOS DE DATOS (3 registros) ===');
  const samples = await prisma.outlookCall.findMany({
    take: 3,
    where: { year: 2026 },
    select: {
      id: true,
      year: true,
      institution: true,
      institutionCanonical: true,
      theme: true,
      themeCategory: true,
      convictionTier: true,
      callText: true
    }
  });

  samples.forEach((r, i) => {
    console.log(`\n--- Registro ${i + 1} ---`);
    console.log('ID:', r.id);
    console.log('Año:', r.year);
    console.log('Institución:', r.institutionCanonical);
    console.log('Tema:', r.theme);
    console.log('Categoría:', r.themeCategory);
    console.log('Convicción:', r.convictionTier);
    console.log('Texto (primeros 300 chars):');
    console.log('  ', r.callText?.substring(0, 300) + '...');
  });

  await prisma.$disconnect();
}

main().catch(console.error);
