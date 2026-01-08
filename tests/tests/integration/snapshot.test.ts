
import { describe, it } from 'node:test';
import assert from 'node:assert';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function fetchJson(endpoint: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

describe('Snapshot Module Data Flow', async () => {
    
    it('Theme Hierarchy data is valid for Treemap', async () => {
        // Snapshot usually needs a hierarchy of themes
        // Assuming there is an endpoint or we construct it from /api/stats/themes
        const data = await fetchJson('/api/stats/themes');
        
        // Structure should be array of { category, themes: [...] } or similar
        assert.ok(Array.isArray(data), 'Response should be an array');
        if (data.length > 0) {
            const firstGroup = data[0];
            assert.ok(firstGroup.category || firstGroup.name, 'Should have category name');
            assert.ok(typeof firstGroup.start_count === 'number', 'Should have count');
        }
    });

    it('Sentiment Distribution data is valid', async () => {
        // Checking stats that might drive the sentiment chart
        const data = await fetchJson('/api/stats');
        assert.ok(data.sentiment, 'Should have sentiment stats');
        // Validation of sentiment structure (high, medium, low)
        // Adjust based on actual API response structure verified later if needed
    });
});
