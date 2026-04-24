# 🚀 PageStash Analytics - Quick Start Guide

**Time to implement:** ~30 minutes  
**Goal:** Get Google Analytics 4 tracking live on PageStash

---

## ⚡ Step 1: Create GA4 Property (5 min)

1. **Go to Google Analytics:**
   - Visit https://analytics.google.com
   - Click **Admin** (gear icon, bottom left)

2. **Create Property:**
   - Click **+ Create Property**
   - Property name: `PageStash`
   - Timezone: Your timezone
   - Currency: USD
   - Click **Next**

3. **Business Details:**
   - Industry: Technology/Software
   - Business size: Small (1-10)
   - Click **Next**

4. **Business Objectives:**
   - Select: "Generate leads" and "Examine user behavior"
   - Click **Create**

5. **Get Measurement ID:**
   - After creation, go to **Admin → Data Streams**
   - Click **Add stream → Web**
   - Website URL: `https://pagestash.app`
   - Stream name: `PageStash Web`
   - Click **Create stream**
   - **Copy the Measurement ID** (looks like `G-XXXXXXXXXX`)

---

## ⚡ Step 2: Add to Vercel Environment Variables (2 min)

1. **Vercel Dashboard:**
   - Go to your project → **Settings** → **Environment Variables**

2. **Add Variable:**
   ```
   Name: NEXT_PUBLIC_GA_MEASUREMENT_ID
   Value: G-XXXXXXXXXX (your Measurement ID)
   Environment: Production, Preview, Development
   ```

3. **Save & Redeploy:**
   - Click **Save**
   - Trigger a redeploy (or it will auto-deploy on next push)

---

## ⚡ Step 3: Add GA4 Script to Layout (3 min)

Update `apps/web/src/app/layout.tsx`:

```typescript
import Script from 'next/script'
import { GA_MEASUREMENT_ID } from '@/lib/gtag'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body>{children}</body>
    </html>
  )
}
```

---

## ⚡ Step 4: Add Page View Tracking (2 min)

Update `apps/web/src/app/layout.tsx` to add the analytics provider:

```typescript
'use client'

import { usePageViews } from '@/hooks/useAnalytics'

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  usePageViews() // Auto-track page views
  return <>{children}</>
}
```

Then wrap your app with it in the root layout.

---

## ⚡ Step 5: Add Event Tracking to Key Actions (15 min)

### Homepage - Extension Download

`apps/web/src/app/page.tsx`:

```typescript
import { useAnalytics } from '@/hooks/useAnalytics'

export default function HomePage() {
  const analytics = useAnalytics()

  const handleDownloadClick = (browser: 'chrome' | 'firefox') => {
    analytics.trackExtensionDownloadClicked({
      browser,
      source: 'homepage'
    })
    // ... existing download logic
  }

  // ... rest of component
}
```

### Auth Pages - Signup/Login

`apps/web/src/app/auth/signup/page.tsx`:

```typescript
import { useAnalytics } from '@/hooks/useAnalytics'

const analytics = useAnalytics()

// On signup start
analytics.trackSignupStarted('email')

// On signup success
analytics.trackSignupCompleted({
  method: 'email',
  source: searchParams?.get('utm_source') || 'direct'
})

// On signup error
analytics.trackSignupFailed(error.message)
```

### Dashboard - Clip Actions

`apps/web/src/app/dashboard/page.tsx`:

```typescript
import { useAnalytics } from '@/hooks/useAnalytics'

const analytics = useAnalytics()

// When viewing a clip
analytics.trackClipViewed({
  clip_id: clip.id,
  view_type: 'grid',
  source: 'folder'
})

// When deleting a clip
analytics.trackClipDeleted({ source: 'detail' })

// When performing search
analytics.trackSearchPerformed({
  query_length: query.length,
  results_count: results.length,
  search_type: 'full_text'
})
```

### Upgrade Flow - Monetization

`apps/web/src/components/ui/upgrade-button.tsx`:

```typescript
import { useAnalytics } from '@/hooks/useAnalytics'

const analytics = useAnalytics()

// When upgrade modal opens
analytics.trackUpgradeModalViewed('limit_reached')

// When plan selected
analytics.trackUpgradePlanSelected('pro_monthly')

// When checkout starts
analytics.trackUpgradeCheckoutStarted('pro_monthly')
```

---

## ⚡ Step 6: Test Your Implementation (5 min)

