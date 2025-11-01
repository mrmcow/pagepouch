# Stripe Production Migration Guide

**Last Updated:** November 1, 2025  
**Purpose:** Move from Stripe Test Mode to Live Production Mode  
**Estimated Time:** 30-45 minutes (excluding bank verification wait times)

---

## 🎯 Overview

This guide walks you through migrating from Stripe Test Mode (sandbox) to Production Mode to accept real payments.

**Current Status:** Test Mode (sandbox)  
**Target Status:** Live Mode (production)

---

## ⚠️ Prerequisites - MUST Complete First

### 1. Stripe Account Activation

**Status Check:**
1. Log into Stripe Dashboard: https://dashboard.stripe.com
2. Look for a banner at the top saying "Activate your account"
3. If you see it, you MUST complete activation before going live

**Activation Requirements:**
- [ ] Business information provided
- [ ] Tax ID / EIN (for US businesses) or personal info
- [ ] Bank account connected for payouts
- [ ] Identity verification (may require ID upload)
- [ ] Phone number verification

**⏱️ Timeline:**
- Most activations: Instant to a few hours
- Some cases: 1-2 business days (if manual review needed)

**Action:** Complete activation at https://dashboard.stripe.com/account/onboarding

---

### 2. Legal & Compliance Requirements

Before accepting real payments, ensure you have:

- [ ] **Terms of Service** published at https://pagestash.app/terms
- [ ] **Privacy Policy** published at https://pagestash.app/privacy
- [ ] **Refund Policy** clearly stated
- [ ] **Business entity** (LLC/Corporation) OR operating as sole proprietor
- [ ] **Tax registration** (if required in your jurisdiction)

**Note:** Stripe requires you have these legal documents. They may audit compliance.

---

### 3. Test Your Payment Flow Thoroughly

Before going live, test EVERYTHING in test mode:

**✅ Testing Checklist:**
- [ ] User can upgrade to Pro (monthly)
- [ ] User can upgrade to Pro (annual)
- [ ] Subscription appears in user's profile
- [ ] Clip limits increase after upgrade
- [ ] User can access billing portal
- [ ] User can update payment method
- [ ] User can cancel subscription
- [ ] Subscription status updates correctly after cancel
- [ ] Webhook receives events successfully
- [ ] Database updates correctly on payment events

**Test Cards:** https://stripe.com/docs/testing
- Success: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

---

## 📋 Production Migration Steps

### Step 1: Switch to Live Mode in Stripe

1. **Go to Stripe Dashboard:** https://dashboard.stripe.com
2. **Look for toggle** in top-left: "Test mode" / "Live mode"
3. **Click to switch to "Live mode"**
4. **Confirm** you're now in Live mode (should see orange/red indicator)

**⚠️ Important:** Live mode has NO data from test mode. You start fresh.

---

### Step 2: Create Live Product & Prices

**In Live Mode:**

1. **Go to:** Products → https://dashboard.stripe.com/products
2. **Click:** "Create product"

**Product Configuration:**
```
Name: PageStash Pro
Description: 1,000 clips per month, 5GB storage, advanced features
Statement descriptor: PAGESTASH (appears on customer's credit card)
```

3. **Add Price - Monthly:**
```
Price: $4.00 USD
Billing period: Monthly
Currency: USD
```
- Click "Add price"
- **Copy the Price ID** (e.g., `price_1ABC...`)
- Save this as `LIVE_MONTHLY_PRICE_ID`

4. **Add Price - Annual:**
- Scroll down to the same product
- Click "Add another price"
```
Price: $40.00 USD  
Billing period: Yearly
Currency: USD
```
- Click "Add price"
- **Copy the Price ID**
- Save this as `LIVE_ANNUAL_PRICE_ID`

**📝 Note Down:**
```
LIVE_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxx
LIVE_ANNUAL_PRICE_ID=price_xxxxxxxxxxxxx
```

---

### Step 3: Get Live API Keys

1. **Go to:** Developers → API Keys → https://dashboard.stripe.com/apikeys
2. **Ensure you're in LIVE mode** (check toggle)
3. **Copy your keys:**

**Publishable Key:**
```
pk_live_[YOUR_PUBLISHABLE_KEY_HERE]
```
- Starts with `pk_live_`
- Safe to expose in frontend

**Secret Key:**
```
sk_live_[YOUR_SECRET_KEY_HERE]
```
- Click "Reveal live key token"
- Starts with `sk_live_`
- ⚠️ NEVER commit to git or expose publicly

