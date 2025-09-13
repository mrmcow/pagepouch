import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Client-side Supabase client for browser usage
export function createClient() {
  // During build time, return a mock client if env vars are missing
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') {
      // Server-side during build - return mock
      return null as any
    }
    
    // Client-side runtime error with helpful message
    console.error('Supabase configuration missing:', {
      url: supabaseUrl ? 'present' : 'missing',
      key: supabaseAnonKey ? 'present' : 'missing'
    })
    throw new Error('Supabase is not configured. Please check environment variables.')
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