1. **Open GA4 DebugView:**
   - GA4 Dashboard → **Admin** → **DebugView**

2. **Test in Development:**
   - Run `npm run dev` locally
   - Navigate around your app
   - Perform actions (signup, search, view clips)
   - Watch events appear in DebugView in real-time

3. **Verify Events:**
   - Check that events show up with correct parameters
   - Verify page_view events fire on navigation
   - Test extension download tracking

---

## ⚡ Step 7: Deploy & Monitor (2 min)

1. **Commit & Push:**
   ```bash
   git add -A
   git commit -m "✨ Add Google Analytics 4 tracking"
   git push origin main
   ```

2. **Wait for Deployment:**
   - Vercel will auto-deploy
   - Takes ~2-3 minutes

3. **Verify Production:**
   - Visit https://pagestash.app
   - Open GA4 → **Realtime** report
   - You should see yourself as an active user!

---

## 📊 Key Reports to Monitor

### Week 1 Reports (set these up):

1. **Acquisition Report:**
   - GA4 → **Acquisition → User acquisition**
   - Track signup sources

2. **Engagement Report:**
   - GA4 → **Engagement → Events**
   - See most triggered events

3. **Retention Report:**
   - GA4 → **Retention**
   - Track returning users

4. **Conversions:**
   - GA4 → **Admin → Events**
   - Mark these as conversions:
     - `signup_completed`
     - `extension_download_clicked`
     - `purchase` (upgrade completed)

---

## 🎯 Priority Events (Implement First)

### Critical (Do now):
- ✅ Page views (automatic)
- ✅ `signup_completed`
- ✅ `login_completed`
- ✅ `extension_download_clicked`
- ✅ `clip_viewed`

### High Priority (Week 1):
- `search_performed`
- `folder_created`
- `upgrade_modal_viewed`
- `usage_limit_reached`
- `knowledge_graph_opened`

### Medium Priority (Week 2):
- `clip_deleted`
- `clip_edited`
- `tag_created`
- `blog_post_viewed`

---

## 🔒 Privacy & GDPR Compliance

### Required Steps:

1. **Cookie Banner** (if serving EU users):
   - Use: [cookie-consent-banner](https://www.npmjs.com/package/cookie-consent-banner)
   - Or: CookieBot, OneTrust

2. **Update Privacy Policy:**
   - Add: "We use Google Analytics to understand usage"
   - Link to: [Google's Privacy Policy](https://policies.google.com/privacy)

3. **Opt-Out Option:**
   - Add settings page toggle for analytics
   - Respect "Do Not Track" browser setting

4. **Data Retention:**
   - GA4 → **Admin → Data Settings → Data Retention**
   - Set to: 14 months (default)

---

## 🚨 Troubleshooting

### Events not showing up?

**Check 1:** Measurement ID correct?
```bash
# Verify env var is set
echo $NEXT_PUBLIC_GA_MEASUREMENT_ID
```

**Check 2:** Script loading?
- Open DevTools → Network tab
- Filter: "gtag"
- Should see `gtag/js?id=G-XXXXXXXXXX`

**Check 3:** Events firing?
- Open DevTools → Console
- Type: `window.dataLayer`
- Should see array of events

**Check 4:** Ad blockers?
- Disable adblocker temporarily
- Try in incognito mode

### DebugView not working?

**Enable Debug Mode:**
```typescript
// Add to gtag config
gtag('config', GA_MEASUREMENT_ID, {
  debug_mode: true,
  page_path: window.location.pathname,
})
```

---

## 📈 Next Steps After Setup

1. **Week 1:** Monitor realtime data, fix any issues
2. **Week 2:** Create custom dashboards in Looker Studio
3. **Week 3:** Set up automated reports (weekly email)
4. **Week 4:** Implement A/B testing framework
5. **Month 2:** Add cohort analysis & retention reports

---

## 📚 Resources

- **GA4 Documentation:** https://support.google.com/analytics/answer/10089681
- **Event Reference:** `docs/ANALYTICS_STRATEGY.md`
- **Implementation Files:**
  - `apps/web/src/lib/gtag.ts` - GA4 config
  - `apps/web/src/lib/analytics.ts` - Event tracking
  - `apps/web/src/hooks/useAnalytics.ts` - React hooks

---

**You're ready to launch! 🚀**

Once deployed, you'll have comprehensive analytics tracking across your entire platform.

Questions? Check the full strategy doc: `docs/ANALYTICS_STRATEGY.md`

