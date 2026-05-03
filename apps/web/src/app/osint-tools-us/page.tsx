import type { Metadata } from 'next'
import { IntentCaptureContent } from '@/components/marketing/IntentCaptureContent'
import { SITE_URL } from '@/lib/site-url'

const path = '/osint-tools-us'

export const metadata: Metadata = {
  title: 'OSINT Tools US — Web Evidence Capture for Analysts (2026)',
  description:
    'US-focused OSINT capture page: preserve public web sources, organize findings, and search your archive. PageStash complements databases, alerts, and notebooks.',
  alternates: { canonical: `${SITE_URL}${path}` },
  openGraph: {
    title: 'OSINT tools US — archive web sources you can search',
    description: 'Used by analysts who cannot afford link rot.',
    url: `${SITE_URL}${path}`,
    type: 'article',
  },
}

export default function OsintToolsUsPage() {
  return (
    <IntentCaptureContent
      canonicalPath={path}
      h1="OSINT tools (US): preserve what the open web showed — before it changes"
      lead="US investigations pull from **SEC filings**, **state registers**, **local news**, **federal dockets**, and **vendor changelogs**. Analysts search **OSINT tools US** because procurement, ethics, and retention rules differ — but the technical need is universal: **defensible capture**."
      hookQuote="If you have ever lost a critical webpage, screenshot, or source while researching — this fixes that. PageStash stores searchable full-page archives so your team can reconstruct sources months later."
      problemTitle="The US workflow bottleneck is handoff"
      problemBody="Distributed teams lose time when captures are scattered across drives, chats, and personal screenshots. A shared **archive with search** reduces “can you resend that link?” loops."
      clusterTitle="US analyst intent cluster"
      clusters={[
        {
          title: 'Common search intents',
          items: [
            'OSINT tools list',
            'save evidence from websites',
            'investigation workflow tools',
            'tools for threat intelligence analysts',
            'archive webpage for investigations',
          ],
        },
      ]}
      solutionTitle="Where PageStash fits"
      solutionBullets={[
        '**Full capture** for dynamic pages where PDF export lies.',
        '**Full-text search** across your team’s saved pages (with sensible access hygiene).',
        '**Page Graphs** when many entities connect across sources.',
        'Exports for memos, slide decks, and incident timelines.',
      ]}
      positioningLine="Used by analysts, researchers, and investigators — PageStash is research infrastructure, not a toy bookmark button."
      personaBadges={['US analysts', 'Threat intel', 'Investigators', 'Researchers']}
      primaryCta={{ href: '/auth/signup', label: 'Start capturing' }}
      secondaryCta={{ href: '/osint-tools', label: 'OSINT tools hub' }}
      relatedReading={[
        { href: '/blog/threat-intelligence-soc-workflow-web-clipping', title: 'Threat intelligence SOC workflow' },
        { href: '/blog/internet-investigation-tools-open-source-research', title: 'Internet investigation tools' },
        { href: '/blog/web-evidence-preservation-legal-standards-corporate-investigators', title: 'Web evidence preservation (corporate)' },
      ]}
    />
  )
}
