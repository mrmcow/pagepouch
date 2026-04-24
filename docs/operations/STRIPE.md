# Stripe — Setup, Go-Live, Webhooks, Billing Limits

> Single canonical reference for everything Stripe-related. Replaces `STRIPE_SETUP.md`, `STRIPE_SETUP_GUIDE.md`, `STRIPE_GO_LIVE_CHECKLIST.md`, `STRIPE_PRODUCTION_CHECKLIST.md`, `STRIPE_PRODUCTION_MIGRATION.md`, and `CLIP_LIMIT_ENFORCEMENT.md`.
>
> Pricing source of truth: [`PRD.md` §6](../PRD.md#6-pricing--monetization). If anything below disagrees with the PRD, the PRD wins.

---

## Pricing in production today

| Tier | Price | Limit |
|---|---|---|
| Free | $0 | **10 clips / month** (hard cap, enforced at DB layer) |
| Pro Monthly | **$12.00 USD / month** | **Unlimited** |
| Pro Annual | **$120.00 USD / year** ($10/mo equivalent — primary marketing CTA) | **Unlimited** |

> Older docs may quote `$4 / $40 / 50 clips / 1000 clips`. **Those numbers are obsolete.**

---

## Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────┐
│  Web app /      │     │  /api/stripe/        │     │   Stripe    │
│  Extension      │ ──► │    checkout          │ ──► │  Checkout   │
│  (useStripe-    │     │    customer-portal   │     │   Portal    │
│   Checkout)     │     │    webhook           │     │   Webhooks  │
└─────────────────┘     └──────────────────────┘     └─────────────┘
                                  │                          │
                                  ▼                          ▼
                          ┌──────────────────┐      ┌──────────────────┐
                          │  Supabase users  │ ◄─── │  Stripe events   │
                          │  + user_usage    │      │  update tier /   │
                          │                  │      │  period dates    │
                          └──────────────────┘      └──────────────────┘
                                  │
                                  ▼
                          ┌──────────────────────────────────┐
                          │  pg_cron daily at 02:10 UTC      │
                          │  auto-downgrades complimentary    │
                          │  Pro grants past period_end       │
                          └──────────────────────────────────┘
```

**Code paths:**
- Client: `apps/web/src/lib/use-stripe-checkout.ts` — single source of truth for the upgrade flow. Used by `UpgradeCard`, `ExportUpgradeModal`, `KnowledgeGraphUpgradeModal`. **No hardcoded fallback price IDs** — fails loudly if env vars are missing.
- API: `apps/web/src/app/api/stripe/checkout/route.ts` — surfaces real Stripe errors in non-production for easier debugging.
- API: `apps/web/src/app/api/stripe/webhook/route.ts` — verifies signature, updates `users` row.
- API: `apps/web/src/app/api/stripe/customer-portal/route.ts` — creates portal session.
- Library: `apps/web/src/lib/stripe.ts` — `getOrCreateStripeCustomer` is **resilient to "No such customer"** errors when switching modes (test ↔ live).
- Limits: `apps/web/src/lib/subscription-limits.ts` — entitlement checks gated **only** on `subscription_tier`. Period dates are informational.

---

## Required environment variables

Set in `apps/web/.env.local` for local dev and on Vercel for staging/production. Next.js does **not** read the root `.env.local`.

```bash
STRIPE_SECRET_KEY=sk_live_...                 # or sk_test_... in test mode
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... # or pk_test_...
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=price_...     # MUST be a recurring price
NEXT_PUBLIC_STRIPE_PRICE_ANNUAL=price_...      # MUST be a recurring price
STRIPE_WEBHOOK_SECRET=whsec_...
```

> ⚠️ **Recurring prices only.** A common 500-error cause has been a **one-time** price ID accidentally set as `NEXT_PUBLIC_STRIPE_PRICE_ANNUAL`. Stripe rejects it in subscription mode with `You must provide at least one recurring price`.

---

## Local development setup

Local dev points at the **live** Stripe account so the upgrade flow can be tested end-to-end against the same prices used in production. A successful checkout from `localhost` creates a real subscription.

```bash
# 1. Confirm env vars are in apps/web/.env.local (NOT repo root)
cat apps/web/.env.local | grep STRIPE

# 2. Forward webhooks to local
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy the printed whsec_... and set STRIPE_WEBHOOK_SECRET to it for local

# 3. Run dev server
npm run dev
```

**Risk mitigation when using live keys locally:**
- Don't share screen recordings of the dev terminal
- Cancel test subscriptions immediately via the customer portal
- Rotate the live secret key immediately if it ever appears in logs, screenshots, or any commit

---

## Setting up from scratch

Done once per environment. Skip ahead to [Going live](#going-live) if test setup already exists.

### 1. Create the Stripe account
- Sign up at https://dashboard.stripe.com/register
- Complete activation (business info, bank account, identity, phone) before going live

### 2. Create the product and prices

In Stripe Dashboard → Products → Create product:

```
Name:        PageStash Pro
Description: Unlimited clips, knowledge graph, all exports, priority support
Statement descriptor: PAGESTASH
```

Add **two recurring prices** on this product:

| Label | Amount | Interval |
|---|---|---|
| Monthly | $12.00 USD | Month |
| Annual | $120.00 USD | Year |

Copy both price IDs (start with `price_`) into the env vars above.

### 3. Configure the customer portal (required)

Without this, "Manage Subscription" returns a 500 error.

Go to **Settings → Billing → Customer portal** → click **Activate customer portal** and enable:
- Update payment methods
- Update billing info
- View invoices
- Cancel subscriptions
- (Optional) Switch plans

### 4. Configure the webhook

Go to **Developers → Webhooks → Add endpoint**:

- **Endpoint URL:** `https://pagestash.app/api/stripe/webhook` (or your dev URL)
- **Events to send:**
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

Copy the signing secret (`whsec_...`) into `STRIPE_WEBHOOK_SECRET`.

---

## Going live

For migrating from test mode to live mode, or onboarding a fresh production environment.

### Pre-flight
- [ ] Stripe account fully activated (no banner saying otherwise)
- [ ] Bank account connected for payouts
- [ ] Terms of Service live at `/terms` and Privacy Policy live at `/privacy`
- [ ] Refund policy documented (or explicitly: 30-day money-back, no questions asked)
- [ ] Test mode payment flow tested end-to-end (checkout, webhook, portal, cancel)

### Steps
1. **Switch Stripe Dashboard to Live mode** (toggle top-left). Live mode has no data from test mode — start fresh.
2. **Create the live product + 2 recurring prices** as in [Setting up from scratch](#setting-up-from-scratch). **Use the production amounts: $12/mo, $120/yr.**
3. **Get live API keys** from Developers → API Keys (`pk_live_...`, `sk_live_...`).
4. **Activate the live customer portal** (Settings → Billing → Customer portal in Live mode).
5. **Create the live webhook** pointing at `https://pagestash.app/api/stripe/webhook`. Copy the live `whsec_...`.
6. **Update Vercel env vars** for the Production environment:
   - `STRIPE_SECRET_KEY` → live secret
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → live publishable
   - `NEXT_PUBLIC_STRIPE_PRICE_MONTHLY` → live monthly price ID
   - `NEXT_PUBLIC_STRIPE_PRICE_ANNUAL` → live annual price ID
   - `STRIPE_WEBHOOK_SECRET` → live webhook secret
7. **Redeploy** the latest commit on Vercel.
8. **Verify with a real card:** upgrade → check Stripe shows the payment → check `users` row shows `subscription_tier = 'pro'` and the right `stripe_subscription_id` → check the customer portal opens.
9. **Cancel the test subscription** immediately via the portal so you don't keep charging yourself.

### Emergency rollback
- Revert the 5 env vars above to test-mode values
- Redeploy
- New users will see test mode (no real charges); existing live subscriptions remain active in Stripe

---

## Customer portal

`/api/stripe/customer-portal` creates a portal session and redirects the user. The portal lets users:
- Update card / payment method
- Update billing email and address
- View and download past invoices
- Cancel subscription (subscription remains active until period end)

**Common 500 cause:** customer portal not activated in Stripe (live mode and test mode are activated separately). Fix in Stripe Dashboard → Settings → Billing → Customer portal.

---

## Webhook event handling

`apps/web/src/app/api/stripe/webhook/route.ts` verifies the signature against `STRIPE_WEBHOOK_SECRET`, then updates the `users` row.

| Event | What we do |
|---|---|
| `checkout.session.completed` | Mark `subscription_tier = 'pro'`, set `subscription_status`, store `stripe_subscription_id`, set period dates |
| `customer.subscription.updated` | Sync `subscription_tier`, `subscription_status`, period dates, `subscription_cancel_at_period_end` |
| `customer.subscription.deleted` | Downgrade to `subscription_tier = 'free'`, `subscription_status = 'canceled'`, clear period dates |
| `invoice.payment_succeeded` | Update `subscription_period_start` and `subscription_period_end` |
| `invoice.payment_failed` | Log; let dunning happen via Stripe Smart Retries |

---

## Complimentary Pro grants & auto-expiry

We grant time-boxed Pro access manually for support, partnerships, and beta users. **`subscription_tier` is the only effective entitlement gate.** `subscription_period_end` is *informational and not enforced at request time* — it's used by a `pg_cron` job that auto-downgrades grants on schedule, so the team has zero manual overhead.

### Grant Pro for N days (no Stripe interaction)

```sql
UPDATE public.users
SET subscription_tier         = 'pro',
    subscription_status       = 'active',
    subscription_period_start = now(),
    subscription_period_end   = now() + interval '60 days',
    stripe_subscription_id    = NULL,            -- ← critical: marks as comp
    updated_at                = now()
WHERE email = 'recipient@example.com';
```

### Reset a comp / test account back to free

```sql
UPDATE public.users
SET subscription_tier         = 'free',
    subscription_status       = 'inactive',
    subscription_period_start = NULL,
    subscription_period_end   = NULL,
    stripe_subscription_id    = NULL,            -- keep stripe_customer_id for re-test
    updated_at                = now()
WHERE email = 'test-account@example.com';
```

If the account also has a real Stripe subscription, **cancel it in Stripe first** (otherwise webhook events will keep flipping the tier back).

### The auto-expiry cron job

```sql
SELECT cron.schedule(
  'expire-comp-pro-grants',
  '10 2 * * *',                                  -- 02:10 UTC daily
  $$
  UPDATE public.users
  SET subscription_tier         = 'free',
      subscription_status       = 'expired',
      subscription_period_start = NULL,
      subscription_period_end   = NULL,
      updated_at                = now()
  WHERE subscription_tier        = 'pro'
    AND stripe_subscription_id IS NULL          -- only complimentary
    AND subscription_period_end IS NOT NULL
    AND subscription_period_end < now();
  $$
);
```

Verify it's scheduled:

```sql
SELECT * FROM cron.job WHERE jobname = 'expire-comp-pro-grants';
```

---

## Free-tier clip limit enforcement

The 10-clips-per-month free-tier cap is enforced at **two layers**, with the database as the authoritative one — application-only checks were susceptible to a race condition that let users exceed the cap by 2–3 clips under concurrent requests.

### Layer 1 — Application pre-check

`apps/web/src/app/api/clips/route.ts` and `apps/web/src/app/api/clips/capture-url/route.ts`:

```typescript
if (hasReachedClipLimit(clipsThisMonth, subscriptionTier)) {
  return NextResponse.json(
    { error: 'Clip limit reached', upgradeUrl: '/pricing' },
    { status: 429 }
  )
}
```

This avoids paying the cost of screenshot processing for clearly over-limit requests.

### Layer 2 — Database trigger (BEFORE INSERT, row-locked)

Migration: `docs/migrations/fix_clip_limit_race_condition_v2.sql`.

```sql
CREATE OR REPLACE FUNCTION public.enforce_clip_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_subscription_tier TEXT;
  v_clips_limit       INT;
  v_clips_this_month  INT;
BEGIN
  SELECT subscription_tier INTO v_subscription_tier
  FROM public.users WHERE id = NEW.user_id;

  IF v_subscription_tier = 'pro' THEN
    v_clips_limit := 2147483647;  -- effectively unlimited
  ELSE
    v_clips_limit := 10;
  END IF;

  SELECT clips_this_month INTO v_clips_this_month
  FROM public.user_usage WHERE user_id = NEW.user_id
  FOR UPDATE;                      -- row-level lock = no race condition

  IF v_clips_this_month >= v_clips_limit THEN
    RAISE EXCEPTION 'Clip limit reached';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_clip_limit_trigger
  BEFORE INSERT ON public.clips
  FOR EACH ROW EXECUTE FUNCTION public.enforce_clip_limit();
```

The API layer catches the trigger exception and returns 429:

```typescript
if (error?.code === '23514' || error?.message?.includes('Clip limit reached')) {
  return NextResponse.json({ error: 'Clip limit reached' }, { status: 429 })
}
```

### Verify the trigger is live

```sql
SELECT tgname FROM pg_trigger WHERE tgname = 'enforce_clip_limit_trigger';
```

---

## Testing payment flows

### Test cards (test mode only)

```
Success:           4242 4242 4242 4242
Decline:           4000 0000 0000 0002
Require 3D Secure: 4000 0025 0000 3155
Expiry: any future date    CVC: any 3 digits    ZIP: any 5 digits
```

### Concurrency test for the limit enforcement

```bash
# User with 9 clips, send 3 simultaneous requests
parallel curl -X POST $URL/api/clips ::: 1 2 3
# Expected: exactly 1 → 201, exactly 2 → 429
# Final DB count: exactly 10 clips
```

---

## Troubleshooting

### `POST /api/stripe/checkout` → 500

**Most common causes:**

1. **Price ID is one-time, not recurring.** Verify in Stripe Dashboard → Products. Subscription mode requires recurring prices. Symptom: server logs show `StripeInvalidRequestError: You must provide at least one recurring price`.
2. **Env var missing or pointing at wrong mode.** `useStripeCheckout` validates this client-side and toasts a clear error; the server also surfaces the real Stripe message in non-production.
3. **Stored `stripe_customer_id` belongs to a different mode** (e.g. test customer in DB but server is in live mode). `getOrCreateStripeCustomer` now retries-and-recreates on `No such customer` — make sure your `apps/web/src/lib/stripe.ts` is current.

### `POST /api/stripe/customer-portal` → 500

**Cause:** customer portal not activated in Stripe (separately for test and live).
**Fix:** Stripe Dashboard → Settings → Billing → Customer portal → Activate.

### Payment succeeded but user still on free tier

**Cause:** webhook not delivering or signature verification failing.
**Debug:**
1. Stripe Dashboard → Webhooks → click the endpoint → **Recent events** tab — confirm events are being delivered (200 response from your endpoint).
2. If `400 Webhook signature verification failed` — `STRIPE_WEBHOOK_SECRET` is for the wrong endpoint or wrong mode. Re-copy from Stripe.
3. If events deliver but DB doesn't update — check Vercel function logs for the webhook route.

### User shows wrong tier in DB

```sql
SELECT id, email, subscription_tier, subscription_status,
       stripe_customer_id, stripe_subscription_id,
       subscription_period_start, subscription_period_end
FROM public.users
WHERE email = 'user@example.com';
```

**Inconsistent state to watch for:** `subscription_tier = 'free'` but `stripe_subscription_id` is non-null. Means a webhook downgrade fired without clearing the subscription ID. Manually clear it (and verify the Stripe subscription is actually canceled).

---

## Monitoring

| Surface | Where | What to watch |
|---|---|---|
| Stripe Dashboard | https://dashboard.stripe.com/payments | Successful payments, failed payments, refunds, churn |
| Stripe Webhooks | https://dashboard.stripe.com/webhooks | Delivery success rate; investigate any non-2xx responses |
| Vercel logs | `vercel logs --prod` | `/api/stripe/*` errors |
| Supabase | `users` and `user_usage` tables | Subscription status correctness; users near limit |
| Stripe payouts | https://dashboard.stripe.com/payouts | Confirm bank deposits land |

**Conversion-opportunity SQL** — free users near the cap, ready for an upgrade nudge:

```sql
SELECT u.email, uu.clips_this_month
FROM public.users u
JOIN public.user_usage uu ON u.id = uu.user_id
WHERE u.subscription_tier = 'free'
  AND uu.clips_this_month >= 8;     -- 80% of the 10-clip cap
```

---

## Security

**Do**
- Use environment variables for all keys
- Verify webhook signatures (already done in `webhook/route.ts`)
- Use HTTPS-only (Vercel enforces)
- Rotate keys immediately if exposed (live key rotation: Dashboard → Developers → API Keys → Roll secret key)

**Don't**
- Hardcode keys in client or server code
- Commit `.env.local`
- Skip webhook signature verification

---

## Source materials this replaced

- `STRIPE_SETUP.md`
- `STRIPE_SETUP_GUIDE.md`
- `STRIPE_GO_LIVE_CHECKLIST.md`
- `STRIPE_PRODUCTION_CHECKLIST.md`
- `STRIPE_PRODUCTION_MIGRATION.md`
- `CLIP_LIMIT_ENFORCEMENT.md`

*Last updated: April 2026*
