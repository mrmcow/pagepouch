import type { Metadata } from 'next'
import { IntentCaptureContent } from '@/components/marketing/IntentCaptureContent'
import { SITE_URL } from '@/lib/site-url'

const path = '/archive-webpage'

export const metadata: Metadata = {
  title: 'Archive a Webpage Before It Changes or Vanishes',
  description:
    'Learn how to archive a webpage with full context: screenshots, HTML, and searchable text. PageStash is built for researchers and analysts who cannot afford link rot.',
  alternates: { canonical: `${SITE_URL}${path}` },
  openGraph: {
    title: 'Archive a webpage — full capture for research & investigations',
    description:
      'If you have ever lost a critical webpage, screenshot, or source while researching — PageStash fixes that with durable archives you can search.',
    url: `${SITE_URL}${path}`,
    type: 'article',
  },
}

export default function ArchiveWebpageIntentPage() {
  return (
    <IntentCaptureContent
      canonicalPath={path}
      h1="How to archive a webpage (and actually find it again)"
      lead="People do not Google “save full webpage tool.” They search **how to archive a webpage**, **save webpage permanently**, and **website archiver tool** — because the problem is **loss**, not “saving.”"
      hookQuote="If you have ever lost a critical webpage, screenshot, or source while researching — this fixes that. PageStash captures full-page context, metadata, and notes so useful findings do not disappear across tabs, screenshots, and bookmarks."
      problemTitle="Why bookmarks and PDF exports fail"
      problemBody="Bookmarks point at URLs that change. PDFs often strip structure and dynamic tables. Screenshots are not searchable. A real **webpage archive** preserves what the page showed — including layout cues — and keeps it **full-text searchable** for your future self and your team."
      clusterTitle="Keyword cluster: webpage archiving"
      clusters={[
        {
          title: 'High-intent queries this page maps to',
          items: [
            'archive webpage',
            'save webpage permanently',
            'website archiver tool',
            'save webpage with formatting',
            'how to preserve a web page',
          ],
        },
      ]}
      solutionTitle="How PageStash answers the intent"
      solutionBullets={[
        'One-click capture from Chrome or Firefox: **screenshot + HTML + extracted text** tied to the URL and time.',
        '**Full-text search** across your library — find a sentence you remember, not a filename you forgot.',
        'Folders, tags, and notes so captures stay attached to **projects, matters, and reports**.',
        'Exports when you need to drop evidence into memos, slide decks, or compliance packets.',
      ]}
      positioningLine="PageStash is research infrastructure for people who treat the browser as an instrument — not a junk drawer."
      personaBadges={['Researchers', 'Analysts', 'Investigators', 'Compliance']}
      primaryCta={{ href: '/auth/signup', label: 'Start free — 10 clips / month' }}
      secondaryCta={{ href: '/blog/how-to-preserve-web-pages', label: 'Read: how to preserve web pages' }}
      relatedReading={[
        { href: '/blog/how-to-archive-web-content-permanently', title: 'How to archive web content permanently' },
        { href: '/blog/wayback-machine-vs-personal-web-archive', title: 'Wayback Machine vs personal web archive' },
        { href: '/blog/web-clipping-archiving-tool-explained', title: 'Web clipping & archiving explained' },
      ]}
    />
  )
}
