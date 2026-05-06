import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  FileJson,
  FileText,
  FolderOpen,
  Search,
  Shield,
  Table,
  Quote,
} from 'lucide-react'
import { LogoWithText } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { SITE_URL } from '@/lib/site-url'
import { buildSignupSearchParams } from '@/lib/utm-signup-href'

const PATH = '/lp/reddit-research'
const CANONICAL = `${SITE_URL}${PATH}`

export const metadata: Metadata = {
  title: 'Export your research archive — Markdown, HTML, CSV, JSON',
  description:
    'Capture full pages before they change. Export clips as Markdown, HTML, CSV, JSON, or citations. Portable research archive for OSINT and investigations — works with Tor.',
  alternates: { canonical: CANONICAL },
  /** Paid lander: avoid competing with homepage / blog in organic search. */
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
  openGraph: {
    title: 'PageStash — portable research exports',
    description:
      'Full-page capture, searchable archive, and exports you can move. Built for analysts and investigators.',
    url: CANONICAL,
    siteName: 'PageStash',
    type: 'website',
  },
}

const FORMATS = [
  { label: 'Markdown', icon: FileText },
  { label: 'HTML', icon: FileText },
  { label: 'CSV', icon: Table },
  { label: 'JSON', icon: FileJson },
  { label: 'Citations', icon: Quote },
] as const

