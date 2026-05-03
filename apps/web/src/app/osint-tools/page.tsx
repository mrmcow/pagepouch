import type { Metadata } from 'next'
import { IntentCaptureContent } from '@/components/marketing/IntentCaptureContent'
import { SITE_URL } from '@/lib/site-url'

const path = '/osint-tools'

export const metadata: Metadata = {
  title: 'OSINT Tools for Capturing and Organizing Web Evidence',
  description:
    'OSINT tools list angle: discovery is easy — preservation is hard. PageStash helps analysts save webpages as evidence with search, folders, and Page Graphs.',
  alternates: { canonical: `${SITE_URL}${path}` },
  openGraph: {
    title: 'OSINT tools — capture & organize web evidence',
    description:
      'Used by analysts and investigators who need durable captures, not brittle bookmarks.',
    url: `${SITE_URL}${path}`,
    type: 'article',
  },
}

export default function OsintToolsIntentPage() {
  return (
    <IntentCaptureContent
      canonicalPath={path}
      h1="OSINT tools: capture web evidence you can defend later"
      lead="Open-source intelligence is not “collecting links.” It is building a **case file** that survives edits, deletions, and time. That is why teams search **OSINT tools list**, **save evidence from websites**, and **investigation workflow tools** — not “bookmark manager.”"
      hookQuote="If you have ever lost a critical webpage, screenshot, or source while researching — this fixes that. PageStash is built for workflows where a missing source is unacceptable."
      problemTitle="Screenshots alone are not a system"
      problemBody="Screenshots are fast — and fragile. They are hard to search, easy to misfile, and painful to hand off. OSINT workflows need **searchable archives**, consistent metadata, and exports that do not leak unrelated desktop chrome."
      clusterTitle="Keyword cluster: OSINT / investigation"
      clusters={[
        {
          title: 'Queries this page supports',
          items: [
            'OSINT tools list',
            'tools for threat intelligence analysts',
            'save evidence from websites',
            'investigation workflow tools',
            'OSINT workflow capture',
          ],
        },
      ]}
      solutionTitle="Where PageStash fits in the stack"
      solutionBullets={[
        'Capture **full pages** (not just article text) when claims live in tables, footers, or dynamic UI.',
        'Organize by **matter** with folders + tags; add a one-line “why this matters” note at capture time.',
        'Use **Page Graphs** when relationships between entities span many sources.',
        'Pair with your existing OSINT databases — PageStash is the **preservation + retrieval** layer.',
      ]}
      positioningLine="Think of PageStash as research infrastructure for analysts: durable web memory you control."
      personaBadges={['OSINT analysts', 'Threat intel', 'Investigators', 'Journalists']}
      primaryCta={{ href: '/auth/signup', label: 'Start capturing evidence' }}
      secondaryCta={{ href: '/blog/osint-web-archival-tools-investigators', label: 'Read: OSINT web archival tools' }}
      relatedReading={[
        { href: '/blog/internet-investigation-tools-open-source-research', title: 'Internet investigation tools' },
        { href: '/blog/osint-beginners-page-capture-checklist-2026', title: 'OSINT capture checklist (2026)' },
        { href: '/blog/capture-evidence-from-web-osint', title: 'Capture evidence from the web (OSINT)' },
      ]}
    />
  )
}
