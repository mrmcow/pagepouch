# Stripe Integration Setup Guide

## 🎯 **Quick Setup Checklist**

### **1. Stripe Account Setup**
- [ ] Create Stripe account at https://stripe.com
- [ ] Get API keys from Stripe Dashboard → Developers → API keys
- [ ] Set up webhook endpoint

### **2. Environment Variables**
Add these to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs (create these in step 3)
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=price_your_monthly_price_id
NEXT_PUBLIC_STRIPE_PRICE_ANNUAL=price_your_annual_price_id

# Required for webhooks
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### **3. Create Stripe Products & Prices**

#### **Option A: Using Stripe Dashboard**
1. Go to Stripe Dashboard → Products
2. Click "Add product"
3. Create **PagePouch Pro**:
   - Name: `PagePouch Pro`
   - Description: `1,000 clips per month, 5GB storage, advanced features`
4. Add pricing:
   - **Monthly**: $4.00 USD, recurring monthly
   - **Annual**: $40.00 USD, recurring yearly
5. Copy the Price IDs to your environment variables

#### **Option B: Using Stripe CLI (Recommended)**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to your account
stripe login

# Create product
stripe products create \
  --name="PagePouch Pro" \
  --description="1,000 clips per month, 5GB storage, advanced features"

# Create monthly price (replace prod_xxx with your product ID)
stripe prices create \
  --unit-amount=400 \
  --currency=usd \
  --recurring-interval=month \
  --product=prod_xxx

# Create annual price
stripe prices create \
  --unit-amount=4000 \
  --currency=usd \
  --recurring-interval=year \
  --product=prod_xxx
```

### **4. Database Migration**
Run the Stripe migration to add required fields:

```sql
-- Run this in your Supabase SQL editor
-- File: docs/stripe-migration.sql

ALTER TABLE public.users 
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN stripe_subscription_id TEXT,
ADD COLUMN subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN subscription_period_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN subscription_period_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN subscription_cancel_at_period_end BOOLEAN DEFAULT FALSE;

-- Create indexes
CREATE INDEX idx_users_stripe_customer_id ON public.users(stripe_customer_id);
CREATE INDEX idx_users_subscription_status ON public.users(subscription_status);
```

### **5. Webhook Configuration**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Set endpoint URL: `https://your-domain.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook secret to your environment variables

### **6. Test the Integration**

#### **Local Testing with Stripe CLI**
```bash
# Forward webhooks to local development
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Test a payment (in another terminal)
stripe trigger checkout.session.completed
```

#### **Manual Testing**
1. Start your development server: `npm run dev`
2. Go to `/dashboard` and try to upgrade
3. Use Stripe test card: `4242 4242 4242 4242`
4. Check that user is upgraded in database

## 🚀 **Production Deployment**

### **1. Switch to Live Mode**
- Get live API keys from Stripe Dashboard
- Update environment variables in Vercel/production
- Update webhook endpoint to production URL

### **2. Webhook Security**
- Ensure webhook secret is properly set
- Verify webhook signature validation is working
- Monitor webhook delivery in Stripe Dashboard

### **3. Customer Portal Setup**
- Enable Customer Portal in Stripe Dashboard → Settings → Billing → Customer Portal
- Configure allowed features (cancel subscription, update payment method, etc.)

## 🔧 **API Endpoints Created**

- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/webhook` - Handle Stripe webhooks
- `POST /api/stripe/portal` - Customer billing portal
- `GET /api/subscription` - Get subscription status

## 🎯 **Testing Scenarios**

### **Successful Upgrade Flow**
1. User clicks "Upgrade to Pro"
2. Redirected to Stripe Checkout
3. Completes payment with test card
4. Webhook updates user to Pro tier
5. User redirected back with success message

### **Subscription Management**
1. Pro user clicks "Manage Billing"
2. Redirected to Stripe Customer Portal
3. Can update payment method, cancel subscription
4. Webhooks handle status changes

### **Failed Payment**
1. Subscription renewal fails
2. Webhook marks user as `past_due`
3. User sees billing issue notice
4. Can update payment method via portal

## 📊 **Revenue Tracking**

Monitor these metrics in Stripe Dashboard:
- Monthly Recurring Revenue (MRR)
- Churn rate
- Failed payments
- Customer lifetime value

## 🛡️ **Security Checklist**

- [ ] Webhook signatures verified
- [ ] API keys secured in environment variables
- [ ] Service role key restricted to webhook operations
- [ ] Customer data properly isolated with RLS
- [ ] Test mode vs live mode properly configured

---

**Status**: Ready for implementation
**Next**: Set up Stripe account and run through checklist
**Timeline**: 2-3 hours for complete setup

*Last updated: September 25, 2025*
