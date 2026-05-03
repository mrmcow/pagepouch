import type { Metadata } from 'next'
import { IntentCaptureContent } from '@/components/marketing/IntentCaptureContent'
import { SITE_URL } from '@/lib/site-url'

const path = '/save-webpage-as-pdf-alternative'

export const metadata: Metadata = {
  title: 'Save Webpage as PDF? A Better Alternative for Research & Evidence',
  description:
    'PDF exports strip interactivity and are painful to search across projects. PageStash is a save-webpage-as-PDF alternative: HTML + screenshot + full-text search.',
  alternates: { canonical: `${SITE_URL}${path}` },
  openGraph: {
    title: 'Save webpage as PDF — alternative for analysts',
    description:
      'Keep proof, formatting, and search. Built for research and investigations.',
    url: `${SITE_URL}${path}`,
    type: 'article',
  },
}

export default function SaveWebpagePdfAlternativePage() {
  return (
    <IntentCaptureContent
      canonicalPath={path}
      h1="Save webpage as PDF — or capture proof you can actually use"
      lead="“Print to PDF” is fine for a one-off handout. It is a poor **system** for research: filenames rot, text is not reliably searchable, and dynamic pages break. People search **save webpage with formatting** and **save webpage permanently** because they need **trust**."
      hookQuote="If you have ever lost a critical webpage, screenshot, or source while researching — this fixes that. PageStash stores structured captures you can search and export — not a folder of mystery PDFs."
      problemTitle="What PDFs are missing"
      problemBody="PDFs often lose responsive layout, hide important tables, and detach from the **URL + timestamp** story you need for audits. For teams, they are also hard to standardize and de-duplicate."
      clusterTitle="Intent: PDF alternative + durable capture"
      clusters={[
        {
          title: 'Queries this page speaks to',
          items: [
            'save webpage as pdf alternative',
            'save webpage with formatting',
            'save webpage permanently',
            'website archiver tool',
            'archive webpage for compliance',
          ],
        },
      ]}
      solutionTitle="What PageStash does differently"
      solutionBullets={[
        'Keeps **HTML + extracted text + screenshot** so you can search inside captures.',
        'Preserves **source URL** and capture context for reporting.',
        'Still supports workflows where you export — without PDF being your only memory.',
        'Works from the browser where the page **actually renders** (including many authenticated views).',
      ]}
      positioningLine="Used by analysts, researchers, and investigators who need a source library — not a pile of exports."
      personaBadges={['Analysts', 'Legal-adjacent', 'Researchers', 'Consultants']}
      primaryCta={{ href: '/auth/signup', label: 'Try PageStash free' }}
      secondaryCta={{ href: '/blog/save-webpage-as-pdf-vs-full-web-archive', label: 'Read: PDF vs full web archive' }}
      relatedReading={[
        { href: '/blog/save-webpage-as-pdf-vs-full-web-archive', title: 'Save webpage as PDF vs full web archive' },
        { href: '/blog/read-later-vs-permanent-web-archive', title: 'Read later vs permanent archive' },
        { href: '/blog/how-to-preserve-web-pages', title: 'How to preserve web pages' },
      ]}
    />
  )
}
