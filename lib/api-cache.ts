/**
 * lib/api-cache.ts
 *
 * Lightweight, zero-dependency in-process LRU cache for API GET routes.
 * - Per-entry TTL (default 30 s)
 * - Max 500 entries — oldest evicted automatically
 * - Safe for Next.js Edge/Node.js runtimes (no Redis required)
 * - Cache is keyed by full request URL so filters, pagination etc. are isolated
 */

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

const MAX_ENTRIES = 500

class LRUApiCache {
  private store = new Map<string, CacheEntry<unknown>>()

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    // Move to end (most-recently-used)
    this.store.delete(key)
    this.store.set(key, entry)
    return entry.value
  }

  set<T>(key: string, value: T, ttlMs = 30_000): void {
    // Evict oldest entry when at capacity
    if (this.store.size >= MAX_ENTRIES) {
      const oldestKey = this.store.keys().next().value
      if (oldestKey !== undefined) this.store.delete(oldestKey)
    }
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs })
  }

  /** Invalidate all entries whose key contains the given prefix */
  invalidate(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.includes(prefix)) this.store.delete(key)
    }
  }

  clear(): void {
    this.store.clear()
  }
}

// Singleton — shared across all Route Handler invocations in the same Node.js process
declare global {
  // eslint-disable-next-line no-var
  var _apiCache: LRUApiCache | undefined
}

export const apiCache: LRUApiCache =
  (globalThis._apiCache ??= new LRUApiCache())

/**
 * Wrap a GET handler with automatic caching.
 *
 * Usage:
 *   return withCache(cacheKey, () => doDbQuery(), 30_000)
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = 30_000
): Promise<T> {
  const cached = apiCache.get<T>(key)
  if (cached !== null) return cached

  const fresh = await fetcher()
  apiCache.set(key, fresh, ttlMs)
  return fresh
}
