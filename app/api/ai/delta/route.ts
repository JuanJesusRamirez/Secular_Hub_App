import { NextResponse } from 'next/server';
import { getCompareStats } from '@/lib/db/queries';
import { getCompletion } from '@/lib/ai/client';
import { loadPrompt } from '@/lib/ai/prompts';
import { parseAiResponse, DeltaNarrativeSchema } from '@/lib/ai/parsers';
import { getCached, setCached, generateCacheKey } from '@/lib/ai/cache';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { year1, year2, theme_category } = body;

    if (!year1 || !year2) {
      return NextResponse.json({ error: 'Both year1 and year2 are required' }, { status: 400 });
    }

    const cacheKey = generateCacheKey('delta-narrative', { year1, year2, theme_category });
    const cachedResult = getCached(cacheKey);
    if (cachedResult) return NextResponse.json(cachedResult);

    // Fetch comparison stats
    const stats = await getCompareStats(year1, year2);
    
    // Format stats for prompt
    const emerged = stats.themes_emerged.slice(0, 10).join(', ');
    const extinct = stats.themes_extinct.slice(0, 10).join(', ');
    const grew = stats.themes_grew.slice(0, 5).map(t => `${t.theme} (+${t.delta})`).join(', ');
    const declined = stats.themes_declined.slice(0, 5).map(t => `${t.theme} (${t.delta})`).join(', ');

    // We also need "top themes" for context, which getCompareStats doesn't fully give in a simple list
    // We can infer them from grew/declined or fetch separately. 
    // For simplicity, we'll use the grew/declined lists as proxies for active themes.
    const year1_themes = stats.themes_declined.map(t => t.theme).slice(0, 10).join(', ');
    const year2_themes = stats.themes_grew.map(t => t.theme).slice(0, 10).join(', ');


    const promptText = await loadPrompt('delta-narrative', {
      year1,
      year2,
      year1_themes,
      year2_themes,
      emerged,
      extinct,
      increased: grew,
      decreased: declined,
    });

    const completion = await getCompletion([
      { role: 'system', content: 'You are a market strategist.' },
      { role: 'user', content: promptText }
    ], { temperature: 0.4 });

    const result = parseAiResponse(completion, DeltaNarrativeSchema);

    setCached(cacheKey, result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
