# 📧 Supabase Email Production Setup Guide

**Date:** October 30, 2025  
**Status:** Production Configuration Required  
**Primary Email:** support@pagestash.app

---

## 🎯 Overview

This guide explains how to configure Supabase email authentication for production use with your custom domain **pagestash.app**. By default, Supabase uses their own SMTP server which has limitations. For production, you should configure a custom SMTP provider.

---

## 🚨 Current Issue

**Problem:** Supabase's default email service has limitations:
- Limited sending capacity
- May get flagged as spam
- No custom "From" address
- Not suitable for production scale

**Solution:** Configure a custom SMTP provider (SendGrid, AWS SES, Mailgun, etc.)

---

## ✅ Option 1: SendGrid (Recommended for Production)

SendGrid offers a generous free tier (100 emails/day) and scales well for production.

### Step 1: Create SendGrid Account

1. Go to https://sendgrid.com/
2. Sign up for free account
3. Verify your email address
4. Complete the account setup wizard

### Step 2: Verify Domain (pagestash.app)

**Why:** This ensures emails come "from" your domain and don't get marked as spam.

1. **In SendGrid Dashboard:**
   - Go to **Settings** → **Sender Authentication**
   - Click **Authenticate Your Domain**

2. **Select DNS Host:**
   - Choose "Other Host" (for Namecheap)
   - Enter domain: `pagestash.app`
   - Click **Next**

3. **Add DNS Records to Namecheap:**
   
   SendGrid will show you DNS records to add. They'll look like:
   
   ```
   CNAME: em1234.pagestash.app → u1234567.wl123.sendgrid.net
   CNAME: s1._domainkey.pagestash.app → s1.domainkey.u1234567.wl123.sendgrid.net
   CNAME: s2._domainkey.pagestash.app → s2.domainkey.u1234567.wl123.sendgrid.net
   ```

   **In Namecheap:**
   - Go to **Domain List** → **Manage** → **Advanced DNS**
   - Click **Add New Record**
   - Add each CNAME record exactly as shown by SendGrid
   - Save changes

4. **Verify in SendGrid:**
   - Wait 5-15 minutes for DNS propagation
   - Click **Verify** in SendGrid
   - Should show green checkmark ✅

### Step 3: Create Sender Identity

1. **In SendGrid Dashboard:**
   - Go to **Settings** → **Sender Authentication**
   - Click **Create a Sender**

2. **Fill in Details:**
   ```
   From Name: PageStash
   From Email Address: noreply@pagestash.app
   Reply To: support@pagestash.app
   Company Address: [Your business address]
   City: [Your city]
   State: [Your state]
   Zip: [Your zip]
   Country: [Your country]
   ```

3. **Verify Email:**
   - SendGrid sends verification to `noreply@pagestash.app`
   - Check your email inbox and click verification link
   - ⚠️ **Important:** You need a working inbox for `noreply@pagestash.app` or use `support@pagestash.app` instead

### Step 4: Create API Key

1. **In SendGrid Dashboard:**
   - Go to **Settings** → **API Keys**
   - Click **Create API Key**

2. **Configure API Key:**
   ```
   Name: PageStash Production
   API Key Permissions: Full Access (or "Mail Send" only)
   ```

3. **Copy API Key:**
   - ⚠️ **IMPORTANT:** Copy and save this immediately!
   - It will only be shown once
   - Format: `SG.xxxxxxxxxxxxxxxxxxxx`

### Step 5: Configure Supabase

1. **Go to Supabase Dashboard:**
   - https://app.supabase.com
   - Select your PageStash project

2. **Navigate to Auth Settings:**
   - Click **Authentication** in sidebar
   - Click **Settings** tab
   - Scroll to **SMTP Settings**

3. **Enable Custom SMTP:**
   - Toggle **Enable Custom SMTP** to ON

4. **Enter SMTP Configuration:**
   ```
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   SMTP Username: apikey
   SMTP Password: [Your SendGrid API Key - starts with SG.]
   
   Sender Email: noreply@pagestash.app
   Sender Name: PageStash
   
   Admin Email: support@pagestash.app
   ```

5. **Save Configuration**

### Step 6: Update Email Templates

1. **In Supabase Dashboard:**
   - Still in **Authentication** → **Settings**
   - Scroll to **Email Templates** section

