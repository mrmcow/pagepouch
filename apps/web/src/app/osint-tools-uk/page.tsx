import type { Metadata } from 'next'
import { IntentCaptureContent } from '@/components/marketing/IntentCaptureContent'
import { SITE_URL } from '@/lib/site-url'

const path = '/osint-tools-uk'

export const metadata: Metadata = {
  title: 'OSINT Tools UK — Capture, Archive & Search Web Evidence (2026)',
  description:
    'High-intent geo page for UK researchers: OSINT capture workflow, lawful sourcing, and PageStash as a durable archive layer alongside UK-focused investigations.',
  alternates: { canonical: `${SITE_URL}${path}` },
  openGraph: {
    title: 'OSINT tools UK — web evidence archive',
    description: 'Built for analysts who need searchable archives, not brittle bookmarks.',
    url: `${SITE_URL}${path}`,
    type: 'article',
  },
}

export default function OsintToolsUkPage() {
  return (
    <IntentCaptureContent
      canonicalPath={path}
      h1="OSINT tools (UK): build a capture stack that respects law and logistics"
      lead="UK teams often combine **news**, **Companies House**, **court lists**, and **local forums**. The failure mode is never “finding the first link” — it is **proving what was public** when you saw it. That is why analysts search **OSINT tools UK** alongside **save evidence from websites**."
      hookQuote="If you have ever lost a critical webpage, screenshot, or source while researching — this fixes that. PageStash is used by analysts and researchers who need durable web memory with full-text search."
      problemTitle="Geo-specific reality: sources move fast"
      problemBody="UK reporting cycles (policy shifts, corporate filings, regional press) can update overnight. Your stack should assume **change** and optimize for **retrieval** under scrutiny — without mixing personal data into public-source archives."
      clusterTitle="What UK-focused teams typically need"
      clusters={[
        {
          title: 'Capture + provenance',
          items: [
            'Timestamped full-page capture (screenshot + HTML + text)',
            'Searchable library across matters',
            'Exports suitable for review packs',
          ],
        },
        {
          title: 'Operational hygiene',
          items: [
            'Clear retention rules per project',
            'Separation of “public page capture” vs sensitive internal notes',
            'Consistent naming for hearings, companies, and incidents',
          ],
        },
      ]}
      solutionTitle="PageStash as the UK-friendly archive layer"
      solutionBullets={[
        'Browser-based capture from **Chrome and Firefox** — capture what renders for you.',
        '**Folders and tags** aligned to matters: regulators, corporates, individuals (where appropriate).',
        '**Full-text search** to find a sentence inside a saved page months later.',
        'Works alongside databases, spreadsheets, and notebooks — PageStash is not a replacement for your entire OSINT stack.',
      ]}
      positioningLine="PageStash helps researchers capture full-page web context, metadata, notes, and searchable source history."
      personaBadges={['UK analysts', 'Investigators', 'Journalists', 'Researchers']}
      primaryCta={{ href: '/auth/signup', label: 'Start free — 10 clips / month' }}
      secondaryCta={{ href: '/osint-tools', label: 'Generic OSINT tools hub' }}
      relatedReading={[
        { href: '/blog/osint-web-archival-tools-investigators', title: 'OSINT web archival tools' },
        { href: '/blog/legal-teams-web-page-preservation-primer', title: 'Legal teams: web preservation primer' },
        { href: '/blog/journalist-guide-web-research', title: 'Journalist guide to web research' },
      ]}
    />
  )
}
