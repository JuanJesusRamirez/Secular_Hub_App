import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const records = await prisma.outlookCall.findMany({
    where: {
      year: { in: [2019, 2020, 2021, 2022, 2023, 2024] },
      subTheme: null
    },
    select: {
      id: true,
      year: true,
      institution: true,
      institutionCanonical: true,
      theme: true,
      themeCategory: true,
      callText: true
    },
    orderBy: { id: 'asc' },
    take: 10
  });

  console.log(JSON.stringify(records, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
