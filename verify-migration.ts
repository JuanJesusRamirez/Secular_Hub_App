import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  try {
    console.log('Verifying Postgres connection...\n');

    const outlookCount = await prisma.outlookCall.count();
    console.log(`✓ outlook_calls: ${outlookCount} rows`);

    const wordCloudCount = await prisma.wordCloudCache.count();
    console.log(`✓ word_cloud_cache: ${wordCloudCount} rows`);

    const reviewCount = await prisma.reviewQueue.count();
    console.log(`✓ review_queue: ${reviewCount} rows`);

    const migrationCount = await prisma.migrationRun.count();
    console.log(`✓ migration_runs: ${migrationCount} rows`);

    const sentimentCount = await prisma.sentimentCache.count();
    console.log(`✓ sentiment_cache: ${sentimentCount} rows`);

    console.log('\n✅ All tables connected and readable!');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('\nDetails:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
