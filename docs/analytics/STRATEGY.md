# 📊 PageStash Analytics Strategy & Implementation

**Version:** 1.0  
**Date:** October 30, 2025  
**Goal:** Comprehensive tracking for acquisition, engagement, and retention

---

## 🎯 Analytics Objectives

### Primary Goals
1. **Acquisition:** Understand where users come from and what drives signups
2. **Engagement:** Track feature usage and user behavior patterns
3. **Retention:** Monitor return visits and long-term usage
4. **Conversion:** Track free → pro upgrades and revenue metrics
5. **Product Intelligence:** Data-driven feature prioritization

---

## 🔧 Technology Stack

### Google Analytics 4 (GA4)
- **Why GA4:** Modern event-based tracking, free tier, cross-platform
- **Implementation:** gtag.js for web, Measurement Protocol for extensions
- **Privacy:** GDPR compliant with proper consent

### Supplementary Tools (Future)
- **Vercel Analytics:** Built-in, privacy-focused
- **Supabase Analytics:** Database insights
- **PostHog/Mixpanel:** Advanced product analytics (optional)

---

## 📋 Event Taxonomy

### Category 1: User Acquisition & Authentication

#### Web App Events
```javascript
// Sign Up Flow
'signup_started' - { method: 'email' | 'oauth' }
'signup_completed' - { method: 'email' | 'oauth', source: utm_source }
'signup_failed' - { error_type: string }

// Login Flow  
'login_started' - { method: 'email' | 'oauth' }
'login_completed' - { method: 'email' | 'oauth' }
'login_failed' - { error_type: string }

// Password Reset
'password_reset_requested' - {}
'password_reset_completed' - {}

// Extension Download
'extension_download_clicked' - { browser: 'chrome' | 'firefox', source: 'homepage' | 'dashboard' }
'extension_download_completed' - { browser: 'chrome' | 'firefox' }
```

#### Extension Events
```javascript
// First Time Experience
'extension_installed' - { browser: 'chrome' | 'firefox', version: string }
'extension_login_started' - {}
'extension_login_completed' - { time_to_login: number }
```

---

### Category 2: Core Feature Usage (Clips)

#### Extension Events
```javascript
// Clip Creation
'clip_capture_started' - { trigger: 'icon_click' | 'keyboard_shortcut' | 'context_menu' }
'clip_capture_completed' - { 
  has_folder: boolean,
  has_tags: boolean,
  capture_time_ms: number,
  url_domain: string (hashed for privacy)
}
'clip_capture_failed' - { error_type: string }

// Quick Actions
'clip_folder_selected' - { folder_id: string }
'clip_tag_added' - { tag_count: number }
'clip_note_added' - { has_note: boolean }
```

#### Dashboard Events
```javascript
// Clip Management
'clip_viewed' - { view_type: 'list' | 'grid', clip_id: string }
'clip_opened' - { source: 'search' | 'folder' | 'recent' }
'clip_deleted' - { source: 'detail' | 'bulk' }
'clip_edited' - { field: 'title' | 'note' | 'tags' | 'folder' }
'clip_shared' - { method: 'link' | 'export' }

// Bulk Actions
'clips_bulk_selected' - { count: number }
'clips_bulk_deleted' - { count: number }
'clips_bulk_moved' - { count: number }
```

---

### Category 3: Organization & Search

#### Dashboard Events
```javascript
// Folder Management
'folder_created' - { folder_name_length: number }
'folder_renamed' - {}
'folder_deleted' - { clip_count: number }
'folder_viewed' - { folder_id: string, clip_count: number }

// Search Usage
'search_performed' - { 
  query_length: number,
  results_count: number,
  search_type: 'full_text' | 'tag' | 'url'
}
'search_result_clicked' - { 
  result_position: number,
  total_results: number
}
'search_filter_applied' - { filter_type: 'folder' | 'date' | 'tag' }

// Tags
'tag_created' - { tag_name_length: number }
'tag_filter_applied' - { tag_count: number }
'tag_removed_from_clip' - {}
```

---

### Category 4: Knowledge Graphs (Premium Feature)

