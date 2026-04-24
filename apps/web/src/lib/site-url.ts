/**
 * Canonical site URL resolver.
 *
 * This is the single source of truth for the public origin of the marketing
 * site. All metadata (canonical tags, sitemap URLs, JSON-LD, og:url) MUST come
 * from here so Google never sees mismatched canonicals.
 *
 * Why this exists:
 *   Vercel auto-populates some environments with NEXT_PUBLIC_APP_URL pointing
 *   at its internal preview origin (e.g. https://pagepouch-web.vercel.app).
 *   If we emit that as a canonical in production, Google treats the real
 *   domain as an "Alternative page with proper canonical tag" and refuses to
 *   index it — which is exactly what happened in GSC.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_APP_URL if it's set AND it isn't a vercel.app host
 *   2. Otherwise the production canonical: https://www.pagestash.app
 *
 * The canonical domain has www because:
 *   - GSC is registered against https://www.pagestash.app/
 *   - The apex domain already 307-redirects to the www variant
 *   - Existing backlinks point at www
 */

const PRODUCTION_CANONICAL = 'https://www.pagestash.app'

function normalise(url: string): string {
  return url.trim().replace(/\/+$/, '')
}

function isVercelHost(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith('.vercel.app')
  } catch {
    return false
  }
}

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL
  if (raw && raw.startsWith('http')) {
    if (isVercelHost(raw)) {
      // Preview / Vercel auto-assigned host — ignore so we don't emit a
      // broken canonical in production. Dev still works because localhost
      // passes the check below (not vercel.app).
      return PRODUCTION_CANONICAL
    }
    return normalise(raw)
  }
  return PRODUCTION_CANONICAL
}

export const SITE_URL = getSiteUrl()
