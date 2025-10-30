# ✅ Vercel Setup Checklist for PageStash

**Domain:** pagestash.app  
**Project:** PageStash  
**Date:** October 30, 2025

---

## 🌐 PART 1: Domain Configuration (5 minutes)

### Step 1: Add Custom Domain to Vercel

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your PageStash project

2. **Navigate to Domains:**
   - Click **Settings** tab
   - Click **Domains** in left sidebar

3. **Add pagestash.app:**
   - Click **Add Domain** button
   - Enter: `pagestash.app`
   - Click **Add**
   
   ✅ Vercel will show DNS instructions

4. **Add www subdomain:**
   - Click **Add Domain** again
   - Enter: `www.pagestash.app`
   - Click **Add**
   - Vercel will auto-configure redirect to main domain

5. **Set Primary Domain:**
   - Click on `pagestash.app`
   - Click **Set as Primary Domain** (if not already)

### Step 2: Verify Domain Status

Check that both domains show:
- ✅ `pagestash.app` - "Valid Configuration" (green checkmark)
- ✅ `www.pagestash.app` - "Redirect to pagestash.app"

**If showing "Invalid Configuration":**
- Wait 5-15 minutes for DNS to propagate
- Check Namecheap DNS settings match Vercel's instructions

---

## 📊 PART 2: Google Analytics Setup (2 minutes)

### Step 3: Add Environment Variable

1. **In Vercel Dashboard:**
   - Still in your PageStash project
   - Click **Settings** tab
   - Click **Environment Variables** in left sidebar

2. **Add GA4 Measurement ID:**
   ```
   Variable Name: NEXT_PUBLIC_GA_MEASUREMENT_ID
   Value: G-Z9PDL75KNC
   
   ✅ Check ALL environments:
   [x] Production
   [x] Preview
   [x] Development
   ```

3. **Click Save**

4. **Redeploy (IMPORTANT!):**
   - Go to **Deployments** tab
   - Click on latest deployment
   - Click **⋯** menu (three dots)
   - Click **Redeploy**
   - ✅ This ensures the new env var is loaded

---

## 🔄 PART 3: Additional Environment Variables (Optional)

### Check These Are Already Set:

1. **Supabase Configuration:**
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   ```

2. **Stripe Configuration** (if using payments):
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   STRIPE_SECRET_KEY
   STRIPE_WEBHOOK_SECRET
   ```

3. **App URL:**
   ```
   NEXT_PUBLIC_APP_URL=https://pagestash.app
   ```

---

## ✅ PART 4: Verification Checklist

### Domain Verification (5-15 minutes after DNS setup):

- [ ] Visit https://pagestash.app
  - Should load PageStash homepage
  - Check for SSL lock icon (🔒)
  
- [ ] Visit https://www.pagestash.app
  - Should redirect to pagestash.app
  
- [ ] Test signup/login
  - Go to https://pagestash.app/auth/signup
  - Create test account
  - Verify email works
  
- [ ] Test dashboard
  - Login and access dashboard
  - Check for any errors in console

### Analytics Verification (Immediate):

- [ ] **Open GA4 Dashboard:**
  - Go to https://analytics.google.com
  - Select PageStash property
  - Click **Reports** → **Realtime**

- [ ] **Test Tracking:**
  - Visit https://pagestash.app in new incognito window
  - You should appear in Realtime report (1-2 second delay)
  - Navigate to a few pages
  - Page views should increment

- [ ] **Test Events:**
  - Click "Install Extension" on homepage
  - Should see `extension_download_clicked` event in GA4 DebugView
  - Or check **Realtime** → **Event count by Event name**

---

## 🚨 Troubleshooting

### Domain Not Loading

**Problem:** pagestash.app shows error or doesn't load

**Solutions:**
1. Check DNS propagation: https://dnschecker.org/?domain=pagestash.app
   - Should show: 76.76.21.21 or similar Vercel IP
   
2. Check Vercel domain status:
   - Should show "Valid Configuration" ✅
   - If not, re-check DNS records in Namecheap

3. Wait 15-30 minutes for full DNS propagation

### Analytics Not Tracking

**Problem:** No data in GA4 Realtime

**Solutions:**
1. Verify env var is set:
   - Vercel → Settings → Environment Variables
   - Check `NEXT_PUBLIC_GA_MEASUREMENT_ID` exists
   
2. Check if redeploy happened:
   - Vercel → Deployments
   - Latest deployment should be AFTER you added env var
   - If not, trigger a redeploy

3. Check browser:
   - Disable ad blockers (uBlock Origin, AdBlock)
   - Try in incognito mode
   - Check DevTools Console for errors

4. Verify script loads:
   - Open DevTools → Network tab
   - Filter by "gtag"
   - Should see: `gtag/js?id=G-Z9PDL75KNC`

### Supabase Auth Not Working

**Problem:** Can't login after domain change

**Solution:**
1. Update Supabase redirect URLs:
   - Supabase Dashboard → Authentication → URL Configuration
   - Add:
     ```
     https://pagestash.app
     https://pagestash.app/auth/callback
     https://pagestash.app/**
     ```
   
2. Keep localhost for development:
   ```
   http://localhost:3000/**
   ```

---

## 📋 Quick Reference: What You Need

### From Namecheap (DNS):
```
A Record:     @ → 76.76.21.21
CNAME Record: www → 9cba353d20bb3ab0b.vercel-dns-017.com
```

### In Vercel (Environment Variables):
```
NEXT_PUBLIC_GA_MEASUREMENT_ID = G-Z9PDL75KNC
NEXT_PUBLIC_APP_URL = https://pagestash.app
[Plus your existing Supabase/Stripe vars]
```

### Expected Timeline:
- Domain setup: 5-30 minutes (DNS propagation)
- Analytics: Immediate (after redeploy)
- SSL Certificate: Automatic (1-5 minutes)

---

## 🎯 Success Criteria

You'll know everything is working when:

✅ **Domain:**
- pagestash.app loads with SSL
- www.pagestash.app redirects
- All pages work (/, /blog, /dashboard, /auth/*)

✅ **Analytics:**
- You appear in GA4 Realtime report
- Page views increment as you navigate
- Extension download clicks are tracked

✅ **Functionality:**
- Signup/login works
- Dashboard loads
- Extension download works
- No console errors

---

## 🚀 You're Ready!

Once you complete these steps, PageStash will be:
- ✅ Live at pagestash.app
- ✅ Tracking all user activity
- ✅ Ready for launch!

**Next Steps After Setup:**
1. Test everything thoroughly
2. Update Supabase redirect URLs
3. Update Stripe settings (if applicable)
4. Monitor GA4 for first 24 hours
5. Start marketing! 🎉

---

*Last Updated: October 30, 2025*  
*PageStash Team*

