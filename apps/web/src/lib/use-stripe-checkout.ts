'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/toast'

// Resolved at build time from env. We intentionally do NOT hard-code fallback
// price IDs here — a stale fallback (e.g. a one-time price) silently sends an
// invalid request to Stripe and surfaces as an opaque 500. If an env var is
// missing we want to fail loudly with a clear error instead.
const MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY
const ANNUAL_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL

export type CheckoutPlan = 'monthly' | 'annual'

export interface UseStripeCheckoutOptions {
  /** Optional surface label, sent to /api/stripe/checkout for analytics. */
  source?: string
}

/**
 * Shared Pro upgrade checkout helper.
 *
 * Centralises the Stripe price IDs, the POST to /api/stripe/checkout,
 * the loading state, and the toast on error. All upgrade CTAs (sidebar
 * UpgradeCard, ExportUpgradeModal, KnowledgeGraphUpgradeModal, future
 * surfaces) should use this hook.
 */
export function useStripeCheckout({ source }: UseStripeCheckoutOptions = {}) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const startCheckout = async (plan: CheckoutPlan) => {
    if (isLoading) return

    const priceId = plan === 'annual' ? ANNUAL_PRICE_ID : MONTHLY_PRICE_ID
    if (!priceId) {
      const envName =
        plan === 'annual'
          ? 'NEXT_PUBLIC_STRIPE_PRICE_ANNUAL'
          : 'NEXT_PUBLIC_STRIPE_PRICE_MONTHLY'
      console.error(`Upgrade error: ${envName} is not set`)
      toast({
        message: 'Checkout is not configured. Please contact support.',
        type: 'error',
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, plan, source }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data?.url) {
        throw new Error(data?.error || 'Checkout failed')
      }
      window.location.href = data.url
    } catch (error) {
      console.error('Upgrade error:', error)
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Upgrade failed. Please try again.'
      toast({ message, type: 'error' })
      setIsLoading(false)
    }
  }

  return { startCheckout, isLoading }
}
