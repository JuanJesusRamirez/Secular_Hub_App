import { LRUCache } from 'lru-cache';

const options = {
  max: 100, // Maximum number of items in the cache
  ttl: 1000 * 60 * 60, // 1 hour default TTL
  allowStale: false,
};

const cache = new LRUCache<string, any>(options);

export function getCached<T>(key: string): T | undefined {
  return cache.get(key) as T | undefined;
}

export function setCached(key: string, value: any, ttl?: number) {
  cache.set(key, value, { ttl });
}

export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedKeys = Object.keys(params).sort();
  const paramString = sortedKeys.map(key => `${key}:${JSON.stringify(params[key])}`).join('|');
  return `${prefix}|${paramString}`;
}
