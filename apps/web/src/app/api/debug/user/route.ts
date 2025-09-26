import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        error: 'Not authenticated',
        authError: authError?.message
      }, { status: 401 })
    }

    // Get user data from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    // Get user's folders
    const { data: folders, error: foldersError } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', user.id)
      .order('name')

    // Get user's clips count
    const { count: clipsCount, error: clipsError } = await supabase
      .from('clips')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    return NextResponse.json({
      environment: process.env.NODE_ENV,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      auth: {
        userId: user.id,
        email: user.email,
        createdAt: user.created_at,
        lastSignIn: user.last_sign_in_at
      },
      database: {
        userData: userData || null,
        userError: userError?.message || null,
        foldersCount: folders?.length || 0,
        folders: folders || [],
        foldersError: foldersError?.message || null,
        clipsCount: clipsCount || 0,
        clipsError: clipsError?.message || null
      },
      subscription: {
        tier: userData?.subscription_tier || 'free',
        status: userData?.subscription_status || 'inactive',
        stripeCustomerId: userData?.stripe_customer_id || null,
        stripeSubscriptionId: userData?.stripe_subscription_id || null
      }
    })

  } catch (error) {
    console.error('Debug user error:', error)
    return NextResponse.json({
      error: 'Failed to get user debug info',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
