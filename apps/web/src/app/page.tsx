import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site-url'
import HomePageClient from './HomePageClient'

/** Homepage only — root layout must not set a global canonical (it poisoned client-only routes like /auth/*). */
export const metadata: Metadata = {
  alternates: {
    canonical: SITE_URL,
  },
}

export default function Page() {
  return <HomePageClient />
}
