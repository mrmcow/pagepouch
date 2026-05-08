'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useStripeCheckout, type CheckoutPlan } from '@/lib/use-stripe-checkout'
import { ProBillingChoicePanel } from '@/components/dashboard/ProBillingChoicePanel'
import { cn } from '@/lib/utils'

interface UpgradeCardProps {
  className?: string
  /** Optional tagline to override the default. */
  tagline?: string
  /** Optional override for the primary headline. */
  title?: string
  /** Where the CTA is rendered — used for Stripe session metadata / analytics later. */
  source?: string
}

const DEFAULT_TAGLINE = '1,000 clips/mo · 5 GB storage'

export function UpgradeCard({
  className,
  tagline = DEFAULT_TAGLINE,
  title = 'Upgrade to Pro',
  source = 'upgrade-card',
}: UpgradeCardProps) {
  const { startCheckout, isLoading } = useStripeCheckout({ source })
  const [pickerOpen, setPickerOpen] = useState(false)
  const [plan, setPlan] = useState<CheckoutPlan>('annual')

  return (
    <>
      <Card
        className={cn(
          'border border-blue-200/70 dark:border-blue-500/20 shadow-sm bg-gradient-to-br from-blue-50/60 to-indigo-50/40 dark:from-blue-950/20 dark:to-indigo-950/10',
          className
        )}
      >
        <CardContent className="p-4 space-y-3">
          <div>
            <p className="text-[13px] font-semibold text-slate-900 dark:text-white leading-tight">
              {title}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {tagline}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            disabled={isLoading}
            className="w-full rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 text-white py-2 px-3 text-[13px] font-semibold transition-all flex flex-col items-center leading-tight"
          >
            <span>{isLoading ? 'Redirecting…' : 'Go Pro'}</span>
            <span className="text-[10px] font-medium opacity-80">Monthly or annual · you choose</span>
          </button>
        </CardContent>
      </Card>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose billing</DialogTitle>
            <DialogDescription>
              Same Pro plan — export, Page Graphs, and 1,000 clips/mo. Pick how often you want to be charged.
            </DialogDescription>
          </DialogHeader>
          <ProBillingChoicePanel
            selected={plan}
            onSelectedChange={setPlan}
            onContinue={() => void startCheckout(plan)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
