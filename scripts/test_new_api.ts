import { prisma } from '../lib/db/client';

async function test() {
    try {
        console.log("Checking WordAnalysis table...");
        const wordCount = await (prisma as any).wordAnalysis.count();
        console.log(`Words in DB: ${wordCount}`);

        console.log("Checking PhraseAnalysis table...");
        const phraseCount = await (prisma as any).phraseAnalysis.count();
        console.log(`Phrases in DB: ${phraseCount}`);

        const sample = await (prisma as any).wordAnalysis.findFirst({
            where: { year: 2022 }
        });
        console.log("Sample 2022 word:", sample);

    } catch (e) {
        console.error("Error checking tables:", e);
    } finally {
        await prisma.$disconnect();
    }
}

test();
