
import { getStats } from '../lib/db/queries'; // Adjust path if needed
import { prisma } from '../lib/db/client';

async function main() {
    try {
        console.log('Testing getStats()...');
        const stats = await getStats();
        console.log('Success:', JSON.stringify(stats, null, 2));
    } catch (e) {
        console.error('Error in getStats:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
