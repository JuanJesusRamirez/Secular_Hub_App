import { loadPrompt } from '../lib/ai/prompts';
import { generateCacheKey } from '../lib/ai/cache';
import { ConsensusSummarySchema, parseAiResponse } from '../lib/ai/parsers';

async function verify() {
  console.log('Verifying AI Integration components...');

  // 1. Verify Prompt Loading
  try {
    console.log('Testing Prompt Loading...');
    const prompt = await loadPrompt('consensus-summary', {
      year: 2025,
      count: 10,
      calls: 'Test calls',
    });
    if (prompt.includes('2025') && prompt.includes('Test calls')) {
      console.log('✅ Prompt loading passed');
    } else {
      console.error('❌ Prompt loading failed interpolation');
    }
  } catch (e) {
    console.error('❌ Prompt loading failed:', e);
  }

  // 2. Verify Cache Key Generation
  try {
    console.log('Testing Cache Key Generation...');
    const key = generateCacheKey('test', { a: 1, b: '2' });
    if (key === 'test|a:1|b:"2"') {
      console.log('✅ Cache key generation passed');
    } else {
      console.error('❌ Cache key generation failed:', key);
    }
  } catch (e) {
    console.error('❌ Cache key generation failed:', e);
  }

  // 3. Verify Parsing Logic
  try {
    console.log('Testing Parser...');
    const mockResponse = `
    \`\`\`json
    {
      "summary": "Test summary",
      "key_themes": ["a"],
      "dominant_view": "b",
      "notable_outliers": [],
      "confidence": "high"
    }
    \`\`\`
    `;
    const parsed = parseAiResponse(mockResponse, ConsensusSummarySchema);
    if (parsed.summary === 'Test summary') {
      console.log('✅ Parser passed');
    } else {
      console.error('❌ Parser failed validation');
    }
  } catch (e) {
    console.error('❌ Parser failed:', e);
  }

  console.log('Verification Complete. To test actual API calls, run the dev server and use curl.');
}

verify();
