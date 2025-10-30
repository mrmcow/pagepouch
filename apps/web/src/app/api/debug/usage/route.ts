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

    // Check if user_usage record exists
    const { data: usageData, error: usageError } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Count actual clips for this month
    const currentMonthStart = new Date()
    currentMonthStart.setDate(1)
    currentMonthStart.setHours(0, 0, 0, 0)

    const { count: actualClipsCount, error: countError } = await supabase
      .from('clips')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', currentMonthStart.toISOString())

    // Get user subscription info
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      user_id: user.id,
      email: user.email,
      subscription_tier: userData?.subscription_tier || 'free',
      usage_record_exists: !usageError,
      usage_data: usageData,
      usage_error: usageError?.message,
      actual_clips_this_month: actualClipsCount || 0,
      count_error: countError?.message,
      current_month_start: currentMonthStart.toISOString(),
      debug_info: {
        usageError: usageError,
        countError: countError,
        userError: userError
      }
    })

  } catch (error) {
    console.error('Debug usage API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}

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

    // Count actual clips for this month
    const currentMonthStart = new Date()
    currentMonthStart.setDate(1)
    currentMonthStart.setHours(0, 0, 0, 0)

    const { count: actualClipsCount, error: countError } = await supabase
      .from('clips')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', currentMonthStart.toISOString())

    if (countError) {
      return NextResponse.json(
        { error: 'Failed to count clips', details: countError },
        { status: 500 }
      )
    }

    // Upsert user_usage record with correct count
    const { data: upsertData, error: upsertError } = await supabase
      .from('user_usage')
      .upsert({
        user_id: user.id,
        clips_this_month: actualClipsCount || 0,
        last_reset_date: currentMonthStart.toISOString().split('T')[0], // YYYY-MM-DD format
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (upsertError) {
      return NextResponse.json(
        { error: 'Failed to fix usage data', details: upsertError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Usage data fixed successfully',
      actual_clips_this_month: actualClipsCount || 0,
      updated_usage_record: upsertData
    })

  } catch (error) {
    console.error('Fix usage API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
