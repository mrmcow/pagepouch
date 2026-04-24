import { Metadata } from 'next'

const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://pagestash.app').replace(/\/$/, '')
const BLOG_URL = `${SITE_URL}/blog`

export const metadata: Metadata = {
  // Use plain string so the root `template: '%s | PageStash'` applies cleanly.
  title: 'Research & Productivity Blog',
  description: 'Guides, comparisons, and workflows for researchers, analysts, and knowledge workers. Web clipping, PKM systems, OSINT tools, and more — from the PageStash team.',
  keywords: [
    'web research tools',
    'personal knowledge management',
    'web clipping',
    'research organization',
    'PKM systems',
    'OSINT tools',
    'web archiving',
    'productivity for researchers',
    'knowledge management tools',
    'web capture',
  ].join(', '),
  alternates: {
    canonical: BLOG_URL,
  },
  openGraph: {
    title: 'Research & Productivity Blog | PageStash',
    description: 'Guides, comparisons, and workflows for researchers, analysts, and knowledge workers.',
    type: 'website',
    url: BLOG_URL,
    siteName: 'PageStash',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'PageStash Blog' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Research & Productivity Blog | PageStash',
    description: 'Guides, comparisons, and workflows for researchers, analysts, and knowledge workers.',
    creator: '@pagestash',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${BLOG_URL}/#blog`,
    name: 'Research & Productivity Blog',
    description: 'Guides, comparisons, and workflows for researchers, analysts, and knowledge workers.',
    url: BLOG_URL,
    publisher: { '@id': `${SITE_URL}/#organization` },
    isPartOf: { '@id': `${SITE_URL}/#website` },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      {children}
    </>
  )
}