export default function RedditResearchLandingPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const signupQs = buildSignupSearchParams(searchParams)
  const signupHref = `/auth/signup?${signupQs}`

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 dark:bg-slate-950 dark:text-white dark:selection:bg-blue-950 dark:selection:text-blue-100">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90">
        <div className="pagestash-container flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="inline-flex shrink-0 items-center" aria-label="PageStash home">
            <LogoWithText size={34} clickable={false} textClassName="!text-slate-900 dark:!text-white" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="sm" className="hidden rounded-full sm:inline-flex" asChild>
              <Link href="/auth/login">Log in</Link>
            </Button>
            <Button
              size="sm"
              className="rounded-full bg-slate-900 px-5 font-semibold text-white shadow-md hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              asChild
            >
              <Link href={signupHref}>Sign up free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero — message-match AG1_AD3B + export cluster */}
        <section className="relative overflow-hidden border-b border-slate-200 dark:border-white/10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute -right-24 top-0 h-[420px] w-[420px] bg-gradient-to-br from-blue-500/25 via-cyan-500/15 to-transparent blur-[120px] sm:block" />
            <div className="absolute -left-24 bottom-0 h-[380px] w-[380px] bg-gradient-to-tr from-indigo-500/20 to-transparent blur-[100px] sm:block" />
          </div>

          <div className="pagestash-container relative z-10 px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-white/15 dark:bg-slate-900/70 dark:text-slate-300">
              Reddit · OSINT &amp; research
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Your archive,{' '}
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
                in any format you need
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-300 sm:text-xl">
              Export clips as Markdown, HTML, CSV, JSON, or citations — so your research stays portable. Capture
              includes screenshots, page text, and context. It works in normal browsing and when you use Tor for
              sensitive sources.
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-blue-500" />
                Full-page capture, not just a pointer
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-blue-500" />
                Search inside what you saved
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-blue-500" />
                Free tier to try before you commit
              </li>
            </ul>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="h-12 rounded-xl bg-slate-900 px-8 text-base font-semibold text-white shadow-lg hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                asChild
              >
                <Link href={signupHref} className="inline-flex items-center gap-2">
                  Sign up free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 rounded-xl border-slate-300 dark:border-white/20" asChild>
                <Link href="/#faq">How it works on the main site</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">
              No credit card for the free tier. Pro is $11/mo with 1,000 captures — see{' '}
              <Link href="/" className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400">
                full pricing on the main site
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Export formats — direct echo of ad promise */}
        <section className="border-b border-slate-200 bg-slate-50 py-12 dark:border-white/10 dark:bg-slate-900/40">
          <div className="pagestash-container px-4 sm:px-6">
            <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Exports that stay yours
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600 dark:text-slate-300">
              Pull your captures out when you need them in another tool, a memo, or a downstream workflow — without
              rewriting everything by hand.
            </p>
            <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-3">
              {FORMATS.map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium shadow-sm dark:border-white/10 dark:bg-slate-950"
                >
                  <Icon className="h-4 w-4 text-blue-500" aria-hidden />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why + how — slightly negative framing (winning pattern) */}
        <section className="pagestash-container px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Pages change. Your link does not prove what you saw.</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              A URL can update quietly, move behind a login, or vanish. PageStash keeps the version you captured — with
              notes, tags, and folders — so you can return to the same evidence later.
            </p>
          </div>
          <div className="mx-auto mt-14 grid max-w-5xl gap-8 sm:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Capture in the browser',
                body: 'One click from Chrome or Firefox while the page still looks the way you need it.',
                icon: FolderOpen,
              },
              {
                step: '2',
                title: 'Organize and search',
                body: 'Folders, tags, and full-text search across captures — not a scattered screenshot folder.',
                icon: Search,
              },
              {
                step: '3',
                title: 'Export on your terms',
                body: 'Markdown, HTML, CSV, JSON, or citation-friendly output when you need to hand work off.',
                icon: FileJson,
              },
            ].map(({ step, title, body, icon: Icon }) => (
              <div
                key={step}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900/50"
              >
                <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-white dark:text-slate-900">
                  {step}
                </span>
                <Icon className="mb-3 h-6 w-6 text-blue-500" aria-hidden />
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tor + trust — factual, no hype */}
        <section className="bg-[#020617] py-16 text-white sm:py-20">
          <div className="pagestash-container relative z-10 px-4 sm:px-6">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),transparent_55%)]" />
            <div className="mx-auto max-w-3xl">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Works with Tor when your workflow requires it</h2>
              <p className="mt-4 text-slate-300">
                Many teams capture sensitive sources in Tor Browser. PageStash is built for serious research workflows —
                including saving pages from the session where you actually viewed them — without vague security claims.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-slate-300">
                <li className="flex gap-3">
                  <Shield className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" aria-hidden />
                  <span>Encryption in transit and at rest — practical protection for a research archive, not theater.</span>
                </li>
                <li className="flex gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" aria-hidden />
                  <span>Designed so exports and organization reduce lock-in anxiety, not increase it.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ — grounded in brief objections */}
        <section className="pagestash-container border-t border-slate-200 px-4 py-16 dark:border-white/10 sm:px-6 sm:py-20">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Straight answers</h2>
          <div className="mx-auto mt-10 max-w-3xl divide-y divide-slate-200 dark:divide-white/10">
            {[
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
                q: 'Will this replace my notes app?',
                a: 'No. PageStash is the capture and archive layer so your notes and memos can point at reliable sources instead of brittle URLs.',
              },
              {
                q: 'Does PageStash replace formal evidence chain-of-custody tools?',
                a: 'No. It helps you preserve what you saw and organize it for day-to-day research. Formal compliance and legal processes depend on your organization’s rules and tooling.',
              },
            ].map(({ q, a }) => (
              <details key={q} className="group py-5">
                <summary className="cursor-pointer list-none font-semibold text-slate-900 marker:content-none dark:text-white [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {q}
                    <span className="text-slate-400 transition group-open:rotate-180">▼</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-slate-200 bg-gradient-to-b from-slate-50 to-white py-16 dark:border-white/10 dark:from-slate-900/50 dark:to-slate-950">
          <div className="pagestash-container px-4 text-center sm:px-6">
            <h2 className="text-2xl font-bold sm:text-3xl">Turn the next important page into a permanent record</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-400">
              Start free, capture a few sources, and try an export. If it fits your workflow, upgrade when volume
              grows.
            </p>
            <Button
              size="lg"
              className="mt-8 h-12 rounded-xl bg-blue-600 px-10 text-base font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500"
              asChild
            >
              <Link href={signupHref} className="inline-flex items-center gap-2">
                Sign up free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-500">
        <div className="pagestash-container flex flex-col items-center justify-center gap-3 px-4 sm:flex-row sm:gap-6">
          <span>© {new Date().getFullYear()} PageStash</span>
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