**📝 Note Down:**
```
STRIPE_SECRET_KEY=sk_live_[YOUR_KEY]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_[YOUR_KEY]
```

---

### Step 4: Activate Live Billing Portal

**⚠️ CRITICAL:** Without this, users can't manage subscriptions!

1. **Go to:** Settings → Billing → Customer Portal
   - https://dashboard.stripe.com/settings/billing/portal
2. **Ensure you're in LIVE mode**
3. **Click:** "Activate customer portal" or "Activate live link"
4. **Configure settings:**
   ```
   ✅ Customers can update payment methods
   ✅ Customers can update billing information
   ✅ Customers can cancel subscriptions
   ✅ Customers can view invoices
   ```
5. **Set cancellation behavior:**
   ```
   When subscription is canceled:
   • Cancel immediately ✅
   • Prorate refund: No (standard practice)
   ```
6. **Click "Save changes"**

**Test:** After activation, you should see a portal link you can click to preview.

---

### Step 5: Set Up Live Webhooks

Webhooks are REQUIRED for production. They notify your app when:
- Payment succeeds
- Payment fails
- Subscription cancels
- Subscription renews

**Setup:**

1. **Go to:** Developers → Webhooks → https://dashboard.stripe.com/webhooks
2. **Ensure you're in LIVE mode**
3. **Click:** "Add endpoint"
4. **Endpoint URL:** `https://pagestash.app/api/stripe/webhook`
5. **Description:** "PageStash production webhook"
6. **Events to send:** Click "Select events" and choose:
   ```
   ✅ checkout.session.completed
   ✅ customer.subscription.created
   ✅ customer.subscription.updated
   ✅ customer.subscription.deleted
   ✅ invoice.payment_succeeded
   ✅ invoice.payment_failed
   ✅ invoice.finalized
   ```
7. **Click "Add endpoint"**
8. **Copy the Signing Secret** (starts with `whsec_...`)

**📝 Note Down:**
```
STRIPE_WEBHOOK_SECRET=whsec_[YOUR_WEBHOOK_SECRET]
```

**⚠️ Security:** The webhook secret verifies requests are actually from Stripe (not hackers).

---

### Step 6: Update Vercel Environment Variables

**Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables  
https://vercel.com/your-username/pagepouch/settings/environment-variables

**Update PRODUCTION environment ONLY:**

| Variable | Old Value (Test) | New Value (Live) |
|----------|------------------|------------------|
| `STRIPE_SECRET_KEY` | `sk_test_...` | `sk_live_...` ✅ |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | `pk_live_...` ✅ |
| `NEXT_PUBLIC_STRIPE_PRICE_MONTHLY` | Test price ID | Live monthly price ID ✅ |
| `NEXT_PUBLIC_STRIPE_PRICE_ANNUAL` | Test price ID | Live annual price ID ✅ |
| `STRIPE_WEBHOOK_SECRET` | Test webhook | Live webhook secret ✅ |

**Steps:**
1. Click each variable
2. Click "Edit"
3. Select "Production" environment ONLY
4. Paste new LIVE value
5. Click "Save"

**⚠️ IMPORTANT:** 
- Keep TEST keys in "Preview" and "Development" environments
- Only update PRODUCTION to live keys
- This lets you test in staging without affecting production

---

### Step 7: Redeploy Production

After updating environment variables:

1. **Go to:** Vercel Dashboard → Deployments
2. **Click:** "Redeploy" on the latest production deployment
3. **Wait** for deployment to complete (~2-3 minutes)
4. **Verify** deployment succeeded (green checkmark)

**Or via CLI:**
```bash
cd /Users/michaelcouch/DEV/pagepouch
vercel --prod
```

---

### Step 8: Verify Production Configuration

**Quick Check:**

1. **Open:** https://pagestash.app/dashboard
2. **Open browser DevTools:** F12 → Console
3. **Try to upgrade:**
   - Click "Upgrade to Pro"
   - Choose Monthly or Annual
   - Check console for any errors
4. **Look for:** Stripe Checkout loads successfully
5. **Check:** URL shows `https://checkout.stripe.com/c/pay/...`
6. **Verify:** Stripe logo and your product appear

**DO NOT complete the payment yet!** We'll do a controlled test next.

---

## 🧪 Production Testing (CRITICAL)

### Test 1: Small Test Payment

