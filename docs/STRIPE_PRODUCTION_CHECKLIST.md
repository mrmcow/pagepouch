# Stripe Production Migration - Action Checklist

**Date Started:** [Fill in]  
**Target Launch:** [Fill in]  
**Status:** 🟡 In Progress

---

## ✅ Pre-Flight Checks

### Account Activation
- [ ] Log into Stripe Dashboard: https://dashboard.stripe.com
- [ ] Account fully activated (no "Activate your account" banner)
- [ ] Business information completed
- [ ] Bank account connected for payouts
- [ ] Identity verified
- [ ] Phone number verified

### Legal Requirements
- [ ] Terms of Service live at https://pagestash.app/terms
- [ ] Privacy Policy live at https://pagestash.app/privacy
- [ ] Refund policy documented

---

## 🔧 Phase 1: Create Production Products (10 mins)

### Step 1: Switch to Live Mode
- [ ] Go to Stripe Dashboard
- [ ] Toggle from "Test mode" to "Live mode" (top-left)
- [ ] Confirm you see "Live mode" indicator

### Step 2: Create Product
- [ ] Go to: https://dashboard.stripe.com/products
- [ ] Click "Create product"
- [ ] Fill in:
  ```
  Name: PageStash Pro
  Description: 1,000 clips per month, 5GB storage, advanced features, priority support
  Statement descriptor: PAGESTASH
  ```
- [ ] Click "Save product"

### Step 3: Add Monthly Price
- [ ] In the product page, click "Add price"
- [ ] Configure:
  ```
  Price: $12.00
  Billing period: Monthly
  Currency: USD
  ```
- [ ] Click "Add price"
- [ ] **COPY PRICE ID** (starts with `price_`) → Save as:
  ```
  LIVE_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxx
  ```

### Step 4: Add Annual Price
- [ ] Scroll to same product, click "Add another price"
- [ ] Configure:
  ```
  Price: $120.00
  Billing period: Yearly
  Currency: USD
  ```
- [ ] Click "Add price"
- [ ] **COPY PRICE ID** → Save as:
  ```
  LIVE_ANNUAL_PRICE_ID=price_xxxxxxxxxxxxx
  ```

---

## 🔑 Phase 2: Get API Keys (5 mins)

### Step 1: Get Keys
- [ ] Go to: https://dashboard.stripe.com/apikeys
- [ ] Verify you're in **LIVE mode**
- [ ] Copy "Publishable key" (starts with `pk_live_`)
  ```
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
  ```
- [ ] Click "Reveal live key token" for Secret key
- [ ] Copy "Secret key" (starts with `sk_live_`)
  ```
  STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
  ```

**⚠️ CRITICAL:** Never commit these keys to git!

---

## 🎫 Phase 3: Activate Billing Portal (3 mins)

- [ ] Go to: https://dashboard.stripe.com/settings/billing/portal
- [ ] Verify you're in **LIVE mode**
- [ ] Click "Activate customer portal" or "Activate live link"
- [ ] Enable these options:
  - [ ] ✅ Customers can update payment methods
  - [ ] ✅ Customers can update billing information
  - [ ] ✅ Customers can cancel subscriptions
  - [ ] ✅ Customers can view invoices
- [ ] Under "Cancellation behavior":
  - [ ] Set to "Cancel immediately"
  - [ ] Prorate refund: No
- [ ] Click "Save changes"
- [ ] Test preview link to verify it works

---

## 🪝 Phase 4: Set Up Webhooks (5 mins)

### Step 1: Create Webhook Endpoint
- [ ] Go to: https://dashboard.stripe.com/webhooks
- [ ] Verify you're in **LIVE mode**
- [ ] Click "Add endpoint"
- [ ] Configure:
  ```
  Endpoint URL: https://pagestash.app/api/stripe/webhook
  Description: PageStash production webhook
  ```

### Step 2: Select Events
- [ ] Click "Select events" and choose:
  - [ ] ✅ checkout.session.completed
  - [ ] ✅ customer.subscription.created
  - [ ] ✅ customer.subscription.updated
  - [ ] ✅ customer.subscription.deleted
  - [ ] ✅ invoice.payment_succeeded
  - [ ] ✅ invoice.payment_failed
  - [ ] ✅ invoice.finalized

### Step 3: Save & Get Secret
- [ ] Click "Add endpoint"
- [ ] Click on the endpoint you just created
- [ ] Click "Signing secret" → "Reveal"
- [ ] **COPY SIGNING SECRET** (starts with `whsec_`)
  ```
  STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
  ```

---

## 🔧 Phase 5: Update Vercel Environment Variables (5 mins)

### Step 1: Go to Vercel
- [ ] Open: https://vercel.com/[your-username]/pagepouch/settings/environment-variables

### Step 2: Update PRODUCTION Variables Only

**For each variable below:**
1. Click the variable name
2. Click "Edit"
3. Select **PRODUCTION environment ONLY**
4. Paste the new LIVE value
5. Click "Save"

**Variables to update:**

- [ ] `STRIPE_SECRET_KEY`
  - Old: `sk_test_...`
  - New: `sk_live_...` (from Phase 2)
  
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - Old: `pk_test_...`
  - New: `pk_live_...` (from Phase 2)
  
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_MONTHLY`
  - Old: Test price ID
  - New: LIVE_MONTHLY_PRICE_ID (from Phase 1)
  
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_ANNUAL`
  - Old: Test price ID
  - New: LIVE_ANNUAL_PRICE_ID (from Phase 1)
  
