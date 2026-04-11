import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { ensureUsageRow, getCurrentMonthStart } from '@/lib/subscription-limits'

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: usageData, error: usageError } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    const { date: mStart } = getCurrentMonthStart()

    const { count: actualClipsCount, error: countError } = await supabase
      .from('clips')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', mStart.toISOString())

    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      user_id: user.id,
      email: user.email,
      subscription_tier: userData?.subscription_tier || 'free',
      usage_record_exists: !!usageData,
      usage_data: usageData,
      usage_error: usageError?.message,
      actual_clips_this_month: actualClipsCount || 0,
      count_mismatch: usageData ? usageData.clips_this_month !== (actualClipsCount || 0) : true,
      count_error: countError?.message,
      current_month_start: mStart.toISOString(),
    })
  } catch (error) {
    console.error('Debug usage API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { date: mStart, str: monthStr } = getCurrentMonthStart()

    const { count: actualClipsCount, error: countError } = await supabase
      .from('clips')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', mStart.toISOString())

    if (countError) {
      return NextResponse.json({ error: 'Failed to count clips', details: countError }, { status: 500 })
    }

    const realCount = actualClipsCount || 0

    const { data: upsertData, error: upsertError } = await supabase
      .from('user_usage')
      .upsert({
        user_id: user.id,
        clips_this_month: realCount,
        last_reset_date: monthStr,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .maybeSingle()

    if (upsertError) {
      return NextResponse.json({ error: 'Failed to fix usage data', details: upsertError }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Usage data synced successfully',
      actual_clips_this_month: realCount,
      updated_usage_record: upsertData
    })
  } catch (error) {
    console.error('Fix usage API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
