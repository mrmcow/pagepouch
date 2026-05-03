import Link from 'next/link'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { LogoIcon } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { SITE_URL } from '@/lib/site-url'

export type IntentCluster = { title: string; items: string[] }

export type IntentCaptureContentProps = {
  /** Used for JSON-LD @id */
  canonicalPath: string
  eyebrow?: string
  h1: string
  lead: string
  hookQuote: string
  problemTitle: string
  problemBody: string
  clusterTitle: string
  clusters: IntentCluster[]
  solutionTitle: string
  solutionBullets: string[]
  positioningLine: string
  personaBadges: readonly string[]
  primaryCta: { href: string; label: string }
  secondaryCta?: { href: string; label: string }
  relatedReading: readonly { href: string; title: string }[]
}

/**
 * Shared layout for high-intent marketing URLs (/archive-webpage, /osint-tools, …).
 * Server-rendered for SEO; copy should map to search problems, not product jargon alone.
 */
export function IntentCaptureContent({
  canonicalPath,
  eyebrow = 'PageStash',
  h1,
  lead,
  hookQuote,
  problemTitle,
  problemBody,
  clusterTitle,
  clusters,
  solutionTitle,
  solutionBullets,
  positioningLine,
  personaBadges,
  primaryCta,
  secondaryCta,
  relatedReading,
}: IntentCaptureContentProps) {
  const url = `${SITE_URL}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: h1,
        description: lead,
        isPartOf: { '@type': 'WebSite', name: 'PageStash', url: SITE_URL },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <header className="border-b border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl sticky top-0 z-50">
          <div className="pagestash-container px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <Link href="/" className="flex items-center space-x-3 min-w-0">
                <LogoIcon size={32} />
                <span className="text-xl font-bold text-slate-900 dark:text-white truncate">{eyebrow}</span>
              </Link>
              <Link
                href="/"
                className="inline-flex items-center shrink-0 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors font-medium rounded-full px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Home
              </Link>
            </div>
          </div>
        </header>

        <main className="pagestash-container px-4 sm:px-6 py-12 sm:py-16">
          <article className="max-w-3xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">
              {eyebrow}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-5">
              {h1}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8">{lead}</p>

            <blockquote className="border-l-4 border-blue-500 pl-5 pr-4 py-4 my-10 text-lg text-slate-800 dark:text-slate-100 font-medium leading-relaxed bg-slate-50 dark:bg-slate-900/50 rounded-r-xl">
              {hookQuote}
            </blockquote>

            <section className="mb-12">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{problemTitle}</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{problemBody}</p>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{clusterTitle}</h2>
              <div className="space-y-6">
                {clusters.map((c) => (
                  <div
                    key={c.title}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 p-5"
                  >
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{c.title}</h3>
                    <ul className="list-disc pl-5 text-slate-600 dark:text-slate-400 text-sm space-y-1.5">
                      {c.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{solutionTitle}</h2>
              <ul className="space-y-3">
                {solutionBullets.map((b) => (
                  <li key={b} className="flex gap-3 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" aria-hidden />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-slate-700 dark:text-slate-300 font-medium">{positioningLine}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {personaBadges.map((p) => (
                  <span
                    key={p}
                    className="text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </section>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-14">
              <Button asChild size="lg" className="font-semibold">
                <Link href={primaryCta.href}>{primaryCta.label}</Link>
              </Button>
              {secondaryCta ? (
                <Button asChild size="lg" variant="outline">
                  <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                </Button>
              ) : null}
            </div>

            <section className="border-t border-slate-200 dark:border-slate-800 pt-10">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Further reading</h2>
              <ul className="space-y-2">
                {relatedReading.map((r) => (
                  <li key={r.href}>
                    <Link href={r.href} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-sm text-slate-500 dark:text-slate-500">
                Browse all guides on the{' '}
                <Link href="/blog" className="text-blue-600 dark:text-blue-400 hover:underline">
                  PageStash blog
                </Link>
                .
              </p>
            </section>
          </article>
        </main>
      </div>
    </>
  )
}
