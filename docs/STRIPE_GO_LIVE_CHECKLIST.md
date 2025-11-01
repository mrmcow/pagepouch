# Stripe Go-Live Checklist ✅

**Quick Reference:** Print this and check off each step

---

## 🔴 BEFORE You Start

- [ ] Stripe account fully activated (no pending items)
- [ ] Bank account connected for payouts
- [ ] Terms of Service published at pagestash.app/terms
- [ ] Privacy Policy published at pagestash.app/privacy
- [ ] Test mode fully tested (all payment flows work)

---

## 1️⃣ Switch to Live Mode

- [ ] Open Stripe Dashboard
- [ ] Click toggle to switch from "Test" to "Live" mode
- [ ] Confirm you see orange/red "Live mode" indicator

---

## 2️⃣ Create Live Product & Prices

**In Live Mode:**

- [ ] Go to Products → Create product
- [ ] Name: "PageStash Pro"
- [ ] Description: "1,000 clips per month, 5GB storage"
- [ ] Add Monthly Price: $4.00 USD
  - [ ] Copy Monthly Price ID: `___________________________`
- [ ] Add Annual Price: $40.00 USD
  - [ ] Copy Annual Price ID: `___________________________`

---

## 3️⃣ Get Live API Keys

**In Live Mode:**

- [ ] Go to Developers → API Keys
- [ ] Copy Publishable Key (pk_live_...): `___________________________`
- [ ] Reveal & Copy Secret Key (sk_live_...): `___________________________`

---

## 4️⃣ Activate Billing Portal

**In Live Mode:**

- [ ] Go to Settings → Billing → Customer Portal
- [ ] Click "Activate customer portal"
- [ ] Enable: Update payment method ✅
- [ ] Enable: Cancel subscription ✅
- [ ] Enable: View invoices ✅
- [ ] Click "Save"

---

## 5️⃣ Create Live Webhook

**In Live Mode:**

- [ ] Go to Developers → Webhooks
- [ ] Click "Add endpoint"
- [ ] Endpoint URL: `https://pagestash.app/api/stripe/webhook`
- [ ] Select events:
  - [ ] checkout.session.completed
  - [ ] customer.subscription.created
  - [ ] customer.subscription.updated
  - [ ] customer.subscription.deleted
  - [ ] invoice.payment_succeeded
  - [ ] invoice.payment_failed
- [ ] Click "Add endpoint"
- [ ] Copy Webhook Secret (whsec_...): `___________________________`

---

## 6️⃣ Update Vercel Environment Variables

**PRODUCTION Environment ONLY:**

- [ ] Go to Vercel → Project Settings → Environment Variables
- [ ] Update `STRIPE_SECRET_KEY` → Live secret key (sk_live_...)
- [ ] Update `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → Live publishable (pk_live_...)
- [ ] Update `NEXT_PUBLIC_STRIPE_PRICE_MONTHLY` → Live monthly price ID
- [ ] Update `NEXT_PUBLIC_STRIPE_PRICE_ANNUAL` → Live annual price ID
- [ ] Add/Update `STRIPE_WEBHOOK_SECRET` → Live webhook secret (whsec_...)

---

## 7️⃣ Redeploy Production

- [ ] Vercel → Deployments → Redeploy latest
- [ ] Wait for deployment to complete
- [ ] Verify green checkmark (success)

---

## 🧪 Test in Production

### Test 1: Real Payment

- [ ] Go to pagestash.app/dashboard
- [ ] Click "Upgrade to Pro Monthly"
- [ ] Use REAL credit card
- [ ] Complete payment ($4)
- [ ] Verify in Stripe Dashboard: Payment succeeded
- [ ] Verify in app: Subscription tier = "Pro"
- [ ] Verify webhook: Event delivered successfully

### Test 2: Billing Portal

- [ ] Click "Manage Subscription"
- [ ] Verify portal opens
- [ ] Check can view invoice
- [ ] Check can update payment method
- [ ] DON'T cancel yet!

### Test 3: Cancellation

- [ ] In billing portal: Cancel subscription
- [ ] Confirm cancellation
- [ ] Verify in Stripe: Subscription canceled
- [ ] Verify webhook: Event delivered
- [ ] Verify in app: Tier back to "Free"

---

## ✅ Go-Live Verified

- [ ] Real payment succeeded ✅
- [ ] Webhooks delivering ✅
- [ ] Subscription applied ✅
- [ ] Portal working ✅
- [ ] Cancellation working ✅
- [ ] Zero errors in Vercel logs ✅

---

## 📊 Monitor (First Week)

- [ ] Day 1: Check Stripe dashboard daily
- [ ] Day 2: Monitor webhook delivery
- [ ] Day 3: Verify subscriptions in database
- [ ] Day 4: Check for support emails
- [ ] Day 5: Review payment success rate
- [ ] Day 6: Check for failed payments
- [ ] Day 7: Confirm payouts initiated

---

## 🚨 Emergency Rollback (If Needed)

**If production has issues:**

- [ ] Vercel → Environment Variables (PRODUCTION)
- [ ] Change all back to `sk_test_...` and `pk_test_...`
- [ ] Redeploy
- [ ] Users will see test mode (no real charges)

---

## 📞 Emergency Contacts

- **Stripe Support:** https://support.stripe.com
- **Stripe Status:** https://status.stripe.com
- **Vercel Status:** https://vercel.com/status
- **Your Logs:** `vercel logs --prod`

---

**Date Started:** ___________  
**Date Completed:** ___________  
**First Payment:** ___________  
**Status:** ⬜ In Progress | ⬜ Complete | ⬜ Issues

---

**Full Guide:** See `STRIPE_PRODUCTION_MIGRATION.md` for detailed steps

