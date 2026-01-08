
import fs from 'fs';
import path from 'path';

async function checkUrl(url: string, name: string) {
    try {
        const res = await fetch(url);
        if (res.ok) {
            console.log(`[PASS] ${name} is reachable (${res.status})`);
            return true;
        } else {
            console.error(`[FAIL] ${name} returned ${res.status}`);
            return false;
        }
    } catch (e) {
        console.error(`[FAIL] ${name} is unreachable: ${(e as Error).message}`);
        return false;
    }
}

async function main() {
    console.log('✈️  Starting Pre-Flight Check...\n');
    let allPass = true;

    // 1. Check Environment Variables (Visual check of existence, not values for security)
    const requiredVars = ['DATABASE_URL', 'NEXT_PUBLIC_APP_URL'];
    // Note: Azure OpenAI vars might not be set in local dev if using mock AI, so we warn instead of fail strictly unless strict mode.
    
    console.log('Checking Environment Variables...');
    // We can't easily check process.env here if they are loaded via .env file by Next.js and we are running via ts-node directly often.
    // However, if we assume the user has a .env file:
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        console.log(`[PASS] .env file found at ${envPath}`);
    } else {
        console.warn(`[WARN] .env file NOT found. Relying on system env vars.`);
    }

    // 2. Check Database Logic (Indirectly via API or file check)
    // Checking if sqlite db exists
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db'); // Adjustable based on actual prisma config
    if (fs.existsSync(dbPath) || process.env.DATABASE_URL?.includes('file:')) {
         // Naive check. Real check involves query.
         console.log(`[INFO] Database file check skipped (assumed managed by Prisma)`);
    }

    // 3. Check Backend API Connectivity
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const apiHealthy = await checkUrl(`${baseUrl}/api/stats`, 'API Health (/api/stats)');
    if (!apiHealthy) allPass = false;

    // 4. Check Frontend Connectivity
    const frontendHealthy = await checkUrl(`${baseUrl}`, 'Frontend Home Page');
    if (!frontendHealthy) allPass = false;

    console.log('\n----------------------------------------');
    if (allPass) {
        console.log('✅ PRE-FLIGHT CHECK PASSED');
        process.exit(0);
    } else {
        console.error('❌ PRE-FLIGHT CHECK FAILED');
        process.exit(1);
    }
}

main();
