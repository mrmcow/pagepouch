'use client'

import Link from 'next/link'
import { LayoutDashboard, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MarketingDashboardMockup } from '@/components/marketing/HomepageMarketingVisuals'
import { cn } from '@/lib/utils'

type Props = {
  signupHref: string
  className?: string
}

/**
 * Framed “real product” hero visual for paid LPs: clear expectation + primary CTA,
 * single client import of MarketingDashboardMockup (RSC-safe).
 */
export function LpHeroProductShowcase({ signupHref, className }: Props) {
  return (
    <div className={cn('w-full', className)}>
      <div className="mb-3 flex flex-row items-start justify-between gap-3 sm:mb-5 sm:items-end sm:gap-6">
        <div className="min-w-0 flex-1 space-y-1.5 text-left sm:space-y-2">
          <div className="inline-flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 ring-1 ring-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400 dark:ring-blue-400/25 sm:h-8 sm:w-8 sm:rounded-xl">
              <LayoutDashboard className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 sm:text-[11px] sm:tracking-[0.2em]">
              Your workspace
            </span>
          </div>
          <p className="max-w-md text-[13px] font-medium leading-snug text-slate-800 dark:text-slate-100 sm:text-[15px] sm:leading-relaxed">
            Library view after sign-up — tap a clip for the reader preview (sample pages).
          </p>
          <p className="hidden max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:block">
            Same product as pagestash.app; illustrative sample data only.
          </p>
        </div>
        <div className="flex shrink-0 pt-0.5 sm:justify-end sm:pt-0">
          <Button
            size="sm"
            className="h-9 rounded-lg bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-500 sm:h-10 sm:rounded-xl sm:px-5 sm:text-sm sm:shadow-lg sm:shadow-blue-600/25"
            asChild
          >
            <Link href={signupHref} className="inline-flex items-center gap-1.5 sm:gap-2">
              Start free
              <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>

      <div
        className={cn(
          'relative isolate overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white via-slate-50/80 to-slate-100/90 p-1 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.55)] ring-1 ring-slate-900/[0.04] dark:border-white/10 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 dark:shadow-[0_28px_90px_-36px_rgba(0,0,0,0.75)] dark:ring-white/[0.06]',
          'sm:rounded-[1.35rem] sm:p-1.5',
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -left-1/4 top-0 h-40 w-[150%] bg-gradient-to-r from-transparent via-blue-400/12 to-transparent blur-2xl dark:via-blue-500/10"
        />
        <div className="relative overflow-hidden rounded-[14px] border border-slate-200/60 bg-white dark:border-white/10 dark:bg-slate-950 sm:rounded-[1.15rem]">
          <MarketingDashboardMockup
            density="compact"
            showAmbientGlow={false}
            embeddedInFrame
            clipCardsVariant="product"
            className="mx-0 max-w-none"
          />
        </div>
      </div>

      <p className="mt-2 hidden text-[11px] leading-snug text-slate-500 dark:text-slate-500 sm:mt-3 sm:block sm:text-left">
        <span className="font-medium text-slate-600 dark:text-slate-400">Next:</span> install from the store — saves appear here.
      </p>
    </div>
  )
}