- [ ] `STRIPE_WEBHOOK_SECRET`
  - Old: Test webhook secret
  - New: LIVE webhook secret (from Phase 4)

**⚠️ IMPORTANT:** 
- Only update PRODUCTION environment
- Keep test keys in Preview/Development for testing

---

## 🚀 Phase 6: Deploy (3 mins)

### Step 1: Trigger Deployment
- [ ] Go to: https://vercel.com/[your-username]/pagepouch
- [ ] Click "Deployments" tab
- [ ] Find latest production deployment
- [ ] Click "..." menu → "Redeploy"
- [ ] Wait for deployment to complete (~2-3 minutes)
- [ ] Verify deployment has green checkmark

### Step 2: Verify Deployment
- [ ] Open: https://pagestash.app
- [ ] Check site loads correctly
- [ ] No console errors in browser DevTools

---

## 🧪 Phase 7: Test Production (15 mins)

### Test 1: Verify Checkout Loads
- [ ] Go to: https://pagestash.app/dashboard
- [ ] Click "Upgrade to Pro Monthly"
- [ ] Verify Stripe Checkout opens
- [ ] Check URL is `https://checkout.stripe.com/...`
- [ ] See correct price: $12.00
- [ ] **DO NOT complete payment yet**
- [ ] Close checkout

### Test 2: First Real Payment
- [ ] Click "Upgrade to Pro Monthly" again
- [ ] Enter your REAL credit card
- [ ] Complete payment ($12.00)
- [ ] Verify redirect to dashboard with success message
- [ ] Check dashboard shows "Pro" subscription
- [ ] Verify clip limit increased to 1,000

### Test 3: Verify in Stripe
- [ ] Go to: https://dashboard.stripe.com/payments
- [ ] Verify payment appears ($12.00)
- [ ] Status: "Succeeded"
- [ ] Customer created

### Test 4: Check Webhook Delivery
- [ ] Go to: https://dashboard.stripe.com/webhooks
- [ ] Click your webhook endpoint
- [ ] Click "Events" tab
- [ ] Verify `checkout.session.completed` event
- [ ] Status: ✅ Success (green checkmark)
- [ ] Response: 200 OK

### Test 5: Billing Portal
- [ ] In dashboard, click "Manage Subscription"
- [ ] Verify redirects to Stripe portal
- [ ] Check you can see:
  - [ ] Current plan ($12/month)
  - [ ] Payment method
  - [ ] Billing history
  - [ ] Cancel subscription button
- [ ] **DO NOT cancel yet** (unless you want to test cancellation)

### Test 6: Annual Plan (Optional)
- [ ] Cancel your monthly subscription (if active)
- [ ] Wait a few minutes for cancellation to process
- [ ] Upgrade to Annual plan ($120)
- [ ] Verify payment succeeds
- [ ] Check Stripe dashboard shows $120 payment

---

## 📊 Phase 8: Monitor First Week (Ongoing)

### Daily Checks (Days 1-7)
- [ ] Check Stripe Dashboard for new payments
- [ ] Verify all webhooks are succeeding
- [ ] Check Vercel logs for any errors
- [ ] Monitor user subscriptions in database
- [ ] Watch for support emails about payment issues

### Stripe Monitoring URLs
- [ ] Payments: https://dashboard.stripe.com/payments
- [ ] Customers: https://dashboard.stripe.com/customers
- [ ] Subscriptions: https://dashboard.stripe.com/subscriptions
- [ ] Webhooks: https://dashboard.stripe.com/webhooks

---

## 🚨 Rollback Plan (If Issues Occur)

### Quick Rollback to Test Mode
If production has critical issues:

1. [ ] Go to Vercel → Settings → Environment Variables
2. [ ] Change PRODUCTION vars back to TEST keys
3. [ ] Redeploy
4. [ ] Test mode restored (no real charges)

### Debug Checklist
- [ ] Check Vercel logs: `vercel logs --prod`
- [ ] Check Stripe webhook logs
- [ ] Verify environment variables are correct
- [ ] Test in local dev environment first

---

## ✅ Success Criteria

**You're LIVE when all these are true:**

- [ ] ✅ Real payment succeeded ($12 or $120)
- [ ] ✅ Subscription shows in dashboard
- [ ] ✅ Clip limit increased correctly
- [ ] ✅ Webhook delivered successfully
- [ ] ✅ Billing portal works
- [ ] ✅ No errors in Vercel logs
- [ ] ✅ No failed webhooks in Stripe
- [ ] ✅ Customer can cancel subscription
- [ ] ✅ Cancellation reflects in app

---

## 📞 Support Contacts

**Stripe Issues:**
- Docs: https://stripe.com/docs
- Support: https://support.stripe.com
- Status: https://status.stripe.com

**Your Code:**
- Stripe config: `apps/web/src/lib/stripe.ts`
- Checkout API: `apps/web/src/app/api/stripe/checkout/route.ts`
- Webhook API: `apps/web/src/app/api/stripe/webhook/route.ts`

---

## 💰 Expected Fees

**Stripe Transaction Fees (US):**
- 2.9% + $0.30 per successful charge

**Your Revenue:**
- $12/month plan: You receive $11.23 ($0.77 fee)
- $120/year plan: You receive $116.52 ($3.48 fee)

**Payouts:**
- Daily automatic to your bank
- Initial payout: 7-14 days after first sale
- Subsequent: 2 business days

---

**Status:** Ready to migrate ✅  
**Estimated Time:** 45 minutes total  
**Risk:** Medium (test thoroughly!)  
**Revenue Impact:** $12-$120 per subscriber

**Good luck! 🚀**

