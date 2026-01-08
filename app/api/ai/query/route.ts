import { NextResponse } from 'next/server';
import { getOutlooks } from '@/lib/db/queries';
import { getCompletion } from '@/lib/ai/client';
import { loadPrompt } from '@/lib/ai/prompts';
import { parseAiResponse, QuerySchema } from '@/lib/ai/parsers';
import { getCached, setCached, generateCacheKey } from '@/lib/ai/cache';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, filters = {} } = body;

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const { year, theme, institution } = filters;
    const cacheKey = generateCacheKey('query', { question, filters });
    const cachedResult = getCached(cacheKey);
    if (cachedResult) return NextResponse.json(cachedResult);

    // Fetch context calls relevant to the question
    // If no specific filters, we default to the most recent year or a broad search if configured.
    // Ideally, we'd use vector search, but here we use keyword search + filters.
    const { data: calls } = await getOutlooks({
      year,
      institution,
      theme,
      search: question, // Use the question as a keyword search
      limit: 20, // Strict limit for context window
    });

    if (calls.length === 0) {
      return NextResponse.json({ 
        answer: "I couldn't find any relevant outlook calls matching your criteria to answer this question.",
        sources: [],
        follow_up_questions: ["Try broadening your search filters.", "Ask about a specific theme or bank."]
      });
    }

    const context = calls.map((c: any) => 
      `[${c.id}] ${c.institutionCanonical} (${c.year}): "${c.callText}"`
    ).join('\n\n');

    const promptText = await loadPrompt('query', {
      question,
      context,
    });

    const completion = await getCompletion([
      { role: 'system', content: 'You are a helpful research assistant.' },
      { role: 'user', content: promptText }
    ], { temperature: 0.2 });

    const result = parseAiResponse(completion, QuerySchema);

    setCached(cacheKey, result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
