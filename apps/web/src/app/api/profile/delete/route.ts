import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { stripe } from '@/lib/stripe'

export async function DELETE(request: NextRequest) {
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

    // Get user data including Stripe customer ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
      // Continue with deletion even if we can't fetch user data
    }

    // Cancel Stripe subscription if exists
    if (userData?.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(userData.stripe_subscription_id)
        console.log(`Cancelled subscription: ${userData.stripe_subscription_id}`)
      } catch (stripeError) {
        console.error('Error cancelling Stripe subscription:', stripeError)
        // Continue with deletion even if Stripe cancellation fails
      }
    }

    // Delete Stripe customer if exists
    if (userData?.stripe_customer_id) {
      try {
        await stripe.customers.del(userData.stripe_customer_id)
        console.log(`Deleted Stripe customer: ${userData.stripe_customer_id}`)
      } catch (stripeError) {
        console.error('Error deleting Stripe customer:', stripeError)
        // Continue with deletion even if Stripe deletion fails
      }
    }

    // Delete user data from database (this will cascade delete clips, folders, etc.)
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id)

    if (deleteError) {
      console.error('Error deleting user from database:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete account data' },
        { status: 500 }
      )
    }

    // Delete the user from Supabase Auth
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id)
    
    if (authDeleteError) {
      console.error('Error deleting user from auth:', authDeleteError)
      // User data is already deleted, so this is not critical
    }

    console.log(`Successfully deleted account for user: ${user.id}`)

    return NextResponse.json({ 
      success: true,
      message: 'Account deleted successfully' 
    })

  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
