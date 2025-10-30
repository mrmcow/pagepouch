// React Hook for Analytics
// Makes tracking easy from any component

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import * as analytics from '@/lib/analytics'

// Track page views on route changes
export function usePageViews() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
      analytics.trackPageView(url)
    }
  }, [pathname, searchParams])
}

// Track specific events with React hooks
export function useAnalytics() {
  return {
    // Authentication
    trackSignupStarted: analytics.trackSignupStarted,
    trackSignupCompleted: analytics.trackSignupCompleted,
    trackLoginCompleted: analytics.trackLoginCompleted,
    
    // Extension
    trackExtensionDownloadClicked: analytics.trackExtensionDownloadClicked,
    
    // Clips
    trackClipViewed: analytics.trackClipViewed,
    trackClipDeleted: analytics.trackClipDeleted,
    trackClipEdited: analytics.trackClipEdited,
    
    // Search
    trackSearchPerformed: analytics.trackSearchPerformed,
    trackSearchResultClicked: analytics.trackSearchResultClicked,
    
    // Organization
    trackFolderCreated: analytics.trackFolderCreated,
    trackFolderViewed: analytics.trackFolderViewed,
    trackTagCreated: analytics.trackTagCreated,
    
    // Knowledge Graph
    trackKnowledgeGraphOpened: analytics.trackKnowledgeGraphOpened,
    trackKnowledgeGraphNodeClicked: analytics.trackKnowledgeGraphNodeClicked,
    
    // Monetization
    trackUpgradeModalViewed: analytics.trackUpgradeModalViewed,
    trackUpgradePlanSelected: analytics.trackUpgradePlanSelected,
    trackUsageLimitWarning: analytics.trackUsageLimitWarning,
    trackUsageLimitReached: analytics.trackUsageLimitReached,
    
    // Engagement
    trackSessionStarted: analytics.trackSessionStarted,
    trackFeatureFirstUse: analytics.trackFeatureFirstUse,
    trackBlogPostViewed: analytics.trackBlogPostViewed,
    
    // Errors
    trackError: analytics.trackError,
    
    // User properties
    setUserProperties: analytics.setUserProperties,
  }
}

// Track component mount (useful for feature discovery)
export function useTrackMount(eventName: string, params?: Record<string, any>) {
  useEffect(() => {
    analytics.trackFeatureFirstUse(eventName)
  }, [eventName])
}

