import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getOrCreateStripeCustomer, createCheckoutSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { priceId, plan } = await request.json()

    if (!priceId || !plan) {
      return NextResponse.json(
        { error: 'Missing priceId or plan' },
        { status: 400 }
      )
    }

    // Validate plan type
    if (!['monthly', 'annual'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    const customer = await getOrCreateStripeCustomer(user.id, user.email!)

    // Create checkout session
    const session = await createCheckoutSession({
      customerId: customer.id,
      priceId,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=canceled`,
      userId: user.id,
    })

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)

    // Surface the real Stripe message in non-production so misconfigurations
    // (wrong/archived/one-time price IDs, missing customer, etc.) are obvious
    // without having to dig through server logs.
    const isProd = process.env.NODE_ENV === 'production'
    const message =
      !isProd && error instanceof Error
        ? error.message
        : 'Failed to create checkout session'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
