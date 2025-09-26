import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe with publishable key
export const getStripe = () => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
  }
  
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
}

// Stripe price IDs (these will be set after creating products in Stripe)
export const STRIPE_PRICE_IDS = {
  proMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || '',
  proAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL || '',
} as const

// Helper function to create checkout session
export async function createCheckoutSession(plan: 'monthly' | 'annual') {
  const priceId = plan === 'monthly' ? STRIPE_PRICE_IDS.proMonthly : STRIPE_PRICE_IDS.proAnnual
  
  if (!priceId) {
    throw new Error(`Price ID not configured for ${plan} plan`)
  }

  const response = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      priceId,
      plan,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create checkout session')
  }

  return response.json()
}

// Helper function to redirect to customer portal
export async function redirectToCustomerPortal() {
  const response = await fetch('/api/stripe/portal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create portal session')
  }

  const { url } = await response.json()
  window.location.href = url
}

// Helper function to get subscription status
export async function getSubscriptionStatus() {
  const response = await fetch('/api/subscription')

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch subscription')
  }

  return response.json()
}
