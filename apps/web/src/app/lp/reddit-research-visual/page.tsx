import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { LogoWithText } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { SITE_URL } from '@/lib/site-url'
import { buildSignupSearchParams } from '@/lib/utm-signup-href'
import { LpMarketingConnectionGraphMockup } from './mocks/lp-marketing-connection-graph-mockup'
import { LpMarketingExportSectionBody } from './mocks/lp-marketing-export-section-body'
import { LpMarketingFeatureHighlightsRow } from './mocks/lp-marketing-feature-highlights-row'
import {
  LpBrowserLogoDock,
  PAGESTASH_CHROME_WEB_STORE_URL,
  PAGESTASH_FIREFOX_AMO_URL,
} from '@/components/marketing/RedditResearchVisualLpMocks'
import { LpHeroProductShowcase } from './lp-hero-product-showcase'

const PATH = '/lp/reddit-research-visual'
const CANONICAL = `${SITE_URL}${PATH}`

export const metadata: Metadata = {
  title: 'Research archive — portable exports (Markdown, HTML, CSV, JSON, citations)',
  description:
    'Full-page capture, search, and exports for serious research. Official browser extensions on major stores; Tor workflows supported. One searchable library.',
  alternates: { canonical: CANONICAL },
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
  openGraph: {
    title: 'PageStash — exports that travel with your research',
    description:
      'Capture with context, search your archive, export when you need files in your stack. Extensions where researchers already work.',
    url: CANONICAL,
    siteName: 'PageStash',
    type: 'website',
  },
}

const FAQ = [
  {
    q: 'Does my browser choice split my archive?',
    a: 'No. One PageStash account and one library. Install from the store listings you use; when a source only loads in Tor, the same workflow applies — everything lands in the same organized archive.',
  },
  {
    q: 'What if the live page changes after I save it?',
    a: 'That is the point of capturing it. You keep the version you saved — text, layout context, and your notes — instead of hoping the public page still matches your memory.',
  },
  {
    q: 'Can I get my research out if I stop using PageStash?',
    a: 'Yes. Exports are a first-class path: Markdown, HTML, CSV, JSON, and citation-oriented output so your work is not trapped in a single UI.',
  },
  {
    q: 'Is this only for OSINT people?',
    a: 'No. Anyone who needs to preserve online sources — journalists, legal researchers, competitive analysts, policy teams — hits the same problem: links are not archives.',
  },
  {
    q: 'Does PageStash replace formal evidence chain-of-custody tools?',
    a: 'No. It helps you preserve what you saw and organize it for day-to-day research. Formal compliance and legal processes depend on your organization’s rules and tooling.',
  },
] as const

export default function RedditResearchVisualLandingPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const signupQs = buildSignupSearchParams(searchParams, { utm_content: 'AG1AD3B_lp_visual' })
  const signupHref = `/auth/signup?${signupQs}`

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa] text-slate-900 selection:bg-blue-100 selection:text-blue-900 dark:bg-slate-950 dark:text-white dark:selection:bg-blue-950 dark:selection:text-blue-100">
      {/* Mobile conversion bar */}
      <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-200/90 bg-white/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-12px_40px_-12px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95 sm:hidden">
        <div className="pagestash-container flex flex-col gap-1.5 px-4">
          <div className="flex items-stretch gap-2">
            <Button
              className="h-11 flex-1 rounded-xl bg-blue-600 text-[15px] font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-500"
              asChild
            >
              <Link href={signupHref} className="inline-flex items-center justify-center gap-2">
                Sign up free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-11 shrink-0 rounded-xl border-slate-300 px-3 dark:border-white/20" asChild>
              <Link href="/auth/login">Log in</Link>
            </Button>
          </div>
          <p className="flex justify-center gap-3 text-[10px] font-medium text-slate-500">
            <a href={PAGESTASH_CHROME_WEB_STORE_URL} className="text-blue-600 dark:text-blue-400" target="_blank" rel="noopener noreferrer">
              Extension (Chrome)
            </a>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <a href={PAGESTASH_FIREFOX_AMO_URL} className="text-blue-600 dark:text-blue-400" target="_blank" rel="noopener noreferrer">
              Extension (Firefox)
            </a>
          </p>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90">
        <div className="pagestash-container flex items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3">
          <Link href="/" className="inline-flex shrink-0 items-center" aria-label="PageStash home">
            <LogoWithText size={32} clickable={false} textClassName="!text-slate-900 dark:!text-white" />
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button variant="ghost" size="sm" className="hidden rounded-full text-slate-600 sm:inline-flex dark:text-slate-300" asChild>
              <Link href="/auth/login">Log in</Link>
            </Button>
            <Button
              size="sm"
              className="rounded-full bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 sm:px-5"
              asChild
            >
              <Link href={signupHref}>Sign up free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-32 sm:pb-0">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-slate-200/80 dark:border-white/10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:20px_20px]" />
            <div className="absolute -right-20 top-0 h-[min(380px,90vw)] w-[min(380px,90vw)] rounded-full bg-gradient-to-br from-blue-500/20 via-cyan-400/12 to-transparent blur-[100px]" />
            <div className="absolute -left-16 bottom-0 h-[280px] w-[280px] rounded-full bg-gradient-to-tr from-indigo-500/15 to-transparent blur-[90px]" />
          </div>

          <div className="pagestash-container relative z-10 flex flex-col gap-5 px-4 pb-8 pt-6 sm:gap-6 sm:px-6 sm:pb-10 sm:pt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] lg:items-start lg:gap-10 lg:pb-12 lg:pt-10">
            {/* Mobile order: headline → product visual → proof + bullets (desktop: text col 1, visual col 2 spanning rows) */}
            <div className="max-w-xl space-y-3 lg:col-start-1 lg:row-start-1 lg:max-w-none">
              <h1 className="text-[1.65rem] font-bold leading-[1.12] tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-[2.35rem] lg:leading-[1.1]">
                Your archive, in any
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
                  format you need
                </span>
              </h1>
              <p className="text-[14px] leading-relaxed text-slate-600 dark:text-slate-300 sm:hidden">
                Capture full pages, search one library, export as Markdown, HTML, CSV, JSON, or citations — including
                from <span className="font-medium text-slate-800 dark:text-slate-100">Tor</span> via the same Firefox
                extension listing.
              </p>
              <p className="hidden text-[15px] leading-relaxed text-slate-600 dark:text-slate-300 sm:block sm:text-base">
                Markdown, HTML, CSV, JSON, citations — so your research stays portable. One searchable library;{' '}
                <span className="font-medium text-slate-800 dark:text-slate-100">Tor works</span> the same way when
                that session is part of your workflow.
              </p>
            </div>

            <div className="relative w-full lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:mt-0 lg:pt-0.5">
              <LpHeroProductShowcase signupHref={signupHref} className="mx-auto w-full max-w-xl lg:mx-0 lg:max-w-none" />
            </div>

            <div className="max-w-xl space-y-4 lg:col-start-1 lg:row-start-2 lg:max-w-none">
              <LpBrowserLogoDock />

              <ul className="space-y-2 text-[13px] leading-snug text-slate-600 dark:text-slate-400 sm:text-sm">
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500 sm:h-4 sm:w-4" aria-hidden />
                  <span>Full-page capture — screenshot, text, and layout context, not just bookmarks.</span>
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500 sm:h-4 sm:w-4" aria-hidden />
                  <span>Search your archive; export when you need files your stack already accepts.</span>
                </li>
                <li className="hidden gap-2 sm:flex sm:items-start">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" aria-hidden />
                  <span>Sign up, then install from the store — same account everywhere you work.</span>
                </li>
              </ul>

              <div className="hidden flex-col gap-2.5 sm:flex sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  className="h-11 rounded-xl bg-blue-600 px-7 text-[15px] font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 sm:h-12 sm:px-8"
                  asChild
                >
                  <Link href={signupHref} className="inline-flex items-center gap-2">
                    Sign up free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="lg" className="h-11 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white sm:h-12" asChild>
                  <Link href="/#faq">How it works →</Link>
                </Button>
              </div>
              <p className="hidden text-[11px] text-slate-500 sm:block dark:text-slate-500">
                No card for free tier · Pro from $11/mo —{' '}
                <Link href="/" className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400">
                  pricing
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* Exports */}
        <section className="relative overflow-hidden border-b border-white/5 bg-[#020617] py-8 text-white sm:py-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.12),transparent_45%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.035)_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="pagestash-container relative z-10 px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-none lg:text-left">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-200/85">Exports</p>
              <h2 className="mt-1 text-lg font-bold tracking-tight sm:text-xl">Take clips out as files your stack already uses</h2>
            </div>
            <div className="mt-5 sm:mt-6">
              <LpMarketingExportSectionBody compact density="compact" signupHref={signupHref} />
            </div>
            <p className="mx-auto mt-5 max-w-lg text-center text-[12px] leading-relaxed text-slate-400 sm:text-left lg:mx-0">
              After signup, install the extension from your store listing — same account, same library.
            </p>
            <div className="mx-auto mt-6 hidden max-w-xs sm:block lg:mx-0">
              <Button className="h-11 w-full rounded-xl bg-white font-semibold text-slate-950 hover:bg-slate-100 lg:w-auto lg:px-10" asChild>
                <Link href={signupHref}>Sign up free</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Capture row */}
        <section className="border-b border-slate-200/80 bg-[#fafafa] py-8 dark:border-white/10 dark:bg-slate-900/30 sm:py-10">
          <div className="pagestash-container px-4 sm:px-6">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Capture · search · organize
            </p>
            <LpMarketingFeatureHighlightsRow density="compact" className="mt-5" />
          </div>
        </section>

        {/* Graph */}
        <section className="border-b border-slate-200/80 bg-white py-8 dark:border-white/10 dark:bg-slate-950 sm:py-10">
          <div className="pagestash-container px-4 text-center sm:px-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">Page Graph (Pro)</h2>
            <p className="mx-auto mt-1 max-w-md text-[12px] text-slate-500 dark:text-slate-400 sm:text-sm">
              Same connection-map preview as the homepage — illustrative, not your data.
            </p>
            <div className="mx-auto mt-5 max-w-md sm:max-w-lg">
              <LpMarketingConnectionGraphMockup density="compact" />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="pagestash-container border-b border-slate-200/80 px-4 py-8 dark:border-white/10 sm:px-6 sm:py-10">
          <h2 className="text-center text-base font-bold text-slate-900 dark:text-white sm:text-lg">Questions</h2>
          <div className="mx-auto mt-5 max-w-xl divide-y divide-slate-200 dark:divide-white/10">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group py-3.5 sm:py-4">
                <summary className="cursor-pointer list-none text-left text-[13px] font-semibold text-slate-900 marker:content-none dark:text-white sm:text-sm [&::-webkit-details-marker]:hidden">
                  <span className="flex items-start justify-between gap-3">
                    <span className="leading-snug">{q}</span>
                    <span className="shrink-0 text-slate-400 transition group-open:rotate-180">▼</span>
                  </span>
                </summary>
                <p className="mt-2 text-[12px] leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA desktop */}
        <section className="border-t border-slate-200/80 bg-gradient-to-b from-slate-50 to-white py-10 dark:border-white/10 dark:from-slate-900/40 dark:to-slate-950 sm:py-12">
          <div className="pagestash-container px-4 text-center sm:px-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">Ready to archive the next important page?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
              Free tier to try capture, search, and exports. Install from the store once you have an account.
            </p>
            <div className="mt-6 hidden flex-col items-center justify-center gap-3 sm:flex sm:flex-row">
              <Button
                size="lg"
                className="h-12 rounded-xl bg-blue-600 px-10 text-base font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
                asChild
              >
                <Link href={signupHref} className="inline-flex items-center gap-2">
                  Sign up free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 rounded-xl border-slate-300 px-6 dark:border-white/20" asChild>
                <a href={PAGESTASH_CHROME_WEB_STORE_URL} target="_blank" rel="noopener noreferrer">
                  Chrome Web Store
                </a>
              </Button>
              <Button variant="outline" size="lg" className="h-12 rounded-xl border-slate-300 px-6 dark:border-white/20" asChild>
                <a href={PAGESTASH_FIREFOX_AMO_URL} target="_blank" rel="noopener noreferrer">
                  Firefox Add-ons
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/80 py-5 text-center text-[11px] text-slate-500 dark:border-white/10 dark:text-slate-500 sm:py-6 sm:text-xs">
        <div className="pagestash-container flex flex-col items-center justify-center gap-2 px-4 sm:flex-row sm:gap-5">
          <span>© {new Date().getFullYear()} PageStash</span>
          <span className="hidden h-3 w-px bg-slate-300 sm:inline dark:bg-slate-600" />
          <Link href="/privacy" className="hover:text-slate-800 dark:hover:text-slate-300">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-slate-800 dark:hover:text-slate-300">
            Terms
          </Link>
          <Link href="/" className="hover:text-slate-800 dark:hover:text-slate-300">
            Main site
          </Link>
        </div>
      </footer>
    </div>
  )
}
