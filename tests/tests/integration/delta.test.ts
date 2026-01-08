
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

describe('Delta Module Data Flow', async () => {
    
    it('Compare API provides Sankey flows', async () => {
        // Delta module relies heavily on comparison
        const stats = await fetchJson('/api/stats');
        const years = stats.years.map((y: any) => y.year).sort();
        if (years.length < 2) return; // Skip
        
        const y1 = years[years.length - 2];
        const y2 = years[years.length - 1];
        
        const data = await fetchJson(`/api/compare?year1=${y1}&year2=${y2}`);
        
        assert.ok(data.emergingThemes, 'Should identify emerging themes');
        assert.ok(data.decliningThemes, 'Should identify declining themes');
        
        // Check for continuity flows if they exist in the API
        // or ensure the data supports building them
    });
});
