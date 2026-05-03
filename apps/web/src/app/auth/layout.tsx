import type { Metadata } from 'next'

/**
 * Auth flows should not compete in organic search with marketing pages.
 * Root layout no longer sets a global homepage canonical — this layout keeps
 * /auth/* out of the index while still allowing links to be followed.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children
}
