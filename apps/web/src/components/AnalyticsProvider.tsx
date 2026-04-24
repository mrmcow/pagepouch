'use client'

/**
 * AnalyticsProvider
 *
 * Mounts once in the root layout and handles two jobs:
 *   1. SPA page-view tracking — fires trackPageView on every Next.js client
 *      navigation so GA4 sees each route change (not just the initial server hit).
 *   2. UTM parameter capture — reads utm_* query params from the landing URL and
 *      persists them to sessionStorage so they can be forwarded to conversion events
 *      (signup, checkout) even after the URL has changed.
 *
 * Uses useSearchParams which requires a Suspense boundary — the exported
 * AnalyticsProvider wraps the inner component automatically.
 */

import { Suspense, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { trackPageView } from '@/lib/analytics'

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const

function AnalyticsInner() {
  const pathname  = usePathname()
  const searchParams = useSearchParams()

  // ── 1. Capture UTM params on the first landing ──────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return

    const incoming: Record<string, string> = {}
    UTM_KEYS.forEach((key) => {
      const val = searchParams?.get(key)
      if (val) incoming[key] = val
    })

    if (Object.keys(incoming).length > 0) {
      // Overwrite any previous session UTMs (new ad click = new attribution)
      sessionStorage.setItem('pagestash_utms', JSON.stringify(incoming))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once on mount — the landing URL never changes mid-session

  // ── 2. Track SPA navigations ─────────────────────────────────────────────────
  useEffect(() => {
    if (!pathname) return
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    trackPageView(url)
  }, [pathname, searchParams])

  return null
}

export function AnalyticsProvider() {
  return (
    <Suspense fallback={null}>
      <AnalyticsInner />
    </Suspense>
  )
}
