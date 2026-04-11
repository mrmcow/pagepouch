'use client'

import { usePathname } from 'next/navigation'
import { useLayoutEffect } from 'react'

/**
 * Landing page (/) is always light — ignores pagestash-theme from the dashboard.
 * Syncs on client navigations (layout head script only runs on full load).
 */
export function MarketingHomeTheme() {
  const pathname = usePathname()

  useLayoutEffect(() => {
    const p = pathname || ''
    const isHome = p === '/' || p === ''
    if (!isHome) {
      document.documentElement.style.colorScheme = ''
      const t =
        typeof localStorage !== 'undefined'
          ? localStorage.getItem('pagestash-theme')
          : null
      if (t === 'dark') document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
      return
    }
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = 'light'
  }, [pathname])

  return null
}
