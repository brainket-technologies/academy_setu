/**
 * lib/query-helpers.ts
 *
 * Shared SQL query helpers for production-optimized API routes.
 *
 * Key pattern used throughout:
 *  ─ COUNT(*) OVER()  window function → single DB round-trip for data+count
 *  ─ withCache        → in-process LRU cache avoids repeated DB hits
 *  ─ Cache-Control    → edge-layer / CDN caching for read-heavy endpoints
 */

import pool from '@/lib/db'
import { withCache, apiCache } from '@/lib/api-cache'
import { NextResponse } from 'next/server'

/**
 * Build a paginated SELECT with an embedded total count.
 * Returns { rows, totalCount } without a separate COUNT query.
 */
export async function paginatedQuery<T = Record<string, unknown>>(opts: {
  table: string
  select?: string          // default '*'
  where?: string           // e.g. 'WHERE status = $1 AND ...'
  orderBy?: string         // e.g. 'ORDER BY created_at DESC'
  params: unknown[]
  page: number
  pageSize: number
}): Promise<{ rows: T[]; totalCount: number }> {
  const {
    table,
    select = '*',
    where = '',
    orderBy = 'ORDER BY created_at DESC',
    params,
    page,
    pageSize,
  } = opts

  const offset = (page - 1) * pageSize
  const limitIdx = params.length + 1
  const offsetIdx = params.length + 2

  const sql = `
    SELECT ${select}, COUNT(*) OVER()::int AS _total_count
    FROM ${table}
    ${where}
    ${orderBy}
    LIMIT $${limitIdx} OFFSET $${offsetIdx}
  `

  const result = await pool.query(sql, [...params, pageSize, offset])
  const totalCount = result.rows[0]?._total_count ?? 0
  const rows = result.rows.map(({ _total_count, ...r }) => r) as T[]
  return { rows, totalCount }
}

/**
 * Return a cached paginated JSON response with HTTP cache headers.
 */
export async function cachedPaginatedResponse(opts: {
  cacheKey: string
  ttlMs?: number
  fetcher: () => Promise<{ rows: unknown[]; totalCount: number }>
  page: number
  pageSize: number
  smaxage?: number
}) {
  const { cacheKey, ttlMs = 30_000, fetcher, page, pageSize, smaxage = 30 } = opts

  const data = await withCache(cacheKey, fetcher, ttlMs)

  return NextResponse.json(
    {
      success: true,
      data: data.rows,
      meta: {
        totalCount: data.totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(data.totalCount / pageSize),
      },
    },
    {
      headers: {
        'Cache-Control': `public, s-maxage=${smaxage}, stale-while-revalidate=120`,
      },
    }
  )
}

/** Shorthand to invalidate + return success JSON in mutations */
export function invalidateAndRespond(
  cachePrefix: string,
  data: unknown,
  status = 200
): NextResponse {
  apiCache.invalidate(cachePrefix)
  return NextResponse.json({ success: true, data }, { status })
}
