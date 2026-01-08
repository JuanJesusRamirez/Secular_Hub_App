import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  console.log('Verifying Backend Infrastructure...');
  
  // 1. Check DB Connection and Count
  const count = await prisma.outlookCall.count();
  console.log(`\nTotal Records in DB: ${count}`);
  
  // 2. Sample Check
  if (count > 0) {
      const sample = await prisma.outlookCall.findFirst();
      console.log('Sample Record:', sample);
      
      const years = await prisma.outlookCall.groupBy({
          by: ['year'],
          _count: { _all: true },
          orderBy: { year: 'desc' },
      });
      console.log('Years distribution:', years);
  } else {
    console.error('ERROR: Database is empty!');
    process.exit(1);
  }

  console.log('\nVerification Complete.');
}

verify()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
