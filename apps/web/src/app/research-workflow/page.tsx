import type { Metadata } from 'next'
import { IntentCaptureContent } from '@/components/marketing/IntentCaptureContent'
import { SITE_URL } from '@/lib/site-url'

const path = '/research-workflow'

export const metadata: Metadata = {
  title: 'Research Workflow Tools — Organize Findings Without Losing Sources',
  description:
    'Map to research organization intent: how analysts organize online research, research note taking tools, and a capture-first workflow that beats bookmarks.',
  alternates: { canonical: `${SITE_URL}${path}` },
  openGraph: {
    title: 'Research workflow — organize findings, keep proof',
    description:
      'Used by researchers and analysts who live in browser tabs but need a defensible source library.',
    url: `${SITE_URL}${path}`,
    type: 'article',
  },
}

export default function ResearchWorkflowIntentPage() {
  return (
    <IntentCaptureContent
      canonicalPath={path}
      h1="A research workflow that does not lose the internet"
      lead="Great work dies in **tabs**. Teams search **how to organize research findings**, **research organization tools**, and **research note taking tools** because the hard part is not reading — it is **retrieval under pressure**."
      hookQuote="If you have ever lost a critical webpage, screenshot, or source while researching — this fixes that. PageStash keeps full-page context searchable so your notes can point to proof, not dead URLs."
      problemTitle="Bookmarks are a junk drawer"
      problemBody="Bookmarks answer “I might come back.” Research workflows answer “**I will need to prove this**.” You need capture + naming + review rituals — and a library that supports **full-text search** across everything you saved."
      clusterTitle="Keyword cluster: research workflows"
      clusters={[
        {
          title: 'Queries this page maps to',
          items: [
            'research organization tools',
            'how to organize research',
            'research note taking tools',
            'tools for analysts',
            'research workflow tools',
          ],
        },
      ]}
      solutionTitle="PageStash as the capture backbone"
      solutionBullets={[
        '**Inbox → project folders**: keep capture frictionless, then sort weekly.',
        '**Titles that future-you can search** — never leave “Dashboard / Home” as the only signal.',
        '**Notes on clips** connect evidence to decisions (“Approved vendor language”, “Risk flag”).',
        '**Exports** when you need Markdown/CSV for memos, lit review, or client updates.',
      ]}
      positioningLine="PageStash helps researchers capture full-page web context, metadata, notes, and searchable source history."
      personaBadges={['Researchers', 'Consultants', 'Students', 'Analysts']}
      primaryCta={{ href: '/auth/signup', label: 'Build your research archive' }}
      secondaryCta={{ href: '/blog/capture-and-organize-research-sources-one-workflow-2026', label: 'Read: one workflow for sources' }}
      relatedReading={[
        { href: '/blog/research-organization-tools-compared-2026', title: 'Research organization tools compared' },
        { href: '/blog/best-workspace-capturing-organizing-research-sources-2026', title: 'Best workspace for sources (2026)' },
        { href: '/blog/why-bookmarks-fail', title: 'Why bookmarks fail for research' },
      ]}
    />
  )
}
