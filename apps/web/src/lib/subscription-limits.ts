/**
 * Subscription tier limits and configuration
 */

export interface SubscriptionLimits {
  clipsPerMonth: number
  storageLimit: number // MB
}

export interface SubscriptionTier {
  name: string
  limits: SubscriptionLimits
  features: string[]
}

export const SUBSCRIPTION_LIMITS: Record<string, SubscriptionLimits> = {
  free: {
    clipsPerMonth: 10,
    storageLimit: 100, // 100MB
  },
  pro: {
    clipsPerMonth: 1000,
    storageLimit: 5000, // 5GB
  }
} as const

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  free: {
    name: 'Free',
    limits: SUBSCRIPTION_LIMITS.free,
    features: [
      '10 clips per month',
      '100MB storage',
      'Basic folders',
      'Search & tags'
    ]
  },
  pro: {
    name: 'Pro',
    limits: SUBSCRIPTION_LIMITS.pro,
    features: [
      '1,000 clips per month',
      '5GB storage',
      'Unlimited folders',
      'Advanced search',
      'Export & backup',
      'Priority support'
    ]
  }
} as const

/**
 * Get subscription limits for a given tier
 */
export function getSubscriptionLimits(tier: string): SubscriptionLimits {
  return SUBSCRIPTION_LIMITS[tier] || SUBSCRIPTION_LIMITS.free
}

/**
 * Check if user has reached their clip limit
 */
export function hasReachedClipLimit(
  clipsThisMonth: number, 
  subscriptionTier: string
): boolean {
  const limits = getSubscriptionLimits(subscriptionTier)
  return clipsThisMonth >= limits.clipsPerMonth
}

/**
 * Calculate clips remaining for the month
 */
export function getClipsRemaining(
  clipsThisMonth: number, 
  subscriptionTier: string
): number {
  const limits = getSubscriptionLimits(subscriptionTier)
  return Math.max(0, limits.clipsPerMonth - clipsThisMonth)
}

/**
 * Get usage warning level based on percentage used
 */
export function getUsageWarningLevel(
  clipsThisMonth: number, 
  subscriptionTier: string
): 'safe' | 'warning' | 'critical' | 'exceeded' {
  const limits = getSubscriptionLimits(subscriptionTier)
  const percentage = (clipsThisMonth / limits.clipsPerMonth) * 100
  
  if (percentage >= 100) return 'exceeded'
  if (percentage >= 90) return 'critical'
  if (percentage >= 75) return 'warning'
  return 'safe'
}

/**
 * Calculate days until monthly reset
 */
export function getDaysUntilReset(): number {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const diffTime = nextMonth.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Get next reset date
 */
export function getNextResetDate(): string {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return nextMonth.toISOString().split('T')[0] // YYYY-MM-DD format
}

/**
 * Get the first-of-month date string for the current month (YYYY-MM-DD).
 */
export function getCurrentMonthStart(): { date: Date; str: string } {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return { date: d, str: d.toISOString().split('T')[0] }
}

/**
 * Ensure a user_usage row exists and is up-to-date for the current month.
 * Returns the current clips_this_month value.
 *
 * Pass any Supabase client (cookie-based or Bearer-token-based).
 */
export async function ensureUsageRow(
  supabase: any,
  userId: string
): Promise<number> {
  const { date: mStart, str: monthStr } = getCurrentMonthStart()

  // Always count actual clips for the month — this is the source of truth
  const { count } = await supabase
    .from('clips')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', mStart.toISOString())

  const realCount = count || 0

  // Upsert the usage row to keep it in sync
  await supabase.from('user_usage').upsert(
    { user_id: userId, clips_this_month: realCount, last_reset_date: monthStr },
    { onConflict: 'user_id' }
  )

  return realCount
}

/**
 * Increment the usage counter after a clip is created.
 * Counts actual clips from DB to be authoritative, then updates the row.
 * Returns the new clips_this_month value.
 */
export async function incrementUsage(
  supabase: any,
  userId: string
): Promise<number> {
  const { date: mStart, str: monthStr } = getCurrentMonthStart()

  // Count actual clips — the insert has already committed at this point
  const { count } = await supabase
    .from('clips')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', mStart.toISOString())

  const realCount = count || 0

  await supabase.from('user_usage').upsert(
    { user_id: userId, clips_this_month: realCount, last_reset_date: monthStr },
    { onConflict: 'user_id' }
  )

  return realCount
}
