import { NextResponse } from 'next/server';
import { getOutlooks } from '@/lib/db/queries';
import { getCompletion } from '@/lib/ai/client';
import { loadPrompt } from '@/lib/ai/prompts';
import { parseAiResponse, ConsensusSummarySchema } from '@/lib/ai/parsers';
import { getCached, setCached, generateCacheKey } from '@/lib/ai/cache';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { year, theme_category, max_calls = 50 } = body;

    if (!year) {
      return NextResponse.json({ error: 'Year is required' }, { status: 400 });
    }

    // Cache check
    const cacheKey = generateCacheKey('consensus-summary', { year, theme_category, max_calls });
    const cachedResult = getCached(cacheKey);
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }

    // Fetch data
    const { data: calls } = await getOutlooks({
      year,
      themeCategory: theme_category,
      limit: max_calls,
    });

    if (calls.length === 0) {
      return NextResponse.json({ error: 'No calls found for criteria' }, { status: 404 });
    }

    // Prepare prompt
    const formattedCalls = calls.map((c: any) => 
      `- Institution: ${c.institutionCanonical}\n- Theme: ${c.theme}\n- View: ${c.callText}`
    ).join('\n\n');

    const promptText = await loadPrompt('consensus-summary', {
      year,
      count: calls.length,
      calls: formattedCalls,
    });

    // Call LLM
    const completion = await getCompletion([
      { role: 'system', content: 'You are a helpful financial analyst.' },
      { role: 'user', content: promptText }
    ], { temperature: 0.3 }); // Lower temp for factual summaries

    // Parse and validates
    const result = parseAiResponse(completion, ConsensusSummarySchema);

    // Cache result
    setCached(cacheKey, result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
  }
}
