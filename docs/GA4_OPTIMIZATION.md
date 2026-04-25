# GA4 Optimization — PageStash Setup Guide

> **Context:** As of April 2026, analytics events are now fully wired into the app (see commit `9a17de9`). This document is the step-by-step setup guide for GA4 itself — what to configure, in what order, and why.
>
> Related: [`GOOGLE_ADS_TEST.md`](./GOOGLE_ADS_TEST.md) for the $100 paid acquisition experiment.

---

## What's now instrumented (April 2026)

Before following these steps, the following events are firing from the app:

| Event | Trigger | Key parameters |
|---|---|---|
| `page_view` | Every route change (SPA) | `page_location`, `page_title` |
| `signup_started` | Form submitted on `/auth/signup` | `method` |
| `signup_completed` | Supabase account created | `method`, `utm_source`, `utm_medium`, `utm_campaign` |
| `signup_failed` | Supabase error on signup | `error_type` |
| `login_completed` | Successful sign in | `method` |
| `login_failed` | Supabase error on login | `error_type` |
| `search_performed` | Debounced search in dashboard | `query_length`, `results_count`, `search_type` |
| `upgrade_modal_viewed` | Free user clicks Export or Page Graphs | `trigger` |
| `usage_limit_reached` | `clipsThisMonth >= clipsLimit` | `limit_type` |
| `begin_checkout` | "Go Pro" clicked | `plan` |
| `extension_download_clicked` | Install button clicked | `browser`, `source` |
| `scroll_depth_*` | 25/50/75/100% scroll on homepage | `scroll_percentage` |
| `section_viewed` | Homepage section enters viewport | `section_name`, `time_in_view` |
| `cta_clicked` | CTA button clicked | `cta_id`, `cta_location` |
| `exit_intent_detected` | Cursor leaves viewport top | `page_section`, `scroll_depth` |

UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`) are captured from the landing URL on first load and stored in `sessionStorage`. They are forwarded automatically to `signup_completed` so ad attribution is closed loop.

---

## Step 1 — Verify events are firing (do this first)

Before configuring anything, confirm the instrumentation is working end to end.

1. Go to **[analytics.google.com](https://analytics.google.com)** → select the PageStash property
2. Left sidebar → **Admin → DebugView**
3. Open your local dev server (`localhost:3000`) in Chrome
4. Install the **[Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)** Chrome extension and enable it
5. Walk through this test sequence and confirm each event appears in DebugView:

| Action | Expected event |
|---|---|
| Load homepage | `page_view` with `page_location: /` |
| Navigate to `/auth/signup` (click a CTA) | `page_view` with `page_location: /auth/signup` |
| Fill in and submit the form | `signup_started` |
| Account created successfully | `signup_completed` (check for `utm_*` params if you arrived via UTM URL) |
| Log in on `/auth/login` | `login_completed` |
| Go to dashboard, type in search | `search_performed` after ~300ms |
| Click Export Clips (as free user) | `upgrade_modal_viewed` with `trigger: feature_locked` |

If events are missing, check that `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set in your environment.

---

## Step 2 — Mark conversion events

These are the primary business signals GA4 needs flagged before it counts them in reports and Google Ads.

1. Left sidebar → **Admin** (gear icon, bottom left)
2. Under **Data display** → **Events**
3. Wait up to 48h after first fire for events to appear in the list
4. Toggle **Mark as conversion** ON for:
   - `signup_completed` ← primary acquisition conversion
   - `begin_checkout` ← primary monetisation conversion
5. Optional but useful — also mark these as conversions for funnel visibility:
   - `upgrade_modal_viewed` (paywall hit — top of monetisation funnel)
   - `usage_limit_reached` (strongest upsell trigger)
   - `extension_download_clicked` (acquisition signal)

---

## Step 3 — Build the signup funnel exploration

This is the most important report. You will see exactly where people drop off in the registration flow.

1. Left sidebar → **Explore → + Create new exploration**
2. Select technique: **Funnel exploration**
3. Name it: `Signup Funnel`
4. Add steps (click **+** pencil next to Steps):

| Step | Event | Parameter filter | Label |
|---|---|---|---|
| 1 | `page_view` | `page_location` contains `/auth/signup` | Visited signup page |
| 2 | `signup_started` | — | Submitted the form |
| 3 | `signup_completed` | — | Account created |

5. Set **Date range:** last 30 days
6. Set the funnel to **Open** (not Closed) so users who skipped step 1 are still counted
7. Save

**What to look for:**
- **Drop step 1 → 2:** People who landed on `/auth/signup` but never submitted. Likely confused by password requirements or form length. Consider simplifying.
- **Drop step 2 → 3:** People who submitted but got an error. Cross-reference `signup_failed` events and `error_type` parameter to see the most common failure reason.

---

## Step 4 — Build the upgrade intent audience (for Google Ads retargeting)

Free-tier users who hit the upgrade modal but didn't start checkout are your highest-value retargeting audience. They know the product, want the feature, and just need a nudge.