**Use a REAL card for first test:**

1. **Go to:** https://pagestash.app/dashboard
2. **Click:** "Upgrade to Pro Monthly"
3. **In Stripe Checkout, enter REAL card:**
   ```
   Card: Your actual credit/debit card
   Name: Your real name
   ```
4. **Click:** "Subscribe"
5. **Check:** Payment succeeds
6. **Verify in Stripe:** https://dashboard.stripe.com/payments
   - You should see your $4 payment
   - Status: "Succeeded"
7. **Verify in app:**
   - Refresh dashboard
   - Check subscription tier shows "Pro"
   - Try to add more than 50 clips (should work)
8. **Verify webhook:**
   - Go to Stripe: Developers → Webhooks → Click your endpoint
   - Check "Events" tab
   - Should see `checkout.session.completed` with ✅ success

**🎉 If all checks pass:** Production payment system is working!

---

### Test 2: Billing Portal

1. **In dashboard:** Click "Manage Subscription"
2. **Verify:** Redirects to Stripe Billing Portal
3. **Check you can:**
   - View current plan
   - Update payment method
   - Download invoices
   - Cancel subscription (DON'T actually cancel yet)
4. **If it works:** Portal is configured correctly

---

### Test 3: Cancel & Verify

**Now test cancellation:**

1. **In Billing Portal:** Click "Cancel subscription"
2. **Confirm cancellation**
3. **Check Stripe webhook:**
   - Go to: Developers → Webhooks → Your endpoint
   - Should see `customer.subscription.deleted` event
4. **Check database:**
   - Your `subscription_tier` should update back to "free"
5. **Check app:**
   - Refresh dashboard
   - Should show free plan limits
   - Upgrade button should reappear

**If all works:** Full payment lifecycle is working correctly! 🎉

---

## 🔄 Rollback Plan (If Something Goes Wrong)

If production has issues:

### Quick Rollback:

1. **Go to Vercel:** Settings → Environment Variables
2. **Change PRODUCTION variables back to TEST keys:**
   ```
   STRIPE_SECRET_KEY → sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY → pk_test_...
   NEXT_PUBLIC_STRIPE_PRICE_MONTHLY → test price ID
   NEXT_PUBLIC_STRIPE_PRICE_ANNUAL → test price ID
   ```
3. **Redeploy**
4. **Users will see test mode** (no real charges)

### Debug Issues:

```bash
# Check Vercel logs
vercel logs --prod

# Check Stripe webhook logs
# Go to: Developers → Webhooks → Your endpoint → Events

# Check database
# Supabase Dashboard → Table Editor → users
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Invalid API key provided"

**Cause:** API key not updated or incorrect

**Solution:**
1. Check Vercel environment variables are updated
2. Verify keys start with `sk_live_` and `pk_live_`
3. Redeploy after changing
4. Clear browser cache

---

### Issue 2: "No such price"

**Cause:** Using test price ID in live mode (or vice versa)

**Solution:**
1. Go to Stripe Dashboard → Products (in LIVE mode)
2. Copy the correct LIVE price IDs
3. Update Vercel environment variables
4. Redeploy

---

### Issue 3: Webhook events not arriving

**Cause:** Webhook not configured or secret wrong

**Solution:**
1. Check webhook is in LIVE mode: https://dashboard.stripe.com/webhooks
2. Verify endpoint URL is exact: `https://pagestash.app/api/stripe/webhook`
3. Copy signing secret and update `STRIPE_WEBHOOK_SECRET` in Vercel
4. Test webhook: Stripe Dashboard → Send test webhook

---

### Issue 4: "Billing portal not activated"

**Cause:** Forgot to activate portal in live mode

**Solution:**
1. Go to: https://dashboard.stripe.com/settings/billing/portal (LIVE mode)
2. Click "Activate customer portal"
3. Configure settings and save

---

### Issue 5: Payment succeeds but subscription not applied

**Cause:** Webhook not processing correctly

**Check:**
1. Stripe webhook logs: Did webhook fire?
2. Vercel logs: Any errors in `/api/stripe/webhook`?
3. Database: Did `subscription_tier` update?

**Debug:**
```bash
# Check webhook endpoint code
apps/web/src/app/api/stripe/webhook/route.ts

# Check Vercel logs
vercel logs --prod | grep webhook
```

---

## 📊 Post-Launch Monitoring

### Week 1: Monitor Closely

**Daily Checks:**
- [ ] Check Stripe Dashboard for payments
- [ ] Verify webhooks are succeeding
- [ ] Check Vercel logs for errors
- [ ] Monitor user subscriptions in database
- [ ] Watch for support emails about payment issues

**Stripe Dashboard:** https://dashboard.stripe.com
- Payments → See all transactions
- Customers → View subscriber list
- Subscriptions → Track active/canceled
- Webhooks → Monitor webhook delivery

---

### Set Up Alerts

**Stripe Alerts:**
1. Go to: Settings → Notifications
2. Enable:
   - Failed payments
   - Disputed charges
   - Failed webhook deliveries

**Vercel Alerts:**
1. Project Settings → Notifications
2. Enable error alerts

**Database Alerts:**
1. Supabase → Project → Reports
2. Monitor subscription tier changes

---

## 📋 Final Pre-Launch Checklist

**Before Going Live:**

- [ ] Stripe account fully activated (no pending requirements)
- [ ] Bank account connected and verified
- [ ] Terms of Service and Privacy Policy published
- [ ] Live product & prices created in Stripe
- [ ] Live API keys obtained
- [ ] Live webhook endpoint created
- [ ] Billing portal activated in live mode
- [ ] All 5 environment variables updated in Vercel (PRODUCTION only)
- [ ] Production redeployed
- [ ] Test payment completed successfully (real card, real $4)
- [ ] Webhook delivery verified in Stripe
- [ ] Subscription applied correctly in app
- [ ] Billing portal tested and working
- [ ] Cancellation flow tested
- [ ] Refund policy decided and documented
- [ ] Support email ready for payment issues (support@pagestash.app)
- [ ] Monitoring alerts configured

**After First Week:**

- [ ] At least 5 successful live payments
- [ ] Zero webhook failures
- [ ] Zero support tickets about payment issues
- [ ] All subscriptions reflected correctly in database

---

## 💰 Financial Considerations

### Stripe Fees (US)

**Per Transaction:**
- 2.9% + $0.30 per successful charge

**Example:**
- $4/month subscription = $0.42 fee (you receive $3.58)
- $40/year subscription = $1.46 fee (you receive $38.54)

**Payouts:**
- Daily automatic payouts to your bank (after initial delay)
- Initial payout: 7-14 days after first sale (Stripe's policy)
- Subsequent: 2 business days after transaction

---

### Tax Considerations

**Sales Tax / VAT:**
- Stripe Tax: Auto-calculate tax based on location (optional add-on)
- Manual: You may need to collect tax based on your jurisdiction
- Consult: Talk to accountant about nexus requirements

**Income Tax:**
- Track: All revenue via Stripe Dashboard → Reports
- Stripe provides: 1099-K if you exceed $20k/year (US)

---

## 🔐 Security Best Practices

**✅ DO:**
- Use separate API keys for test/live
- Store keys in Vercel environment variables only
- Enable Stripe Radar (fraud detection) - it's automatic
- Monitor webhook signature verification
- Keep your Stripe Dashboard credentials secure (use 2FA)
- Regularly review API key access logs

**❌ DON'T:**
- Commit API keys to git
- Share secret keys with anyone
- Use live keys in development
- Disable webhook signature verification
- Store customer payment info (Stripe handles it)

---

## 📞 Support Resources

**Stripe Support:**
- Documentation: https://stripe.com/docs
- Support: https://support.stripe.com
- Discord: https://discord.gg/stripe
- Status: https://status.stripe.com

**Your Implementation:**
- Code: `apps/web/src/lib/stripe.ts`
- Checkout API: `apps/web/src/app/api/stripe/checkout/route.ts`
- Portal API: `apps/web/src/app/api/stripe/portal/route.ts`
- Webhook API: `apps/web/src/app/api/stripe/webhook/route.ts`

---

## ✅ Success Criteria

**You're ready for production when:**

✅ Stripe account fully activated  
✅ Test payment succeeded with real card  
✅ Webhook delivered successfully  
✅ Subscription applied in app  
✅ Billing portal works  
✅ Cancellation flow works  
✅ Zero errors in Vercel logs  
✅ Zero failed webhooks in Stripe  
✅ Legal documents published  
✅ Support ready for payment inquiries  

---

**Last Updated:** November 1, 2025  
**Status:** Ready for production migration  
**Risk Level:** Medium (thoroughly test first!)  
**Estimated Revenue Impact:** $4-40 per subscriber/month

