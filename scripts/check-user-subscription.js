#!/usr/bin/env node

/**
 * Script to check a user's current subscription status
 * Usage: node scripts/check-user-subscription.js <email>
 */

const { createClient } = require('@supabase/supabase-js')

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gwvsltgmjreructvbpzg.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  console.log('💡 Run: export SUPABASE_SERVICE_ROLE_KEY=your_service_key')
  process.exit(1)
}

const email = process.argv[2]
if (!email) {
  console.error('❌ Usage: node scripts/check-user-subscription.js <email>')
  process.exit(1)
}

async function checkUserSubscription(userEmail) {
  console.log(`🔍 Checking subscription for: ${userEmail}`)
  
  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    // Find user by email
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', userEmail)
      .single()
    
    if (findError || !user) {
      console.error('❌ User not found:', findError?.message || 'No user with that email')
      return
    }
    
    console.log('👤 User found:', {
      id: user.id,
      email: user.email,
      subscription_tier: user.subscription_tier || 'free',
      subscription_status: user.subscription_status || 'inactive',
      stripe_customer_id: user.stripe_customer_id || 'none',
      stripe_subscription_id: user.stripe_subscription_id || 'none',
      subscription_period_start: user.subscription_period_start || 'none',
      subscription_period_end: user.subscription_period_end || 'none'
    })
    
    // Check if user should be Pro but isn't
    if (user.stripe_customer_id && (!user.subscription_tier || user.subscription_tier === 'free')) {
      console.log('⚠️  User has Stripe customer ID but is still on free tier')
      console.log('💡 This suggests the webhook didn\'t update the subscription status')
    }
    
  } catch (error) {
    console.error('❌ Script error:', error.message)
  }
}

// Run the script
checkUserSubscription(email)