#### Dashboard Events
```javascript
// Knowledge Graph Usage
'knowledge_graph_opened' - { clip_count: number }
'knowledge_graph_node_clicked' - { node_type: 'clip' | 'tag' | 'domain' }
'knowledge_graph_filtered' - { filter_type: string }
'knowledge_graph_exported' - { format: 'json' | 'csv' }
'knowledge_graph_shared' - {}

// Advanced Filters
'knowledge_graph_advanced_filter_applied' - { 
  filter_count: number,
  edge_types: string[]
}
```

---

### Category 5: Monetization & Upgrade

#### Web App Events
```javascript
// Upgrade Flow
'upgrade_modal_viewed' - { trigger: 'limit_reached' | 'feature_locked' | 'pricing_page' }
'upgrade_plan_selected' - { plan: 'pro_monthly' | 'pro_yearly' }
'upgrade_checkout_started' - { plan: string }
'upgrade_completed' - { 
  plan: string,
  amount: number,
  currency: 'USD'
}
'upgrade_failed' - { error_type: string }

// Pricing Page
'pricing_page_viewed' - { source: 'header' | 'upgrade_modal' | 'direct' }
'pricing_plan_compared' - { plans: string[] }

// Usage Limits
'usage_limit_warning_shown' - { 
  limit_type: 'clips' | 'storage',
  percentage_used: number
}
'usage_limit_reached' - { limit_type: 'clips' | 'storage' }
```

---

### Category 6: Engagement & Retention

#### Web App Events
```javascript
// Session Activity
'session_started' - { 
  user_type: 'free' | 'pro',
  days_since_signup: number,
  days_since_last_visit: number
}
'session_ended' - { session_duration_seconds: number }

// Feature Discovery
'feature_tooltip_viewed' - { feature_name: string }
'feature_first_use' - { feature_name: string }
'onboarding_step_completed' - { step_number: number, step_name: string }

// Content Engagement
'blog_post_viewed' - { post_slug: string, reading_time: number }
'blog_post_read_completed' - { post_slug: string, time_on_page: number }
'email_link_clicked' - { campaign: string, link_type: string }
```

---

### Category 7: Performance & Errors

#### All Platforms
```javascript
// Performance Tracking
'page_load_time' - { 
  page: string,
  load_time_ms: number,
  device_type: 'mobile' | 'desktop'
}
'api_response_time' - { 
  endpoint: string,
  response_time_ms: number,
  status_code: number
}

// Error Tracking
'error_occurred' - {
  error_type: 'api' | 'client' | 'extension',
  error_message: string (sanitized),
  error_context: string
}
'extension_sync_failed' - { error_type: string }
```

---

## 🏗️ Implementation Architecture

### Web App (Next.js)

**File Structure:**
```
apps/web/src/
├── lib/
│   ├── analytics.ts          # Analytics wrapper
│   └── gtag.ts               # GA4 configuration
├── hooks/
│   └── useAnalytics.ts       # React hook for tracking
└── app/
    └── layout.tsx            # GA4 script injection
```

**Key Components:**
1. GA4 script in `<head>` via `layout.tsx`
2. Centralized analytics utility
3. Event tracking hooks
4. Automatic page view tracking
5. User properties on auth

---

### Chrome Extension

**Tracking Strategy:**
- Use **Measurement Protocol API** (server-side)
- Privacy-first: No PII, hashed identifiers
- Background script handles all tracking
- Respects user privacy settings

**File Structure:**
```
apps/extension/src/
├── utils/
│   ├── analytics.ts          # Extension analytics wrapper
│   └── measurement-protocol.ts # GA4 Measurement Protocol
└── background/
    └── index.ts              # Track from background
```

**Privacy Considerations:**
- Opt-in analytics (respect browser settings)
- No URL tracking (only hashed domains)
- No content capture
- Anonymous user IDs

---

### Firefox Extension

**Same as Chrome** with additional considerations:
- Firefox privacy policy compliance
- Respect Enhanced Tracking Protection
- Clear disclosure in manifest

---

## 📊 Key Metrics Dashboard

