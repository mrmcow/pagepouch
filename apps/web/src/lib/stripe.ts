import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
})

// Stripe product and price configuration
export const STRIPE_CONFIG = {
  products: {
    pro: {
      name: 'PagePouch Pro',
      description: '1,000 clips per month, 5GB storage, advanced features',
    }
  },
  prices: {
    proMonthly: {
      amount: 400, // $4.00 in cents
      currency: 'usd',
      interval: 'month',
      nickname: 'Pro Monthly',
    },
    proAnnual: {
      amount: 4000, // $40.00 in cents
      currency: 'usd', 
      interval: 'year',
      nickname: 'Pro Annual',
    }
  }
} as const

// Helper function to create or retrieve Stripe customer
export async function getOrCreateStripeCustomer(userId: string, email: string) {
  // First check if customer already exists in our database
  const { createClient } = await import('@/lib/supabase-server')
  const supabase = createClient()
  
  const { data: user } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single()

  if (user?.stripe_customer_id) {
    // Return existing customer
    return await stripe.customers.retrieve(user.stripe_customer_id) as Stripe.Customer
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  })

  // Save customer ID to database
  await supabase
    .from('users')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId)

  return customer
}

// Helper function to create checkout session
export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  userId,
}: {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  userId: string
}) {
  return await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
    },
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    customer_update: {
      address: 'auto',
      name: 'auto',
    },
  })
}

// Helper function to create customer portal session
export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}
