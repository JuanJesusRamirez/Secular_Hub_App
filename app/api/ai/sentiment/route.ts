import { NextResponse } from 'next/server';
import { getOutlookById } from '@/lib/db/queries';
import { getCompletion } from '@/lib/ai/client';
import { loadPrompt } from '@/lib/ai/prompts';
import { parseAiResponse, SentimentAnalysisSchema } from '@/lib/ai/parsers';
import { getCached, setCached, generateCacheKey } from '@/lib/ai/cache';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { call_ids } = body;

    if (!call_ids || !Array.isArray(call_ids) || call_ids.length === 0) {
      return NextResponse.json({ error: 'call_ids array is required' }, { status: 400 });
    }

    const results = [];

    // Process in parallel, but limit concurrency if needed (for now, simple Promise.all)
    const promises = call_ids.map(async (id: string) => {
      // Check cache
      const cacheKey = generateCacheKey('sentiment', { id });
      const cached = getCached(cacheKey);
      if (cached) return { call_id: id, sentiment: cached };

      // Fetch call
      const call = await getOutlookById(id);
      if (!call) return { call_id: id, error: 'Call not found' };

      // Prepare prompt
      const promptText = await loadPrompt('sentiment-analysis', {
        institution: call.institutionCanonical,
        theme: call.theme,
        year: call.year,
        text: call.callText,
      });

      try {
        // Call LLM
        const completion = await getCompletion([
          { role: 'user', content: promptText }
        ], { temperature: 0 }); // Deterministic

        // Parse
        const analysis = parseAiResponse(completion, SentimentAnalysisSchema);

        // Cache
        setCached(cacheKey, analysis);

        return { call_id: id, sentiment: analysis };
      } catch (err) {
        return { call_id: id, error: String(err) };
      }
    });

    const processed = await Promise.all(promises);

    return NextResponse.json({ results: processed });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