### Acquisition Metrics
- **Daily/Weekly Signups:** Track growth rate
- **Signup Sources:** UTM tracking for marketing channels
- **Conversion Rate:** Visitors → Signups
- **Extension Installs:** Track download → install rate

### Engagement Metrics
- **Daily Active Users (DAU):** Users who capture clips
- **Weekly Active Users (WAU):** Weekly engagement
- **Clips per User:** Average daily/weekly captures
- **Feature Adoption:** % users using each feature
- **Search Usage:** Queries per active user
- **Knowledge Graph Usage:** Pro feature engagement

### Retention Metrics
- **Day 1, 7, 30 Retention:** Return visit rates
- **Churn Rate:** Users who stop using PageStash
- **Cohort Analysis:** Retention by signup date
- **Reactivation Rate:** Returning inactive users

### Monetization Metrics
- **Free → Pro Conversion Rate:** Overall and by cohort
- **Monthly Recurring Revenue (MRR):** Total and growth
- **Average Revenue Per User (ARPU):** Revenue metrics
- **Churn Rate (Paid):** Pro user retention
- **Lifetime Value (LTV):** Predicted user value

### Product Metrics
- **Feature Usage:** Most/least used features
- **User Flow Analysis:** Common usage patterns
- **Error Rates:** Platform stability
- **Performance Metrics:** Load times, API latency

---

## 🎨 Implementation Priorities

### Phase 1: Foundation (Week 1) ⚡ CRITICAL
- [ ] Set up GA4 property
- [ ] Implement web app tracking (core events)
- [ ] Track signup/login flows
- [ ] Track extension downloads
- [ ] Track clip creation (extension)
- [ ] Set up conversion goals

### Phase 2: Engagement (Week 2)
- [ ] Dashboard feature tracking
- [ ] Search and filter events
- [ ] Folder management events
- [ ] Knowledge graph events
- [ ] Error tracking

### Phase 3: Monetization (Week 3)
- [ ] Upgrade flow tracking
- [ ] Payment events
- [ ] Usage limit events
- [ ] Pricing page interaction
- [ ] Stripe webhook integration

### Phase 4: Retention & Advanced (Week 4)
- [ ] Cohort analysis setup
- [ ] User segmentation
- [ ] Custom dashboards
- [ ] Automated reports
- [ ] A/B testing framework

---

## 🔒 Privacy & Compliance

### GDPR Requirements
- Cookie consent banner (web app)
- Analytics opt-out option
- Data retention policies (default: 14 months)
- Privacy policy updated with tracking disclosure

### Data Minimization
- No PII in events (use hashed IDs)
- No sensitive content captured
- Anonymous extension tracking
- Aggregate data only in reports

### User Control
- Settings page: Analytics toggle
- Clear disclosure in extension listing
- Respect Do Not Track signals
- Easy data deletion request process

---

## 🛠️ Tools & Resources

### Setup Resources
- **GA4 Property:** analytics.google.com
- **Measurement ID:** G-XXXXXXXXXX (to be created)
- **Tracking Code:** gtag.js
- **Extension Tracking:** Measurement Protocol v2

### Analytics Tools
- **Google Analytics 4:** Primary analytics
- **Google Tag Manager:** Advanced tracking (future)
- **Looker Studio:** Custom dashboards
- **Vercel Analytics:** Performance metrics

### Development Tools
- **GA4 DebugView:** Real-time event testing
- **React DevTools:** Component event verification
- **Chrome Extension DevTools:** Extension event debugging

---

## 📈 Success Metrics (3 Months)

### Target KPIs
- **1,000+ signups** per month
- **500+ active extension users**
- **70%+ Day 1 retention**
- **40%+ Day 7 retention**
- **20%+ Day 30 retention**
- **5%+ Free → Pro conversion**
- **10+ clips per active user per week**

---

## 🚀 Next Steps

1. **Create GA4 Property** (5 min)
2. **Implement web tracking** (2 hours)
3. **Implement extension tracking** (3 hours)
4. **Test all events** (1 hour)
5. **Create initial dashboards** (1 hour)
6. **Deploy & monitor** (ongoing)

---

*Last Updated: October 30, 2025*  
*PageStash Analytics Team*