2. **Update Each Template:**

   **Confirm Signup:**
   - Click **Confirm signup** template
   - Update support link: `mailto:support@pagestash.app`
   - Update sender: `PageStash <noreply@pagestash.app>`
   - Save

   **Magic Link:**
   - Click **Magic Link** template
   - Update support link: `mailto:support@pagestash.app`
   - Update sender: `PageStash <noreply@pagestash.app>`
   - Save

   **Reset Password:**
   - Click **Change Email Address** template
   - Update support link: `mailto:support@pagestash.app`
   - Update sender: `PageStash <noreply@pagestash.app>`
   - Save

   **Invite User:**
   - Click **Invite user** template
   - Update support link: `mailto:support@pagestash.app`
   - Update sender: `PageStash <noreply@pagestash.app>`
   - Save

3. **Optional: Use Custom HTML Templates**
   
   You have custom templates in `docs/email-templates/`:
   - `confirm-signup.html`
   - `magic-link.html`
   - `reset-password.html`
   
   **To use these:**
   - Copy HTML from each file
   - Paste into corresponding Supabase template
   - Replace support email with `support@pagestash.app`
   - Test thoroughly!

### Step 7: Test Email Delivery

1. **Test Signup Email:**
   - Go to https://pagestash.app/auth/signup
   - Create a test account with a real email you can access
   - Check email arrives
   - Click confirmation link
   - Verify account activates

2. **Test Password Reset:**
   - Go to https://pagestash.app/auth/forgot-password
   - Request password reset for test account
   - Check email arrives
   - Click reset link
   - Verify reset page loads

3. **Test Magic Link:**
   - Go to https://pagestash.app/auth/login
   - Use magic link option
   - Check email arrives
   - Click magic link
   - Verify logs you in

4. **Check Email Quality:**
   - Not in spam folder ✅
   - From address shows "PageStash" ✅
   - Reply-to goes to support@pagestash.app ✅
   - Links work correctly ✅
   - Formatting looks good ✅

---

## ✅ Option 2: AWS SES (Best for Scale)

AWS Simple Email Service is the most scalable option but requires more setup.

### Pros:
- Extremely scalable
- Very low cost ($0.10 per 1,000 emails)
- High deliverability
- Used by major companies

### Cons:
- More complex setup
- Requires AWS account
- Needs domain verification
- Initial "sandbox" mode restrictions

### Quick Setup Steps:

1. **Create AWS Account:** https://aws.amazon.com
2. **Navigate to SES:** AWS Console → Simple Email Service
3. **Verify Domain:** Add DNS records to Namecheap
4. **Request Production Access:** Submit request to leave sandbox mode
5. **Create SMTP Credentials:** Generate username/password
6. **Configure Supabase:**
   ```
   SMTP Host: email-smtp.[region].amazonaws.com
   SMTP Port: 587
   SMTP Username: [Your AWS SMTP username]
   SMTP Password: [Your AWS SMTP password]
   ```

**Full AWS SES Guide:** https://docs.aws.amazon.com/ses/

---

## ✅ Option 3: Mailgun (Good Alternative)

Mailgun is another solid option with good free tier.

### Free Tier:
- 5,000 emails/month free
- Good deliverability
- Easy setup

### Quick Setup:
1. Sign up at https://www.mailgun.com/
2. Verify domain (add DNS records to Namecheap)
3. Get SMTP credentials
4. Configure in Supabase:
   ```
   SMTP Host: smtp.mailgun.org
   SMTP Port: 587
   SMTP Username: postmaster@pagestash.app
   SMTP Password: [Your Mailgun SMTP password]
   ```

---

## ✅ Option 4: Resend (Developer-Friendly)

Resend is a modern email API designed for developers.

### Pros:
- Very developer-friendly
- Clean API
- Good React email templates
- 100 emails/day free

### Setup:
1. Sign up at https://resend.com/
2. Verify domain
3. Get API key
4. Configure in Supabase

**Note:** Resend is newer but has excellent reviews from developers.

---

## 🎯 Recommendation

**For PageStash Production:**

1. **Start with SendGrid** (easiest to set up)
   - Free tier: 100 emails/day
   - Easy domain verification
   - Good deliverability
   - Simple SMTP setup

2. **Scale to AWS SES** (when you grow)
   - Move when you need > 3,000 emails/month
   - Much cheaper at scale
   - Best deliverability
   - Used by major companies

---

## 📋 Production Checklist

Before going live, verify:

