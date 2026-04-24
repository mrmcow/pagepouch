'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useStripeCheckout } from '@/lib/use-stripe-checkout'
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

  return (
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
          onClick={() => startCheckout('annual')}
          disabled={isLoading}
          className="w-full rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 text-white py-2 px-3 text-[13px] font-semibold transition-all flex flex-col items-center leading-tight"
        >
          <span>{isLoading ? 'Redirecting…' : 'Go Pro — $10/mo'}</span>
          <span className="text-[10px] font-medium opacity-80">billed annually · save 17%</span>
        </button>
      </CardContent>
    </Card>
  )
}
