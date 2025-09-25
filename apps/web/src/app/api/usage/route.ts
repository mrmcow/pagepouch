import { createClient } from '@/lib/supabase-server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { 
  getSubscriptionLimits, 
  getClipsRemaining, 
  getUsageWarningLevel,
  getDaysUntilReset,
  getNextResetDate 
} from '@/lib/subscription-limits'

export interface UsageResponse {
  subscription_tier: string
  clips_this_month: number
  clips_limit: number
  clips_remaining: number
  storage_used_mb: number
  storage_limit_mb: number
  reset_date: string
  days_until_reset: number
  warning_level: 'safe' | 'warning' | 'critical' | 'exceeded'
}

export async function GET(request: NextRequest) {
  try {
    // Check for Bearer token first (for extension)
    const authHeader = request.headers.get('authorization')
    let supabase
    let user
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extension authentication with Bearer token
      const token = authHeader.replace('Bearer ', '')
      supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token)
      
      if (tokenError || !tokenUser) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      user = tokenUser
    } else {
      // Web app authentication with cookies
      supabase = createClient()
      const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !cookieUser) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      user = cookieUser
    }

    // Get user profile with subscription tier
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('Error fetching user profile:', userError)
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    // Get user usage data
    const { data: usageData, error: usageError } = await supabase
      .from('user_usage')
      .select('clips_this_month, storage_used_mb, last_reset_date')
      .eq('user_id', user.id)
      .single()

    if (usageError) {
      console.error('Error fetching usage data:', usageError)
      return NextResponse.json(
        { error: 'Failed to fetch usage data' },
        { status: 500 }
      )
    }

    const subscriptionTier = userProfile.subscription_tier || 'free'
    const limits = getSubscriptionLimits(subscriptionTier)
    const clipsThisMonth = usageData?.clips_this_month || 0
    
    const response: UsageResponse = {
      subscription_tier: subscriptionTier,
      clips_this_month: clipsThisMonth,
      clips_limit: limits.clipsPerMonth,
      clips_remaining: getClipsRemaining(clipsThisMonth, subscriptionTier),
      storage_used_mb: usageData?.storage_used_mb || 0,
      storage_limit_mb: limits.storageLimit,
      reset_date: getNextResetDate(),
      days_until_reset: getDaysUntilReset(),
      warning_level: getUsageWarningLevel(clipsThisMonth, subscriptionTier)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Usage API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
