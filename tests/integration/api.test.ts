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

describe('API Integration Tests', async () => {

    it('GET /api/stats returns valid aggregation', async () => {
        const data = await fetchJson('/api/stats');
        assert.ok(data.total_records > 0, 'Total records should be greater than 0');
        assert.ok(Array.isArray(data.years), 'Years should be an array');
        assert.ok(data.years.length > 0, 'Should have year stats');
        assert.ok(Array.isArray(data.institutions), 'Institutions should be an array');
        assert.ok(data.institutions.length > 0, 'Should have institution stats');
        assert.ok(Array.isArray(data.themes), 'Themes should be an array');
    });

    it('GET /api/outlooks returns paginated results', async () => {
        const data = await fetchJson('/api/outlooks?page=1&limit=10');
        assert.ok(Array.isArray(data.data), 'Data should be an array');
        assert.ok(data.data.length <= 10, 'Should return at most 10 items');
        assert.ok(data.pagination.total >= 0, 'Total count should be non-negative');
        assert.ok(typeof data.pagination.page === 'number', 'Page should be a number');
        assert.ok(typeof data.pagination.limit === 'number', 'Limit should be a number');
    });

    it('GET /api/compare returns valid delta', async () => {
        const stats = await fetchJson('/api/stats');
        const availableYears = stats.years.map((y: { year: number }) => y.year).sort();

        if (availableYears.length < 2) {
            console.warn('Skipping compare test: not enough years of data');
            return;
        }
        const year1 = availableYears[availableYears.length - 2];
        const year2 = availableYears[availableYears.length - 1];

        const data = await fetchJson(`/api/compare?year1=${year1}&year2=${year2}`);
        assert.strictEqual(data.year1, year1, 'year1 should match request');
        assert.strictEqual(data.year2, year2, 'year2 should match request');
        assert.ok(Array.isArray(data.themes_emerged), 'Should have themes_emerged array');
        assert.ok(Array.isArray(data.themes_extinct), 'Should have themes_extinct array');
        assert.ok(Array.isArray(data.themes_grew), 'Should have themes_grew array');
        assert.ok(Array.isArray(data.themes_declined), 'Should have themes_declined array');
        assert.ok(Array.isArray(data.institutional_changes), 'Should have institutional_changes array');
    });
});
