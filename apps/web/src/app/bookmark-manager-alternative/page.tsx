import type { Metadata } from 'next'
import { IntentCaptureContent } from '@/components/marketing/IntentCaptureContent'
import { SITE_URL } from '@/lib/site-url'

const path = '/bookmark-manager-alternative'

export const metadata: Metadata = {
  title: 'Bookmark Manager Alternative for Research, OSINT & Investigations',
  description:
    'Bookmarks fail for serious research. PageStash is a bookmark manager alternative: full-page archives, full-text search, and exports — built for analysts.',
  alternates: { canonical: `${SITE_URL}${path}` },
  openGraph: {
    title: 'Bookmark manager alternative — archives + search',
    description:
      'Alternative to bookmarks for research: keep proof, not pointers.',
    url: `${SITE_URL}${path}`,
    type: 'article',
  },
}

export default function BookmarkManagerAlternativePage() {
  return (
    <IntentCaptureContent
      canonicalPath={path}
      h1="A bookmark manager alternative for people who outgrew bookmarks"
      lead="People search **alternative to bookmarks for research** because bookmarks optimize the wrong thing: **speed of saving**, not **probability of retrieval**. Serious workflows need archives, metadata, and search."
      hookQuote="If you have ever lost a critical webpage, screenshot, or source while researching — this fixes that. PageStash is used by analysts, researchers, and investigators who need a source library that survives the real web."
      problemTitle="Bookmarks are pointers, not memory"
      problemBody="A bookmark says “here might be something.” Research needs “**here is what it said** when I decided.” That is the gap between consumer tooling and **research infrastructure**."
      clusterTitle="Intent: bookmark alternative + analyst productivity"
      clusters={[
        {
          title: 'Queries this page supports',
          items: [
            'bookmark manager alternative',
            'alternative to bookmarks for research',
            'how to stop losing useful links during research',
            'research workflow tools',
            'tools for analysts',
          ],
        },
      ]}
      solutionTitle="What you get with PageStash"
      solutionBullets={[
        '**Full-page capture** so you keep the same evidence your eyes saw.',
        '**Full-text search** across your library — find the quote, not the URL.',
        '**Organization** that matches projects: folders, tags, notes.',
        'Optional **Page Graphs** when investigations connect many entities.',
      ]}
      positioningLine="PageStash helps researchers capture full-page web context, metadata, notes, and searchable source history — so findings do not disappear across tabs, screenshots, and bookmarks."
      personaBadges={['Researchers', 'Analysts', 'Investigators', 'Journalists']}
      primaryCta={{ href: '/auth/signup', label: 'Start free — 10 clips / month' }}
      secondaryCta={{ href: '/blog/why-bookmarks-fail', label: 'Read: why bookmarks fail' }}
      relatedReading={[
        { href: '/blog/why-bookmarks-fail', title: 'Why bookmarks fail' },
        { href: '/blog/stop-tab-hoarding', title: 'Stop tab hoarding' },
        { href: '/blog/read-later-vs-permanent-web-archive', title: 'Read later vs permanent web archive' },
      ]}
    />
  )
}
