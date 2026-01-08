/**
 * AI Backfill Migration Script
 * Generates missing subTheme and sectionDescription for 2019-2024 records
 *
 * Usage:
 *   npx ts-node scripts/backfill-ai-fields.ts [options]
 *
 * Options:
 *   --dry-run         Preview what would be processed without making changes
 *   --resume          Resume from last processed record
 *   --batch-size=N    Process N records per batch (default: 50)
 *   --year=YYYY       Only process specific year
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';
import { z } from 'zod';
import OpenAI from 'openai';
import { AzureOpenAI } from 'openai';

// ============== Inline Taxonomy ==============
const MACRO_ECONOMIC = [
  'GROWTH', 'RECESSION', 'INFLATION', 'DISINFLATION', 'STAGFLATION',
  'SLOWDOWN', 'SOFT LANDING', 'MONETARY POLICY', 'FISCAL',
  'RATE CUTS', 'HIGH RATES', 'NEGATIVE RATES', 'INTEREST RATES',
  'PIVOT', 'TIGHTENING', 'QUANTITATIVE EASING', 'QUANTITATIVE TIGHTENING',
  'STIMULUS', 'STEEPENING'
];
const EVENTS = ['ELECTIONS', 'POLITICS', 'BREXIT', 'WAR', 'GEOPOLITICS', 'TRADE', 'TARIFFS', 'COVID', 'DOLLAR'];
const LABOR_CONSUMER = ['WAGES', 'UNEMPLOYMENT', 'CONSUMERS', 'COMPANIES'];
const TOPICS = [...MACRO_ECONOMIC, ...EVENTS, ...LABOR_CONSUMER];
const THEMATIC = [
  'AI', 'ESG', 'TECH', 'MAGNIFICENT 7', 'ENERGY', 'METALS',
  'RESHORING', 'SUPPLY CHAIN', 'REGULATION',
  'VOLATILITY', 'LIQUIDITY', 'ROTATION', 'CYCLICALS', 'SECTORS',
  'QUALITY', 'DIVERSIFICATION', 'HEDGING', 'STOCK PICKING', 'RALLY'
];
const GEOGRAPHIES = ['US', 'EUROPE', 'CHINA', 'JAPAN', 'UK', 'APAC', 'ASIA', 'GLOBAL'];
const ASSET_CLASSES = [
  'STOCKS', 'BONDS', 'CREDIT', 'COMMODITIES', 'CURRENCIES',
  'ALTERNATIVE ASSETS', 'MULTI ASSET', 'REAL ESTATE', 'PRIVATE MARKETS', 'HEDGE FUNDS',
  'VALUATIONS', 'YIELDS', 'DURATION', 'SPREADS', 'DEFAULTS',
  'EARNINGS', 'RETURNS', 'INCOME', 'BOND SUPPLY', 'REFINANCING'
];
const RISKS = ['RISKS'];
const TAXONOMY = { TOPICS, THEMATIC, GEOGRAPHIES, ASSET_CLASSES, RISKS };

// ============== Inline AI Client ==============
const isAzure = !!process.env.AZURE_OPENAI_ENDPOINT;

let client: AzureOpenAI | OpenAI;

if (isAzure) {
  client = new AzureOpenAI({
    apiKey: process.env.AZURE_OPENAI_KEY || '',
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
    apiVersion: '2024-05-01-preview',
  });
} else {
  client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
  });
}

async function getCompletion(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options: { temperature?: number; max_tokens?: number } = {}
) {
  const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4';
  const response = await client.chat.completions.create({
    model: isAzure ? deploymentName : 'gpt-4-turbo',
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 1000,
  });
  return response.choices[0].message.content;
}

// ============== Inline Prompt Loader ==============
const PROMPTS_DIR = path.join(process.cwd(), 'prompts');

async function loadPrompt(templateName: string, variables: Record<string, any>): Promise<string> {
  const filePath = path.join(PROMPTS_DIR, `${templateName}.md`);
  let content = await fs.readFile(filePath, 'utf-8');

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    const replacement = typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
    content = content.replace(placeholder, replacement);
  }
  return content;
}

// ============== Inline Zod Schemas ==============
const SubThemeGenerationSchema = z.object({
  subTheme: z.string().min(2).max(100),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

const SectionDescriptionGenerationSchema = z.object({
  sectionDescription: z.string().min(10).max(500),
  confidence: z.number().min(0).max(1),
  keyPoints: z.array(z.string()),
});

function parseAiResponse<T>(content: string | null | undefined, schema: z.ZodType<T>): T {
  if (!content) throw new Error('Empty AI response');

  let jsonString = content.trim();
  if (jsonString.startsWith('```')) {
    const lines = jsonString.split('\n');
    if (lines[0].startsWith('```')) lines.shift();
    if (lines[lines.length - 1].startsWith('```')) lines.pop();
    jsonString = lines.join('\n');
  }

  const parsed = JSON.parse(jsonString);
  return schema.parse(parsed);
}

// ============== Inline Example Fetchers ==============
async function getSubThemeExamples(prismaClient: PrismaClient, theme: string, limit = 5): Promise<string> {
  let examples = await prismaClient.outlookCall.findMany({
    where: {
      year: { in: [2025, 2026] },
      theme: theme,
      subTheme: { not: null },
      subThemeGenerated: false,
    },
    select: { theme: true, subTheme: true, callText: true },
    take: limit,
  });

  if (examples.length === 0) {
    examples = await prismaClient.outlookCall.findMany({
      where: {
        year: { in: [2025, 2026] },
        subTheme: { not: null },
        subThemeGenerated: false,
      },
      select: { theme: true, subTheme: true, callText: true },
      take: limit,
    });
  }

  if (examples.length === 0) return 'No examples available. Generate based on best judgment.';

  return examples.map((ex, i) =>
    `Example ${i + 1}:\n  Theme: ${ex.theme}\n  SubTheme: ${ex.subTheme}\n  Call excerpt: "${(ex.callText || '').substring(0, 200)}..."`
  ).join('\n\n');
}

async function getSectionDescExamples(prismaClient: PrismaClient, theme: string, limit = 5): Promise<string> {
  let examples = await prismaClient.outlookCall.findMany({
    where: {
      year: { in: [2025, 2026] },
      theme: theme,
      sectionDescription: { not: null },
      sectionDescGenerated: false,
    },
    select: { theme: true, subTheme: true, sectionDescription: true, callText: true },
    take: limit,
  });

  if (examples.length === 0) {
    examples = await prismaClient.outlookCall.findMany({
      where: {
        year: { in: [2025, 2026] },
        sectionDescription: { not: null },
        sectionDescGenerated: false,
      },
      select: { theme: true, subTheme: true, sectionDescription: true, callText: true },
      take: limit,
    });
  }

  if (examples.length === 0) return 'No examples available. Generate based on best judgment.';

  return examples.map((ex, i) =>
    `Example ${i + 1}:\n  Theme: ${ex.theme}\n  SubTheme: ${ex.subTheme || 'N/A'}\n  Section Description: "${ex.sectionDescription}"\n  Call excerpt: "${(ex.callText || '').substring(0, 200)}..."`
  ).join('\n\n');
}

const prisma = new PrismaClient();

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    BATCH_SIZE: parseInt(args.find(a => a.startsWith('--batch-size='))?.split('=')[1] || '50'),
    DRY_RUN: args.includes('--dry-run'),
    RESUME: args.includes('--resume'),
    YEAR: args.find(a => a.startsWith('--year='))?.split('=')[1]
      ? parseInt(args.find(a => a.startsWith('--year='))!.split('=')[1])
      : null,
  };
}

const CONFIG = {
  ...parseArgs(),
  RATE_LIMIT_DELAY_MS: 1500, // 1.5 seconds between API calls
  CONFIDENCE_THRESHOLD: 0.7, // Below this goes to review queue
  YEARS_TO_PROCESS: [2019, 2020, 2021, 2022, 2023, 2024],
};

interface ProcessResult {
  id: string;
  success: boolean;
  subTheme?: string;
  subThemeConfidence?: number;
  sectionDescription?: string;
  sectionDescConfidence?: number;
  error?: string;
  needsReview: boolean;
}

// Graceful shutdown flag
let shuttingDown = false;

async function createOrResumeMigrationRun(): Promise<string> {
  if (CONFIG.RESUME) {
    const existingRun = await prisma.migrationRun.findFirst({
      where: { status: { in: ['running', 'paused'] } },
      orderBy: { startedAt: 'desc' },
    });
    if (existingRun) {
      console.log(`Resuming migration run ${existingRun.id}`);
      console.log(`  Previously processed: ${existingRun.processedCount}/${existingRun.totalRecords}`);
      console.log(`  Last processed ID: ${existingRun.lastProcessedId}`);
      await prisma.migrationRun.update({
        where: { id: existingRun.id },
        data: { status: 'running' },
      });
      return existingRun.id;
    }
    console.log('No existing run to resume. Starting fresh.');
  }

  // Count total records to process
  const yearsToProcess = CONFIG.YEAR ? [CONFIG.YEAR] : CONFIG.YEARS_TO_PROCESS;
  const totalRecords = await prisma.outlookCall.count({
    where: {
      year: { in: yearsToProcess },
      OR: [
        { subTheme: null },
        { sectionDescription: null },
      ],
    },
  });

  if (totalRecords === 0) {
    console.log('No records need processing. All fields are already populated.');
    process.exit(0);
  }

  const run = await prisma.migrationRun.create({
    data: {
      totalRecords,
      status: 'running',
    },
  });

  console.log(`Created new migration run: ${run.id}`);
  console.log(`Total records to process: ${totalRecords}`);
  return run.id;
}

async function getRecordsToProcess(migrationRunId: string, batchSize: number) {
  const run = await prisma.migrationRun.findUnique({ where: { id: migrationRunId } });
  const yearsToProcess = CONFIG.YEAR ? [CONFIG.YEAR] : CONFIG.YEARS_TO_PROCESS;

  const whereClause: any = {
    year: { in: yearsToProcess },
    OR: [
      { subTheme: null },
      { sectionDescription: null },
    ],
  };

  // Resume from last processed ID if available
  if (run?.lastProcessedId) {
    whereClause.id = { gt: run.lastProcessedId };
  }

  return prisma.outlookCall.findMany({
    where: whereClause,
    orderBy: { id: 'asc' },
    take: batchSize,
  });
}

async function generateSubTheme(record: any): Promise<{ subTheme: string; confidence: number } | null> {
  if (record.subTheme) return null; // Already has value
  if (!record.callText || record.callText.trim().length < 20) {
    return { subTheme: record.theme, confidence: 0.3 }; // Fallback to theme if no text
  }

  try {
    const examples = await getSubThemeExamples(prisma, record.theme);
    const taxonomyStr = JSON.stringify(TAXONOMY, null, 2);

    const promptText = await loadPrompt('generate-subtheme', {
      year: record.year,
      institution: record.institutionCanonical,
      theme: record.theme,
      themeCategory: record.themeCategory,
      callText: record.callText.substring(0, 2000), // Limit context size
      examples,
      taxonomy: taxonomyStr,
    });

    const completion = await getCompletion(
      [
        {
          role: 'system',
          content: 'You are a Bloomberg financial editor specializing in investment outlook categorization. Always respond with valid JSON.',
        },
        { role: 'user', content: promptText },
      ],
      { temperature: 0.3, max_tokens: 500 }
    );

    const result = parseAiResponse(completion, SubThemeGenerationSchema);
    return { subTheme: result.subTheme, confidence: result.confidence };
  } catch (error: any) {
    console.error(`  Error generating subTheme for ${record.id}:`, error.message);
    return null;
  }
}

async function generateSectionDescription(
  record: any,
  newSubTheme: string | null
): Promise<{ sectionDescription: string; confidence: number } | null> {
  if (record.sectionDescription) return null; // Already has value
  if (!record.callText || record.callText.trim().length < 20) {
    return null; // Can't generate without text
  }

  try {
    const examples = await getSectionDescExamples(prisma, record.theme);

    const promptText = await loadPrompt('generate-section-description', {
      year: record.year,
      institution: record.institutionCanonical,
      theme: record.theme,
      subTheme: newSubTheme || record.subTheme || 'N/A',
      themeCategory: record.themeCategory,
      callText: record.callText.substring(0, 2000), // Limit context size
      examples,
    });

    const completion = await getCompletion(
      [
        {
          role: 'system',
          content: 'You are a Bloomberg financial editor crafting concise investment call summaries. Always respond with valid JSON.',
        },
        { role: 'user', content: promptText },
      ],
      { temperature: 0.3, max_tokens: 500 }
    );

    const result = parseAiResponse(completion, SectionDescriptionGenerationSchema);
    return { sectionDescription: result.sectionDescription, confidence: result.confidence };
  } catch (error: any) {
    console.error(`  Error generating sectionDescription for ${record.id}:`, error.message);
    return null;
  }
}

async function processRecord(record: any): Promise<ProcessResult> {
  const result: ProcessResult = {
    id: record.id,
    success: false,
    needsReview: false,
  };

  try {
    // Generate subTheme if missing
    const subThemeResult = await generateSubTheme(record);
    if (subThemeResult) {
      result.subTheme = subThemeResult.subTheme;
      result.subThemeConfidence = subThemeResult.confidence;
      if (subThemeResult.confidence < CONFIG.CONFIDENCE_THRESHOLD) {
        result.needsReview = true;
      }
    }

    // Rate limit between API calls
    await sleep(CONFIG.RATE_LIMIT_DELAY_MS);

    // Generate sectionDescription if missing
    const sectionDescResult = await generateSectionDescription(record, result.subTheme || null);
    if (sectionDescResult) {
      result.sectionDescription = sectionDescResult.sectionDescription;
      result.sectionDescConfidence = sectionDescResult.confidence;
      if (sectionDescResult.confidence < CONFIG.CONFIDENCE_THRESHOLD) {
        result.needsReview = true;
      }
    }

    result.success = true;
  } catch (error: any) {
    result.error = error.message;
  }

  return result;
}

async function saveResult(result: ProcessResult, migrationRunId: string) {
  if (CONFIG.DRY_RUN) {
    console.log(`  [DRY RUN] Would save:`, {
      id: result.id,
      subTheme: result.subTheme,
      subThemeConfidence: result.subThemeConfidence,
      sectionDescription: result.sectionDescription?.substring(0, 50) + '...',
      sectionDescConfidence: result.sectionDescConfidence,
      needsReview: result.needsReview,
    });
    return;
  }

  const updateData: any = {
    generatedAt: new Date(),
    needsReview: result.needsReview,
  };

  // Update subTheme if generated
  if (result.subTheme) {
    updateData.subTheme = result.subTheme;
    updateData.subThemeGenerated = true;
    updateData.subThemeConfidence = result.subThemeConfidence;

    // Add to review queue if low confidence
    if (result.subThemeConfidence && result.subThemeConfidence < CONFIG.CONFIDENCE_THRESHOLD) {
      await prisma.reviewQueue.create({
        data: {
          outlookCallId: result.id,
          field: 'subTheme',
          generatedValue: result.subTheme,
          confidence: result.subThemeConfidence,
        },
      });
    }
  }

  // Update sectionDescription if generated
  if (result.sectionDescription) {
    updateData.sectionDescription = result.sectionDescription;
    updateData.sectionDescGenerated = true;
    updateData.sectionDescConfidence = result.sectionDescConfidence;

    if (result.sectionDescConfidence && result.sectionDescConfidence < CONFIG.CONFIDENCE_THRESHOLD) {
      await prisma.reviewQueue.create({
        data: {
          outlookCallId: result.id,
          field: 'sectionDescription',
          generatedValue: result.sectionDescription,
          confidence: result.sectionDescConfidence,
        },
      });
    }
  }

  await prisma.outlookCall.update({
    where: { id: result.id },
    data: updateData,
  });

  // Update migration run progress
  await prisma.migrationRun.update({
    where: { id: migrationRunId },
    data: {
      processedCount: { increment: 1 },
      errorCount: result.success ? undefined : { increment: 1 },
      lastProcessedId: result.id,
    },
  });
}

async function main() {
  console.log('='.repeat(60));
  console.log('AI Backfill Migration Script');
  console.log('='.repeat(60));
  console.log('Configuration:');
  console.log(`  Batch size: ${CONFIG.BATCH_SIZE}`);
  console.log(`  Dry run: ${CONFIG.DRY_RUN}`);
  console.log(`  Resume: ${CONFIG.RESUME}`);
  console.log(`  Year filter: ${CONFIG.YEAR || 'All (2019-2024)'}`);
  console.log(`  Confidence threshold: ${CONFIG.CONFIDENCE_THRESHOLD}`);
  console.log('='.repeat(60));

  const migrationRunId = await createOrResumeMigrationRun();
  let totalProcessed = 0;
  let totalErrors = 0;

  try {
    while (!shuttingDown) {
      const records = await getRecordsToProcess(migrationRunId, CONFIG.BATCH_SIZE);

      if (records.length === 0) {
        console.log('\nNo more records to process. Migration complete!');
        break;
      }

      console.log(`\nProcessing batch of ${records.length} records...`);

      for (const record of records) {
        if (shuttingDown) {
          console.log('\nShutdown requested. Stopping gracefully...');
          break;
        }

        console.log(`  Processing ${record.id} (${record.year} | ${record.institutionCanonical} | ${record.theme})`);

        const result = await processRecord(record);
        await saveResult(result, migrationRunId);

        if (result.success) {
          totalProcessed++;
          if (result.subTheme) {
            console.log(`    -> subTheme: "${result.subTheme}" (confidence: ${result.subThemeConfidence?.toFixed(2)})`);
          }
          if (result.sectionDescription) {
            console.log(`    -> sectionDesc: "${result.sectionDescription.substring(0, 60)}..." (confidence: ${result.sectionDescConfidence?.toFixed(2)})`);
          }
        } else {
          totalErrors++;
          console.log(`    -> ERROR: ${result.error}`);
        }

        // Rate limiting between records
        await sleep(CONFIG.RATE_LIMIT_DELAY_MS);
      }

      // Status update after each batch
      const run = await prisma.migrationRun.findUnique({ where: { id: migrationRunId } });
      if (run) {
        const pct = ((run.processedCount / run.totalRecords) * 100).toFixed(1);
        console.log(`\n[Progress: ${run.processedCount}/${run.totalRecords} (${pct}%) | Errors: ${run.errorCount}]`);
      }
    }

    // Mark migration as complete or paused
    const finalStatus = shuttingDown ? 'paused' : 'completed';
    await prisma.migrationRun.update({
      where: { id: migrationRunId },
      data: {
        status: finalStatus,
        completedAt: shuttingDown ? undefined : new Date(),
      },
    });

    console.log('\n' + '='.repeat(60));
    console.log(`Migration ${finalStatus}.`);
    console.log(`  Total processed: ${totalProcessed}`);
    console.log(`  Total errors: ${totalErrors}`);
    if (shuttingDown) {
      console.log('  Run with --resume to continue.');
    }
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\nMigration failed:', error);
    await prisma.migrationRun.update({
      where: { id: migrationRunId },
      data: { status: 'failed' },
    });
    throw error;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  console.log('\n\nReceived SIGINT (Ctrl+C). Finishing current record...');
  shuttingDown = true;
});

process.on('SIGTERM', async () => {
  console.log('\n\nReceived SIGTERM. Finishing current record...');
  shuttingDown = true;
});

// Run the migration
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
