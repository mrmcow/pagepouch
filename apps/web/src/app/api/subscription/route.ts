import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
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

    // Get user's subscription info
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        subscription_tier,
        subscription_status,
        subscription_period_start,
        subscription_period_end,
        subscription_cancel_at_period_end,
        stripe_customer_id
      `)
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('Error fetching user subscription:', userError)
      return NextResponse.json(
        { error: 'Failed to fetch subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      subscription_tier: userData.subscription_tier || 'free',
      subscription_status: userData.subscription_status || 'inactive',
      subscription_period_start: userData.subscription_period_start,
      subscription_period_end: userData.subscription_period_end,
      subscription_cancel_at_period_end: userData.subscription_cancel_at_period_end || false,
      has_stripe_customer: !!userData.stripe_customer_id,
    })

  } catch (error) {
    console.error('Subscription API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
