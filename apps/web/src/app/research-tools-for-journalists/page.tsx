import type { Metadata } from 'next'
import { IntentCaptureContent } from '@/components/marketing/IntentCaptureContent'
import { SITE_URL } from '@/lib/site-url'

const path = '/research-tools-for-journalists'

export const metadata: Metadata = {
  title: 'Research Tools for Journalists — Archive Sources Before They Change',
  description:
    'Journalists: capture web sources with screenshots, HTML, and searchable text. PageStash helps you preserve pages for fact-checking, corrections, and long investigations.',
  alternates: { canonical: `${SITE_URL}${path}` },
  openGraph: {
    title: 'Research tools for journalists — defensible web capture',
    description: 'Keep proof, not pointers. Search your archive.',
    url: `${SITE_URL}${path}`,
    type: 'article',
  },
}

export default function ResearchToolsJournalistsPage() {
  return (
    <IntentCaptureContent
      canonicalPath={path}
      h1="Research tools for journalists: archive first, write second"
      lead="Editors ask a brutal question: **“Can you prove it was on the site?”** Bookmarks cannot answer that. Journalists search **research tools for journalists** and **archive webpage** because the story is only as strong as the **evidence chain**."
      hookQuote="If you have ever lost a critical webpage, screenshot, or source while researching — this fixes that. PageStash captures full-page context you can search when the newsroom is noisy."
      problemTitle="Screenshots are not a newsroom system"
      problemBody="Screenshots are fast — until you need **the paragraph**, **the timestamp story**, or **the exact table**. You need searchable archives with stable metadata and exports that do not leak unrelated tabs."
      clusterTitle="Journalist intent cluster"
      clusters={[
        {
          title: 'Queries this page maps to',
          items: [
            'research tools for journalists',
            'how journalists archive web sources',
            'save evidence from websites',
            'tools for investigations',
            'alternative to bookmarks for research',
          ],
        },
      ]}
      solutionTitle="PageStash for newsroom-grade capture"
      solutionBullets={[
        'Capture **full pages** from Chrome/Firefox while you are on deadline.',
        'Add a **note** at capture time: “claim”, “denial”, “context”, “needs secondary”.',
        '**Search** across your clips to find quotes and clauses quickly.',
        'Export when legal or standards needs a clean bundle.',
      ]}
      positioningLine="Used by researchers and investigators — and built for anyone who treats the web as evidence."
      personaBadges={['Journalists', 'Editors', 'Researchers', 'Producers']}
      primaryCta={{ href: '/auth/signup', label: 'Start free — 10 clips / month' }}
      secondaryCta={{ href: '/blog/journalist-guide-web-research', label: 'Journalist web research guide' }}
      relatedReading={[
        { href: '/blog/journalist-guide-web-research', title: 'Journalist guide to web research' },
        { href: '/blog/how-journalists-prove-webpage-changed-after-publication', title: 'Prove a webpage changed (journalism)' },
        { href: '/blog/save-page-as-proof-verifiable-record', title: 'Save a page as proof' },
      ]}
    />
  )
}