### Create the audience in GA4

1. Left sidebar → **Admin → Audiences → + New audience**
2. Name: `Upgrade Intent — No Checkout`
3. Conditions:
   - **Include:** users who triggered event `upgrade_modal_viewed` (any time)
   - **Exclude:** users who triggered event `begin_checkout` (any time)
4. **Membership duration:** 30 days
5. Save

### Link GA4 to Google Ads

1. Admin → **Google Ads links → + Link**
2. Select your Google Ads account → confirm
3. Wait 24–48h for audiences to populate in Google Ads

### Use the audience in Google Ads

1. Google Ads → **Shared Library → Audience Manager**
2. Find `Upgrade Intent — No Checkout` (imported from GA4)
3. In your campaign → **Audiences → + Add audience segment**
4. Add as **Observation** first (not Targeting) — this lets you measure their conversion rate vs cold traffic without restricting reach
5. After 2–3 weeks, if their conversion rate is 2×+ cold traffic, switch to **Targeting** and increase bid by 30–50%

---

## Step 5 — Build a homepage section engagement report

This shows which sections of the homepage lead to signups and which are being skipped. Use it to prioritise copy and design work.

1. **Explore → Free form exploration**
2. Name: `Homepage Section Engagement`
3. **Dimensions:** `Event name`, `section_name` (custom event parameter)
4. **Metrics:** `Event count`, `Sessions`
5. **Filter:** Event name = `section_viewed` OR `cta_clicked`
6. Save

Sections being tracked: `hero`, `pricing`, `how_it_works`, `features`, `exports`, `preview_pane`, `final_cta`, `faq`.

If `exports` has low `section_viewed` count, users aren't scrolling that far — the above-the-fold content isn't compelling enough to keep them reading.

---

## Step 6 — Configure auto-tagging for Google Ads (one-time)

This closes the attribution loop from ad click → GA4 → `signup_completed`.

1. In Google Ads → **Campaign Settings → Auto-tagging → ON**
2. This appends `gclid` to all ad landing URLs — GA4 reads it natively and attributes the session to the correct campaign/keyword
3. You **do not** need manual `utm_*` parameters for Google Ads clicks — auto-tagging handles it
4. Manual UTMs are for other channels: Reddit posts, HN submissions, email campaigns, etc. The `AnalyticsProvider` captures and forwards these automatically to `signup_completed`

---

## Step 7 — Set up a custom dashboard in GA4

Build a single view so you can check the health of acquisition and activation in 30 seconds.

1. Left sidebar → **Reports → Library → + Create new report → Overview**
2. Add these cards:

| Card | Metric | Why |
|---|---|---|
| Signups today | `signup_completed` event count | Top of funnel health |
| Signup → checkout rate | `begin_checkout` / `signup_completed` | Monetisation funnel efficiency |
| Upgrade modal views | `upgrade_modal_viewed` event count | Paywall hit rate |
| Usage limit reached | `usage_limit_reached` event count | Upsell pressure indicator |
| Search performed | `search_performed` event count | Activation (user found value) |
| Extension downloads | `extension_download_clicked` event count | Acquisition signal |

3. Pin the dashboard to the **Reports** home page

---

## Step 8 — Quarterly review checklist

Run this every quarter to keep the data useful.

- [ ] Review `signup_failed` event breakdown — are there recurring error types to fix?
- [ ] Check funnel drop rates — has the step 1→2 rate improved after copy changes?
- [ ] Review `search_performed` `results_count: 0` count — are users searching for things we don't have? (Feed back into content strategy)
- [ ] Review `upgrade_modal_viewed` vs `begin_checkout` ratio — if > 10:1, the upgrade modal copy needs work
- [ ] Re-check audience sizes in Google Ads — if `Upgrade Intent — No Checkout` has < 100 users, can't retarget yet (Google minimum); keep building
- [ ] Verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set correctly in Vercel production env

---

## Quick reference — event taxonomy

| Event | Category | Conversion? |
|---|---|---|
| `page_view` | Navigation | No |
| `signup_started` | Authentication | No — top of funnel |
| `signup_completed` | Authentication | **Yes** |
| `signup_failed` | Authentication | No — diagnostic |
| `login_completed` | Authentication | No |
| `login_failed` | Authentication | No — diagnostic |
| `search_performed` | Engagement | No — activation signal |
| `upgrade_modal_viewed` | Monetisation | Yes (optional) |
| `begin_checkout` | Monetisation | **Yes** |
| `usage_limit_reached` | Monetisation | Yes (optional) |
| `extension_download_clicked` | Acquisition | Yes (optional) |
| `scroll_depth_25/50/75/100` | Engagement | No |
| `section_viewed` | Engagement | No |
| `cta_clicked` | Conversion | No |
| `exit_intent_detected` | Engagement | No |

---

*Created: April 2026*  
*Instrumentation commit: `9a17de9`*  
*Owner: @mrmcow*
