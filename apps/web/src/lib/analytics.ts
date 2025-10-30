// PageStash Analytics Wrapper
// Centralized analytics tracking with type safety

import * as gtag from './gtag'

// ============================================================================
// ACQUISITION & AUTHENTICATION EVENTS
// ============================================================================

export const trackSignupStarted = (method: 'email' | 'oauth') => {
  gtag.event('signup_started', {
    method,
    event_category: 'authentication',
  })
}

export const trackSignupCompleted = (params: {
  method: 'email' | 'oauth'
  source?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}) => {
  gtag.event('signup_completed', {
    ...params,
    event_category: 'authentication',
  })
}

export const trackSignupFailed = (errorType: string) => {
  gtag.event('signup_failed', {
    error_type: errorType,
    event_category: 'authentication',
  })
}

export const trackLoginCompleted = (method: 'email' | 'oauth') => {
  gtag.event('login_completed', {
    method,
    event_category: 'authentication',
  })
}

export const trackLoginFailed = (errorType: string) => {
  gtag.event('login_failed', {
    error_type: errorType,
    event_category: 'authentication',
  })
}

// ============================================================================
// EXTENSION DOWNLOAD EVENTS
// ============================================================================

export const trackExtensionDownloadClicked = (params: {
  browser: 'chrome' | 'firefox'
  source: 'homepage' | 'dashboard' | 'upgrade_modal' | 'quick_actions'
}) => {
  gtag.event('extension_download_clicked', {
    ...params,
    event_category: 'acquisition',
  })
}

export const trackExtensionDownloadCompleted = (browser: 'chrome' | 'firefox') => {
  gtag.event('extension_download_completed', {
    browser,
    event_category: 'acquisition',
  })
}

// ============================================================================
// CLIP MANAGEMENT EVENTS (Dashboard)
// ============================================================================

export const trackClipViewed = (params: {
  clip_id: string
  view_type: 'list' | 'grid'
  source: 'search' | 'folder' | 'recent' | 'favorites'
}) => {
  gtag.event('clip_viewed', {
    ...params,
    event_category: 'engagement',
  })
}

export const trackClipDeleted = (params: {
  source: 'detail' | 'bulk'
  clip_count?: number
}) => {
  gtag.event('clip_deleted', {
    ...params,
    event_category: 'engagement',
  })
}

export const trackClipEdited = (field: 'title' | 'note' | 'tags' | 'folder') => {
  gtag.event('clip_edited', {
    field,
    event_category: 'engagement',
  })
}

// ============================================================================
// SEARCH & ORGANIZATION EVENTS
// ============================================================================

export const trackSearchPerformed = (params: {
  query_length: number
  results_count: number
  search_type: 'full_text' | 'tag' | 'url'
}) => {
  gtag.event('search_performed', {
    ...params,
    event_category: 'engagement',
  })
}

export const trackSearchResultClicked = (params: {
  result_position: number
  total_results: number
}) => {
  gtag.event('search_result_clicked', {
    ...params,
    event_category: 'engagement',
  })
}

export const trackFolderCreated = () => {
  gtag.event('folder_created', {
    event_category: 'organization',
  })
}

export const trackFolderViewed = (params: {
  folder_id: string
  clip_count: number
}) => {
  gtag.event('folder_viewed', {
    ...params,
    event_category: 'organization',
  })
}

export const trackTagCreated = () => {
  gtag.event('tag_created', {
    event_category: 'organization',
  })
}

// ============================================================================
// KNOWLEDGE GRAPH EVENTS (Premium Feature)
// ============================================================================

export const trackKnowledgeGraphOpened = (params: {
  clip_count: number
  user_tier: 'free' | 'pro'
}) => {
  gtag.event('knowledge_graph_opened', {
    ...params,
    event_category: 'premium_feature',
  })
}

export const trackKnowledgeGraphNodeClicked = (nodeType: 'clip' | 'tag' | 'domain') => {
  gtag.event('knowledge_graph_node_clicked', {
    node_type: nodeType,
    event_category: 'premium_feature',
  })
}

export const trackKnowledgeGraphFiltered = (filterType: string) => {
  gtag.event('knowledge_graph_filtered', {
    filter_type: filterType,
    event_category: 'premium_feature',
  })
}

// ============================================================================
// MONETIZATION EVENTS
// ============================================================================

export const trackUpgradeModalViewed = (trigger: 'limit_reached' | 'feature_locked' | 'pricing_page' | 'dashboard_banner') => {
  gtag.event('upgrade_modal_viewed', {
    trigger,
    event_category: 'monetization',
  })
}

export const trackUpgradePlanSelected = (plan: 'pro_monthly' | 'pro_yearly') => {
  gtag.event('upgrade_plan_selected', {
    plan,
    event_category: 'monetization',
  })
}

export const trackUpgradeCheckoutStarted = (plan: string) => {
  gtag.event('begin_checkout', {
    plan,
    event_category: 'monetization',
  })
}

export const trackUpgradeCompleted = (params: {
  plan: string
  amount: number
  currency: string
}) => {
  gtag.event('purchase', {
    ...params,
    value: params.amount,
    event_category: 'monetization',
  })
}

export const trackUsageLimitWarning = (params: {
  limit_type: 'clips' | 'storage'
  percentage_used: number
}) => {
  gtag.event('usage_limit_warning_shown', {
    ...params,
    event_category: 'monetization',
  })
}

export const trackUsageLimitReached = (limitType: 'clips' | 'storage') => {
  gtag.event('usage_limit_reached', {
    limit_type: limitType,
    event_category: 'monetization',
  })
}

// ============================================================================
// ENGAGEMENT & RETENTION EVENTS
// ============================================================================

export const trackSessionStarted = (params: {
  user_type: 'free' | 'pro'
  days_since_signup?: number
  days_since_last_visit?: number
}) => {
  gtag.event('session_started', {
    ...params,
    event_category: 'engagement',
  })
}

export const trackFeatureFirstUse = (featureName: string) => {
  gtag.event('feature_first_use', {
    feature_name: featureName,
    event_category: 'engagement',
  })
}

export const trackBlogPostViewed = (params: {
  post_slug: string
  reading_time: number
}) => {
  gtag.event('blog_post_viewed', {
    ...params,
    event_category: 'content',
  })
}

// ============================================================================
// ERROR TRACKING
// ============================================================================

export const trackError = (params: {
  error_type: 'api' | 'client' | 'extension'
  error_message: string
  error_context?: string
}) => {
  gtag.event('error_occurred', {
    ...params,
    event_category: 'error',
  })
}

// ============================================================================
// USER PROPERTIES
// ============================================================================

export const setUserProperties = (params: {
  user_id: string
  subscription_tier: 'free' | 'pro'
  signup_date?: string
  clips_count?: number
}) => {
  gtag.setUserProperties({
    user_tier: params.subscription_tier,
    total_clips: params.clips_count,
  })
  
  // Set user ID for cross-platform tracking
  gtag.event('set_user_id', {
    user_id: params.user_id,
  })
}

// ============================================================================
// PAGE VIEWS
// ============================================================================

export const trackPageView = (url: string, title?: string) => {
  gtag.pageview(url)
  
  if (title) {
    gtag.event('page_view', {
      page_title: title,
      page_location: url,
    })
  }
}