- [ ] Custom SMTP provider configured (SendGrid/AWS/Mailgun)
- [ ] Domain verified (DNS records added to Namecheap)
- [ ] Sender identity verified
- [ ] SMTP credentials added to Supabase
- [ ] All email templates updated with `support@pagestash.app`
- [ ] Test signup email works
- [ ] Test password reset email works
- [ ] Test magic link email works
- [ ] Emails not going to spam
- [ ] From address shows "PageStash"
- [ ] Reply-to goes to support@pagestash.app
- [ ] All links in emails work correctly
- [ ] Emails display correctly on mobile
- [ ] Emails display correctly in Gmail, Outlook, Apple Mail

---

## 🔒 Security Best Practices

### API Key Management:

1. **Never commit API keys to git**
   - Store in Supabase dashboard only
   - Or use environment variables

2. **Use least privilege**
   - SendGrid: Use "Mail Send" permission only (not Full Access)
   - AWS: Use IAM role with SES send-only permissions

3. **Rotate keys periodically**
   - Change API keys every 6-12 months
   - Update in Supabase when changed

### Email Security:

1. **SPF Record:** Automatically set by SendGrid/AWS when you verify domain
2. **DKIM:** Automatically configured by email provider
3. **DMARC:** Optional but recommended for production
   ```
   TXT Record: _dmarc.pagestash.app
   Value: v=DMARC1; p=quarantine; rua=mailto:support@pagestash.app
   ```

---

## 🚨 Common Issues & Solutions

### Issue 1: Emails Going to Spam

**Causes:**
- Domain not verified
- SPF/DKIM not configured
- "From" address doesn't match domain
- New domain (needs reputation)

**Solutions:**
- Verify domain in email provider
- Check SPF/DKIM records in Namecheap DNS
- Use `noreply@pagestash.app` as sender (not Gmail)
- Warm up domain (start with small sending volumes)

### Issue 2: Emails Not Arriving

**Causes:**
- SMTP credentials incorrect
- API key invalid or expired
- Sender email not verified
- SendGrid account suspended

**Solutions:**
- Double-check SMTP settings in Supabase
- Regenerate API key in SendGrid
- Verify sender identity
- Check SendGrid dashboard for issues

### Issue 3: Links in Emails Not Working

**Causes:**
- Site URL not configured in Supabase
- Redirect URLs not whitelisted
- Email template variables incorrect

**Solutions:**
- Check Supabase → Settings → General → Site URL should be `https://pagestash.app`
- Add redirect URLs: `https://pagestash.app/**`
- Test email template variables

---

## 📊 Monitoring & Analytics

### SendGrid Dashboard:
- Track email delivery rates
- Monitor bounce rates
- Check spam reports
- View open rates (if tracking enabled)

### Supabase Logs:
- Go to Supabase → Logs
- Filter by "Auth"
- Monitor successful/failed email sends

### Set Up Alerts:
- SendGrid: Set up alerts for bounce rates > 5%
- AWS: CloudWatch alerts for SES bounces
- Check daily for first month after launch

---

## 🎯 Post-Setup

After configuration:

1. **Document Your Setup:**
   - Which provider (SendGrid/AWS/other)
   - API key location (in Supabase only)
   - Sender email used
   - Date configured

2. **Train Your Team:**
   - How to check email delivery
   - Where to view logs
   - Who has access to email provider

3. **Monitor for 48 Hours:**
   - Check all emails arrive
   - Verify deliverability
   - Monitor for spam issues

4. **Set Up Billing Alerts:**
   - SendGrid: Set alert if approaching free tier limit
   - AWS: Set billing alarm for unexpected costs

---

## 📞 Support Resources

### SendGrid:
- Documentation: https://docs.sendgrid.com/
- Support: https://support.sendgrid.com/
- Community: https://community.sendgrid.com/

### AWS SES:
- Documentation: https://docs.aws.amazon.com/ses/
- Support: AWS Support (paid)
- Forums: https://forums.aws.amazon.com/

### Supabase:
- Documentation: https://supabase.com/docs/guides/auth/auth-email-templates
- Discord: https://discord.supabase.com/
- Support: support@supabase.io

---

## ✅ Success Criteria

You'll know everything is working when:

✅ **Users can:**
- Sign up and receive confirmation email
- Reset password and receive reset email
- Use magic link and receive login email

✅ **Emails:**
- Arrive within 1-2 minutes
- Not in spam folder
- Show "PageStash" as sender
- Have working links
- Reply goes to support@pagestash.app

✅ **Monitoring:**
- Delivery rate > 95%
- Bounce rate < 5%
- No spam complaints
- All templates working

---

*Last Updated: October 30, 2025*  
*Ready for Production Deployment*

