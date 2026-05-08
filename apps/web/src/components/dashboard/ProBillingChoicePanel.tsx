'use client'

import { Loader2 } from 'lucide-react'
import { SUBSCRIPTION_TIERS } from '@pagestash/shared'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { CheckoutPlan } from '@/lib/use-stripe-checkout'

/** Matches marketing: Pro billed annually at $10/mo ($120/yr). */
const ANNUAL_PER_MONTH_USD = 10
const ANNUAL_BILLED_YEAR_USD = ANNUAL_PER_MONTH_USD * 12

export function proAnnualSavingsPercent(): number {
  const monthlyUsd = SUBSCRIPTION_TIERS.PRO.price_monthly as number
  const ifMonthlyYear = monthlyUsd * 12
  return Math.round(((ifMonthlyYear - ANNUAL_BILLED_YEAR_USD) / ifMonthlyYear) * 100)
}

type ProBillingChoicePanelProps = {
  className?: string
  selected: CheckoutPlan
  onSelectedChange: (plan: CheckoutPlan) => void
  onContinue: () => void
  isLoading: boolean
  continueLabel?: string
  continueButtonClassName?: string
}

export function ProBillingChoicePanel({
  className,
  selected,
  onSelectedChange,
  onContinue,
  isLoading,
  continueLabel = 'Continue to secure checkout',
  continueButtonClassName,
}: ProBillingChoicePanelProps) {
  const monthlyUsd = SUBSCRIPTION_TIERS.PRO.price_monthly as number
  const savingsPct = proAnnualSavingsPercent()

  return (
    <div className={cn('space-y-3', className)}>
      <Tabs
        value={selected}
        onValueChange={(v) => {
          if (v === 'monthly' || v === 'annual') onSelectedChange(v)
        }}
        className="w-full"
      >
        <TabsList className="grid h-10 w-full grid-cols-2 p-1">
          <TabsTrigger value="annual" className="text-xs font-semibold sm:text-sm">
            Annual (save {savingsPct}%)
          </TabsTrigger>
          <TabsTrigger value="monthly" className="text-xs font-semibold sm:text-sm">
            Monthly
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div
        className={cn(
          'rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-center text-[13px] leading-snug text-slate-700 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-200',
        )}
      >
        {selected === 'annual' ? (
          <>
            <span className="font-semibold text-slate-900 dark:text-white">${ANNUAL_PER_MONTH_USD}/mo</span>
            <span className="text-slate-600 dark:text-slate-400"> when paid annually · </span>
            <span className="font-medium">${ANNUAL_BILLED_YEAR_USD}/yr today</span>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              vs ${monthlyUsd}/mo × 12 — you save ${monthlyUsd * 12 - ANNUAL_BILLED_YEAR_USD}/yr
            </span>
          </>
        ) : (
          <>
            <span className="font-semibold text-slate-900 dark:text-white">${monthlyUsd}/mo</span>
            <span className="text-slate-600 dark:text-slate-400"> billed every month</span>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Same Pro features — switch to annual anytime from billing
            </span>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={isLoading}
        className={cn(
          'w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 flex flex-col items-center justify-center leading-tight',
          continueButtonClassName,
        )}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
            Redirecting…
          </span>
        ) : (
          continueLabel
        )}
      </button>
    </div>
  )
}
