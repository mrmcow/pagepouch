# Conversion Tracking & Analytics

> Single canonical reference for analytics. Replaces `ANALYTICS_QUICK_START.md`, `ANALYTICS_STRATEGY.md`, `CONVERSION_TRACKING_INDEX.md`, `CONVERSION_TRACKING_STRATEGY.md`, `CONVERSION_TRACKING_IMPLEMENTATION_SUMMARY.md`, `CONVERSION_TRACKING_TESTING_GUIDE.md`, and `GA4_DASHBOARD_SETUP_GUIDE.md`.

---

## Stack

| Layer | Tool |
|---|---|
| Marketing site analytics | **Google Analytics 4** (GA4) |
| Product analytics (events, funnels) | **GA4 events** + custom dimensions |
| Search performance | **Google Search Console** |
| Stripe revenue analytics | **Stripe Dashboard** (subscriptions, MRR, churn) |
| Error monitoring | **Vercel logs** (TODO: Sentry) |

`apps/web/src/lib/gtag.ts` exposes the wrapper for `gtag('event', name, params)` calls. The `<Script>` tag is mounted in `apps/web/src/app/layout.tsx` and only loads when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set.

---

## Setup (one-time)

### 1. Create GA4 property

1. https://analytics.google.com → Admin → Create Property
2. Name `PageStash`, timezone, currency USD
3. Add Web Stream → URL `https://pagestash.app` → name `PageStash Web`
4. Copy the **Measurement ID** (`G-XXXXXXXXXX`)

### 2. Add to environment

`apps/web/.env.local` (and Vercel for Production, Preview, Development):

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Redeploy. Confirm in browser DevTools → Network that `gtag/js` is loaded.

### 3. Verify with GA4 Realtime

GA4 → Reports → Realtime → load https://pagestash.app in another tab. You should appear within ~30s.

---

## Events tracked

We use a small, opinionated event taxonomy. Don't add ad-hoc events — extend this table and the helper in `gtag.ts`.

| Event | When | Params |
|---|---|---|
| `page_view` | Auto, every route | `page_path`, `page_title` |
| `cta_click` | Any tracked CTA on marketing or dashboard | `cta_id`, `section`, `tier` (`free`/`pro`/`anon`) |
| `signup_started` | User submits the signup form | `method` (`email` / `google`) |
| `signup_completed` | First successful auth callback after signup | `method` |
| `clip_created` | Server-side success in `/api/clips` | `source` (`extension`/`web`/`url`), `tier` |
| `clip_limit_hit` | 429 returned from clip APIs | `tier`, `clips_this_month` |
| `upgrade_modal_opened` | Pro upsell modal opened | `trigger` (`limit`/`export`/`graph`/`sidebar_card`) |
| `checkout_started` | `/api/stripe/checkout` returns a URL | `interval` (`monthly`/`annual`) |
| `checkout_completed` | Stripe webhook `checkout.session.completed` (server logs only) | `interval`, `amount` |
| `export_started` | User triggers an export | `format` (`md`/`csv`/`json`/`html`/`pdf`/`bibtex`) |
| `share_link_created` | User generates a public share link | `clip_id` |
| `search_performed` | Dashboard search submitted | `query_length` |

> **Mark these as Conversions in GA4:** `signup_completed`, `checkout_started`, `clip_created` (first time per user), `export_started`, `cta_click` for `Try free` and `Go Pro`.

---

## Custom dimensions to create

GA4 → Admin → Custom Definitions → Create custom dimension. Map each to the event parameter of the same name.

| Dimension | Scope | Event param |
|---|---|---|
| `tier` | Event | `tier` |
| `cta_id` | Event | `cta_id` |
| `section` | Event | `section` |
| `interval` | Event | `interval` |
| `format` | Event | `format` |
| `trigger` | Event | `trigger` |

---

## Reports & dashboards to build

### 1. Conversion funnel

GA4 → Explore → Funnel exploration:

```
Step 1: page_view  (page_path = /)
Step 2: cta_click  (cta_id = signup_top OR signup_hero OR signup_pricing)
Step 3: signup_started
Step 4: signup_completed
Step 5: clip_created
Step 6: upgrade_modal_opened
Step 7: checkout_started
```

Watch the largest drop and prioritize fixing it. Historically the worst step is **page_view → cta_click on the hero**, which is purely a hero-section UX problem.

### 2. CTA performance comparison

GA4 → Explore → Free-form:
- Rows: `cta_id`
- Columns: `section`
- Metric: Event count of `cta_click`

Use to compare hero CTA vs sidebar upgrade card vs export modal.

### 3. Section performance

Add a `section` dimension to every `cta_click`. Compare conversion rate (CTA click → signup_completed) by section. Sections that convert below average get redesigned.

### 4. Path exploration

GA4 → Explore → Path exploration → starting point `/`. Identifies the top user journeys; cut anything below 1% of sessions and double down on the top 3.

### 5. Real-time monitoring

GA4 → Reports → Realtime — pin a tab during launches.

### 6. Looker Studio dashboard *(optional)*

Connect GA4 → Looker Studio for an executive overview: visitors, signups, paid conversions, top traffic sources, top blog posts. One dashboard, weekly review.

### 7. Automated alerts

GA4 → Admin → Custom Insights:
- **Signup conversion rate dropped >25% week-over-week**
- **Stripe checkouts dropped to 0 today**
- **Traffic spike >3x normal** (good or bad — investigate)

---

## Search Console setup

1. https://search.google.com/search-console → Add Property → Domain `pagestash.app`
2. Verify via DNS TXT record (preferred) or HTML tag
3. Submit sitemaps:
   - `https://pagestash.app/sitemap.xml`
   - `https://pagestash.app/blog-sitemap.xml` (if separate)
4. Wait 48h for first data, then weekly review of:
   - Top queries → are they branded or generic? Generic queries are SEO wins
   - Pages with high impressions and low CTR → rewrite the title and meta description
   - Pages with high CTR and low position → boost authority (internal links, fresh updates)

---

## Privacy & compliance

- GA4 has IP anonymization on by default (legal basis: legitimate interest under GDPR for transactional analytics)
- We **don't** set personally identifiable user IDs on `gtag` events — `tier` is the only user attribute
- Cookie banner: TODO before any EU paid acquisition campaign — see `PRD.md` Backlog → Privacy
- Privacy policy: see [`docs/legal/PRIVACY_POLICY.md`](../legal/PRIVACY_POLICY.md)

---

## Testing

### Local verification

```bash
# Set in apps/web/.env.local
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

npm run dev
# Open http://localhost:3000, click around
# In another tab open: GA4 → Reports → Realtime → see your activity
```

### Validate event firing

Use the **GA4 DebugView**:
1. Install the Google Analytics Debugger Chrome extension OR add `?_dbg=1` to URLs
2. GA4 → Admin → DebugView
3. Click around — events appear in real time with their parameters

If a parameter is missing or wrong, fix the call site in `apps/web/` then re-test.

---

## Source materials this replaced

- `ANALYTICS_QUICK_START.md`
- `ANALYTICS_STRATEGY.md`
- `CONVERSION_TRACKING_INDEX.md`
- `CONVERSION_TRACKING_STRATEGY.md`
- `CONVERSION_TRACKING_IMPLEMENTATION_SUMMARY.md`
- `CONVERSION_TRACKING_TESTING_GUIDE.md`
- `GA4_DASHBOARD_SETUP_GUIDE.md`

*Last updated: April 2026*
