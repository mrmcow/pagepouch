# 🌐 PageStash Domain Setup Guide

**Domain:** `pagestash.app`  
**Registrar:** Namecheap  
**Hosting:** Vercel  
**Date:** October 30, 2025

---

## 📋 Complete Setup Checklist

### Phase 1: Vercel Domain Configuration (5 minutes)

1. **Log into Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Select your PageStash project (`pagepouch` or whatever it's named)

2. **Add Custom Domain**
   - Click on **Settings** tab
   - Navigate to **Domains** section
   - Click **Add Domain**
   - Enter: `pagestash.app`
   - Click **Add**

3. **Add WWW Subdomain (Recommended)**
   - Click **Add Domain** again
   - Enter: `www.pagestash.app`
   - Click **Add**
   - Vercel will automatically offer to redirect this to your primary domain

4. **Note DNS Records**
   Vercel will show you DNS records to add:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

---

### Phase 2: Namecheap DNS Configuration (5 minutes)

1. **Log into Namecheap**
   - Go to https://www.namecheap.com
   - Navigate to **Domain List**
   - Click **Manage** next to `pagestash.app`

2. **Configure Nameservers**
   
   **Option A: Use Namecheap DNS (Recommended for simplicity)**
   - Under **Nameservers**, select **Namecheap BasicDNS**
   - Click **Advanced DNS** tab
   
   **Option B: Use Vercel Nameservers (Advanced)**
   - Select **Custom DNS**
   - Add Vercel nameservers (if provided)

3. **Add DNS Records (if using Namecheap DNS)**
   
   Click **Advanced DNS** → **Add New Record**
   
   **Record 1 - Root Domain:**
   ```
   Type: A Record
   Host: @
   Value: 76.76.21.21
   TTL: Automatic
   ```
   
   **Record 2 - WWW Subdomain:**
   ```
   Type: CNAME Record
   Host: www
   Value: cname.vercel-dns.com.
   TTL: Automatic
   ```
   
   **Record 3 - Vercel Verification (if required):**
   ```
   Type: TXT Record
   Host: @
   Value: [Vercel will provide this]
   TTL: Automatic
   ```

4. **Remove Old Records**
   - Delete any existing A records pointing elsewhere
   - Delete old parking page records
   - Keep MX records if you have email configured

5. **Save Changes**
   - Click **Save All Changes**
   - DNS propagation can take 1-48 hours (usually 15 minutes)

---

### Phase 3: Vercel Redirect Configuration

#### Option 1: Configure Primary Domain

In Vercel Dashboard → Domains:

1. **Set Primary Domain**
   - Click on `pagestash.app`
   - Set as **Primary Domain** (if not already)

2. **Configure WWW Redirect**
   - `www.pagestash.app` should show "Redirect to pagestash.app"
   - This is automatic when you add both domains

#### Option 2: Add Redirects in vercel.json

Create or update `vercel.json` in your project root:

```json
{
  "redirects": [
    {
      "source": "/",
      "has": [
        {
          "type": "host",
          "value": "www.pagestash.app"
        }
      ],
      "destination": "https://pagestash.app",
      "permanent": true
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

---

### Phase 4: Update Environment Variables & Configuration

1. **Update Supabase Redirect URLs**
   - Go to Supabase Dashboard
   - Navigate to **Authentication** → **URL Configuration**
   - Add redirect URLs:
     ```
     https://pagestash.app
     https://pagestash.app/auth/callback
     https://pagestash.app/**
     ```
   - Keep localhost URLs for development

2. **Update Environment Variables in Vercel**
   - Vercel Dashboard → Settings → Environment Variables
   - Update any URLs that reference domain:
     ```
     NEXT_PUBLIC_SITE_URL=https://pagestash.app
     NEXT_PUBLIC_API_URL=https://pagestash.app/api
     ```

3. **Update Stripe Configuration (if applicable)**
   - Stripe Dashboard → Settings → Branding
   - Update website URL: `https://pagestash.app`
   - Update webhook endpoints if any

4. **Update Browser Extension URLs**
   - Update `SUPABASE_URL` references if hardcoded
   - Update any API endpoints that point to your domain

---

### Phase 5: Testing & Verification (15 minutes)

#### DNS Propagation Check
```bash
# Check if DNS has propagated
dig pagestash.app
dig www.pagestash.app

# Should show:
# pagestash.app -> 76.76.21.21
# www.pagestash.app -> CNAME to vercel
```

Or use online tools:
- https://dnschecker.org
- https://www.whatsmydns.net

#### Verification Checklist

- [ ] **Root domain works:** https://pagestash.app loads correctly
- [ ] **WWW redirect works:** https://www.pagestash.app redirects to pagestash.app
- [ ] **SSL certificate:** Lock icon appears (auto-provisioned by Vercel)
- [ ] **Homepage loads:** All content displays correctly
- [ ] **Authentication works:** Sign up / Login functions properly
- [ ] **API routes work:** Test dashboard, clips, etc.
- [ ] **Blog posts load:** Check `/blog` and individual posts
- [ ] **Extension downloads:** Test extension download links
- [ ] **Stripe webhooks:** Test if payment system works (if applicable)

#### Test Authentication Flow
1. Sign up with new account
2. Verify email redirect URL is correct
3. Test magic link (if enabled)
4. Test password reset flow

#### Test Extension Integration
1. Install Chrome extension
2. Login through extension
3. Capture a test page
4. Verify it appears in dashboard at `pagestash.app/dashboard`

---

### Phase 6: Update External References

1. **Update GitHub Repository**
   - Update repository URL/homepage in `package.json`
   - Update README.md with new domain
   - Update any documentation links

2. **Update Chrome Web Store** (when submitting)
   - Developer website: `https://pagestash.app`
   - Privacy policy URL: `https://pagestash.app/privacy`
   - Terms of service: `https://pagestash.app/terms`

3. **Update Firefox Add-ons** (when submitting)
   - Homepage: `https://pagestash.app`
   - Support URL: `https://pagestash.app/blog`

4. **Update Social Media / Marketing**
   - Update any social media profiles
   - Update email signatures
   - Update marketing materials

---

## 🔧 Troubleshooting

### Domain Not Loading

**Check 1: DNS Propagation**
```bash
dig pagestash.app
# If it doesn't show 76.76.21.21, DNS hasn't propagated yet
```
**Solution:** Wait 15-60 minutes, then check again

**Check 2: Vercel Domain Status**
- Vercel Dashboard → Domains
- Status should show "Valid Configuration"
- If "Invalid Configuration", check DNS records

**Check 3: SSL Certificate**
- Vercel auto-provisions SSL
- Can take 1-5 minutes after DNS propagates
- Check: Settings → Domains → SSL status

### WWW Not Redirecting

**Check:** Vercel Dashboard → Domains → www.pagestash.app
- Should show "Redirect to pagestash.app"
- If not, click "Edit" and set redirect

### Authentication Not Working

**Check:** Supabase redirect URLs
- Must include `https://pagestash.app/auth/callback`
- Must include `https://pagestash.app/**`

**Check:** Environment variables
- `NEXT_PUBLIC_SITE_URL` must match domain
- Redeploy after updating env vars

### API Routes Returning 404

**Check:** Deployment status in Vercel
- Latest deployment should be live on pagestash.app
- Check build logs for errors

**Solution:** Redeploy if needed:
```bash
git commit --allow-empty -m "Trigger redeploy for domain"
git push origin main
```

---

## 📊 Post-Launch Monitoring

### Week 1 Checklist
- [ ] Monitor Vercel Analytics for traffic
- [ ] Check error logs for domain-related issues
- [ ] Verify email delivery (auth emails, notifications)
- [ ] Test from multiple locations/networks
- [ ] Check mobile responsiveness
- [ ] Monitor Supabase usage/errors
- [ ] Test extension on fresh install

### Update Internal Links
Search codebase for any hardcoded localhost URLs:
```bash
grep -r "localhost:3000" apps/web/src
grep -r "http://localhost" apps/extension/src
```

---

## 🎯 Quick Reference

### DNS Settings Summary
```
Domain: pagestash.app
Nameservers: Namecheap BasicDNS (or Vercel's)

A Record:     @ → 76.76.21.21
CNAME Record: www → cname.vercel-dns.com
```

### Vercel Settings
```
Primary Domain: pagestash.app
Redirect: www.pagestash.app → pagestash.app
SSL: Auto (Let's Encrypt)
```

### Important URLs to Update
- Supabase redirect URLs
- Environment variables (NEXT_PUBLIC_SITE_URL)
- Stripe settings
- Extension manifest homepage_url
- OAuth callbacks (if any)

---

## 🚀 You're Live!

Once DNS propagates and all checks pass:
1. Announce the launch! 🎉
2. Update all external links
3. Monitor for any issues
4. Consider setting up analytics
5. Set up error monitoring (Sentry, etc.)

**Your PageStash platform is now live at https://pagestash.app!**

---

## 📞 Support Resources

- **Vercel Documentation:** https://vercel.com/docs/concepts/projects/domains
- **Namecheap DNS Guide:** https://www.namecheap.com/support/knowledgebase/article.aspx/767/10/how-to-change-dns-for-a-domain/
- **DNS Checker:** https://dnschecker.org
- **SSL Test:** https://www.ssllabs.com/ssltest/

---

*Last Updated: October 30, 2025*
*PageStash Team*

