# Stripe Payment Setup Guide

**Last Updated:** November 1, 2025  
**Status:** Configuration Required

---

## 🎯 Quick Setup (5 Minutes)

### Step 1: Create Stripe Account

1. Go to https://dashboard.stripe.com/register
2. Create account or sign in
3. Activate your account (required for live mode later)

---

### Step 2: Create Product & Prices

#### In Stripe Dashboard:

1. **Go to Products:** https://dashboard.stripe.com/test/products
2. **Click "Add product"**

**Product Details:**
```
Name: PageStash Pro
Description: 1,000 clips per month, 5GB storage, advanced features
```

3. **Add Pricing - Monthly:**
```
Price: $4.00 USD
Billing period: Monthly
```

Click "Add price" - Copy the **Price ID** (looks like `price_xxxxxxxxxxxxx`)

4. **Add another price - Annual:**
```
Price: $40.00 USD
Billing period: Yearly
```

Click "Add price" - Copy the **Price ID**

---

### Step 3: Get API Keys

1. **Go to:** https://dashboard.stripe.com/test/apikeys
2. **Copy your keys:**
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) - Click "Reveal test key"

**⚠️ IMPORTANT:** Never commit secret keys to git!

---

### Step 4: Configure Environment Variables

#### For Local Development:

**File:** `.env.local` (create if doesn't exist)

```bash
# Stripe API Keys (Test Mode)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_ANNUAL=price_xxxxxxxxxxxxx
```

---

#### For Production (Vercel):

1. **Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables
2. **Add these variables:**

| Key | Value | Environment |
|-----|-------|-------------|
| `STRIPE_SECRET_KEY` | `sk_test_xxx...` | Production, Preview, Development |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_xxx...` | Production, Preview, Development |
| `NEXT_PUBLIC_STRIPE_PRICE_MONTHLY` | `price_xxx...` | Production, Preview, Development |
| `NEXT_PUBLIC_STRIPE_PRICE_ANNUAL` | `price_xxx...` | Production, Preview, Development |

3. **Click "Save"**
4. **Redeploy** your application for changes to take effect

---

## 🧪 Testing Payment Flow

### Test Mode (Free to Test)

Stripe test mode lets you test payments without real money.

**Test Card Numbers:**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Require 3D Secure: 4000 0025 0000 3155

Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

### Test the Flow:

1. **Go to:** https://pagestash.app/dashboard
2. **Click:** "Upgrade Monthly ($4)"
3. **Stripe Checkout opens**
4. **Enter test card:** 4242 4242 4242 4242
5. **Complete payment**
6. **Redirected to:** Dashboard with success message
7. **Verify:** Usage limit updated to 1,000 clips

---

## 🔒 Going Live (Production Mode)

**⚠️ Do this only when ready to accept real payments!**

### Step 1: Activate Stripe Account

1. Complete Stripe onboarding
2. Provide business information
3. Connect bank account for payouts

### Step 2: Create Live Products

1. **Switch to Live Mode** (toggle in Stripe dashboard)
2. **Repeat Step 2 from Quick Setup** (create product & prices in live mode)
3. **Copy LIVE Price IDs**

### Step 3: Update Production Environment Variables

**In Vercel:**

1. Go to Settings → Environment Variables
2. **Update these to LIVE keys:**
   - `STRIPE_SECRET_KEY` → `sk_live_xxxxxxxxxxxxx`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_live_xxxxxxxxxxxxx`
   - `NEXT_PUBLIC_STRIPE_PRICE_MONTHLY` → Live monthly price ID
   - `NEXT_PUBLIC_STRIPE_PRICE_ANNUAL` → Live annual price ID

3. **Redeploy** application

---

## 🔧 Troubleshooting

### Error: "Stripe checkout error" (500)

**Possible Causes:**

1. **Missing API Key**
   - Check environment variables are set in Vercel
   - Verify keys start with `sk_test_` or `sk_live_`

2. **Invalid Price ID**
   - Price ID doesn't exist in your Stripe account
   - Using test Price ID in live mode (or vice versa)
   - Solution: Copy correct Price ID from Stripe dashboard

3. **Price ID for wrong mode**
   - Test mode price IDs start with `price_` and work only in test mode
   - Live mode price IDs also start with `price_` but work only in live mode
   - Make sure you're using the right mode

**Debug:**
```bash
# Check Vercel logs
vercel logs

# Look for "Stripe checkout error" messages
```

---

### Error: "No such price"

**Solution:**
1. Go to Stripe Dashboard → Products
2. Find your PageStash Pro product
3. Copy the correct Price IDs
4. Update environment variables in Vercel
5. Redeploy

---

### Payment succeeds but subscription not applied

**Possible Causes:**

1. **Webhook not configured**
2. **Webhook secret incorrect**
3. **Database not updating**

**Solution:** Check webhook setup (see Webhook section below)

---

## 🪝 Webhook Setup (Required for Production)

Webhooks notify your app when payments succeed/fail.

### Step 1: Create Webhook Endpoint

**Already implemented at:** `/api/stripe/webhook`

### Step 2: Register Webhook in Stripe

1. **Go to:** https://dashboard.stripe.com/test/webhooks
2. **Click:** "Add endpoint"
3. **Endpoint URL:** `https://pagestash.app/api/stripe/webhook`
4. **Events to send:**
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. **Click "Add endpoint"**
6. **Copy the Signing Secret** (starts with `whsec_...`)

### Step 3: Add Webhook Secret to Environment

**In Vercel:**
```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Redeploy** after adding.

---

## 📊 Monitoring Payments

### Stripe Dashboard

**Test Payments:** https://dashboard.stripe.com/test/payments  
**Live Payments:** https://dashboard.stripe.com/payments

**What to Monitor:**
- Successful payments
- Failed payments
- Refunds
- Subscription cancellations

### Your Database

**Check user subscription status:**
```sql
SELECT 
  u.email,
  u.subscription_tier,
  u.stripe_customer_id,
  u.stripe_subscription_id
FROM users u
WHERE subscription_tier = 'pro';
```

---

## 💰 Pricing Configuration

**Current Pricing:**
- **Free:** $0/month - 50 clips, 100MB storage
- **Pro Monthly:** $4/month - 1,000 clips, 5GB storage
- **Pro Annual:** $40/year - 1,000 clips, 5GB storage (17% discount)

**To Change Pricing:**

1. **In Stripe:** Create new Price for the product
2. **Update environment variables** with new Price ID
3. **Redeploy**

**Note:** Existing subscribers keep their current pricing (Stripe handles this automatically).

---

## 🔐 Security Best Practices

### ✅ DO:
- Use environment variables for all keys
- Never commit secrets to git
- Use test mode for development
- Verify webhook signatures
- Use HTTPS only (Vercel provides this)

### ❌ DON'T:
- Hardcode API keys in code
- Share secret keys publicly
- Use live keys in development
- Skip webhook signature verification

---

## 📝 Checklist

### Development Setup:
- [ ] Stripe account created
- [ ] Test product & prices created
- [ ] Test API keys added to `.env.local`
- [ ] Price IDs added to `.env.local`
- [ ] Test payment successful

### Production Setup:
- [ ] Stripe account fully activated
- [ ] Live product & prices created
- [ ] Live API keys added to Vercel
- [ ] Live Price IDs added to Vercel
- [ ] Webhook endpoint registered
- [ ] Webhook secret added to Vercel
- [ ] Test payment in production
- [ ] Monitor first week of payments

---

## 🆘 Support

**Stripe Issues:**
- Docs: https://stripe.com/docs
- Support: https://support.stripe.com

**PageStash Issues:**
- Check logs: `vercel logs`
- Review: `docs/CLIP_LIMIT_ENFORCEMENT.md`
- Check: `apps/web/src/lib/stripe.ts`

---

**Status:** ⚠️ Requires Configuration  
**Priority:** HIGH (Required for monetization)  
**Estimated Setup Time:** 10-15 minutes

