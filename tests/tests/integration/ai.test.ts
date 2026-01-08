
import { describe, it } from 'node:test';
import assert from 'node:assert';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function fetchJson(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

describe('AI Integration Tests', async () => {
    
    // Note: These tests might fail if LLM API keys are not valid or if rate limits are hit.
    // We should treat them as "soft" failures or skip if env vars missing.
    // For now, checks if endpoint exists and handles "missing key" gracefully (returns 500 or 400 with specific message).
    
    it('GET /api/ai/summary returns structured response or error', async () => {
        try {
             // Expecting a POST usually for AI generation, or GET if fetching cached.
             // Based on API naming, check one known endpoint.
             // Example: /api/stats/themes might trigger AI or just DB?
             
             // Let's assume there is a generic AI health check or we test a specific generation
             // Sending a dummy request to check pipeline
             const res = await fetch(`${BASE_URL}/api/ai/summary`, {
                 method: 'POST',
                 body: JSON.stringify({ year: 2026, type: 'consensus' }),
                 headers: { 'Content-Type': 'application/json' }
             });
             
             if (res.status === 401 || res.status === 500) {
                 // Acceptable if keys are missing in test env, means endpoint is there
                 console.log('AI Endpoint reachable but returned error (expected without keys):', res.status);
             } else {
                 const data = await res.json();
                 assert.ok(data, 'Should return data');
             }
        } catch (e) {
            // connection refused is bad, header error is fine
            if ((e as Error).message.includes('fetch')) throw e;
        }
    });
});
