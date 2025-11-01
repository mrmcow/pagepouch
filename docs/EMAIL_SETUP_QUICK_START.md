# 🚀 Email Setup Quick Start (15 Minutes)

**Goal:** Get production-ready branded emails working in Supabase

---

## Step 1: Access Supabase Dashboard (2 min)

1. Go to https://app.supabase.com
2. Select your PageStash project
3. Click **Authentication** in the left sidebar

---

## Step 2: Configure URLs (3 min)

1. Click **URL Configuration**
2. Set these values:

**Site URL:**
```
https://pagestash.app
```

**Redirect URLs (add all three):**
```
https://pagestash.app/**
https://www.pagestash.app/**
http://localhost:3001/**
```

3. Click **Save**

---

## Step 3: Update Email Templates (5 min)

### A. Confirm Signup Email

1. Click **Email Templates** (under Authentication)
2. Click **Confirm signup**
3. Replace the entire content with the HTML from:
   - **File:** `docs/email-templates/confirm-signup.html`
   - Open the file and copy ALL content
4. **Subject:** Keep as default or use: `Confirm your PageStash account`
5. Click **Save**

### B. Reset Password Email  

1. Click **Reset Password** (or "Change Email Address")
2. Replace the entire content with the HTML from:
   - **File:** `docs/email-templates/reset-password.html`
   - Open the file and copy ALL content
3. **Subject:** Keep as default or use: `Reset your PageStash password`
4. Click **Save**

### C. Magic Link Email (Optional)

1. Click **Magic Link**
2. Replace the entire content with the HTML from:
   - **File:** `docs/email-templates/magic-link.html`
   - Open the file and copy ALL content
3. **Subject:** Keep as default or use: `Sign in to PageStash`
4. Click **Save**

---

## Step 4: Configure SMTP (5 min) - CRITICAL!

**⚠️ Without this, emails will be rate-limited (only ~4 per hour)**

### Option A: SendGrid (Easiest)

1. Go to https://sendgrid.com and sign up (Free: 100 emails/day)
2. Create API Key:
   - Dashboard → Settings → API Keys
   - Click "Create API Key"
   - Name it "PageStash Production"
   - Choose "Full Access"
   - Copy the API key (you won't see it again!)

3. Back in Supabase:
   - Go to **Project Settings** → **Auth** → **SMTP Settings**
   - Toggle **Enable Custom SMTP** to ON
   - Fill in:

```
Sender Name: PageStash
Sender Email: noreply@pagestash.app
Host: smtp.sendgrid.net
Port: 587
Minimum TLS Version: TLSv1.2
Username: apikey
Password: [Paste your SendGrid API Key here]
```

4. Click **Save**

---

## Step 5: Test Everything (5 min)

### Test Signup Email

1. **Open Incognito/Private Window**
2. Go to: https://pagestash.app/auth/signup
3. Sign up with a **real email you can access**
4. Check your inbox (and spam folder!)
5. Click the confirmation link
6. Verify you're redirected to the dashboard

### Test Password Reset

1. **Open Incognito/Private Window**
2. Go to: https://pagestash.app/auth/forgot-password
3. Enter an existing user email
4. Check your inbox
5. Click the reset link
6. Verify you can set a new password

---

## ✅ Success Checklist

After completing all steps, verify:

- [ ] Received signup confirmation email
- [ ] Signup email looks professional (blue gradient, PageStash branding)
- [ ] Confirmation link works and redirects to dashboard
- [ ] Received password reset email
- [ ] Password reset link works
- [ ] Emails arrive in < 30 seconds
- [ ] Emails are NOT in spam folder
- [ ] Tested on Gmail, Outlook, or Apple Mail
- [ ] Mobile display looks good (if possible)

---

## 🚨 Troubleshooting

### "I'm not receiving emails"

1. **Check spam folder first!**
2. Go to Supabase Dashboard → **Logs** → **Auth**
3. Look for email-related errors
4. Common causes:
   - SMTP not configured (rate limit hit)
   - Wrong SMTP credentials
   - Site URL incorrect
   - Redirect URL not whitelisted

### "Email arrives but link doesn't work"

**Symptom:** Click link → 404 or error page

**Solution:** Check Site URL and Redirect URLs are correct in Step 2

### "Email goes to spam"

**Short-term:** Ask users to check spam and whitelist `noreply@pagestash.app`

**Long-term:** Configure SPF/DKIM records (see main checklist)

### "Link expired" error

**Cause:** Email confirmation links expire:
- Signup: 24 hours
- Password reset: 1 hour

**Solution:** User must request a new link

---

## 📊 Verify SMTP is Working

**Quick Check:**

1. Sign up with a test email
2. Go to your SMTP provider dashboard (e.g., SendGrid)
3. Check the activity/logs
4. You should see 1 email sent

**If you see nothing:**
- SMTP credentials might be wrong
- SMTP settings not saved in Supabase
- Check Supabase Auth logs for errors

---

## 🎯 Next Steps After Setup

### For Production Launch:

1. **Test from multiple email providers:**
   - Gmail
   - Outlook/Hotmail
   - Yahoo
   - Apple Mail
   - Corporate email

2. **Test on multiple devices:**
   - Desktop
   - Mobile iOS
   - Mobile Android

3. **Monitor for first week:**
   - Check Supabase Auth logs daily
   - Monitor SMTP provider dashboard
   - Watch for user reports of "no email"

4. **Consider DNS setup (optional but recommended):**
   - Add SPF record for your SMTP provider
   - Configure DKIM
   - Add DMARC policy
   - This reduces spam folder issues

### Documentation for Users:

Create a help article:
- "I didn't receive a confirmation email"
- Check spam folder
- Request new confirmation email
- Contact support if still issues

---

## 📞 Need Help?

**Supabase Issues:**
- Docs: https://supabase.com/docs/guides/auth/auth-email
- Support: https://supabase.com/support

**SendGrid Issues:**
- Docs: https://docs.sendgrid.com
- Support: https://support.sendgrid.com

**PageStash Issues:**
- Email: support@pagestash.app
- Check: `docs/EMAIL_TROUBLESHOOTING.md`

---

## ⚡ Super Quick Mode (5 min minimum)

**If you're in a rush, do these critical items:**

1. ✅ Step 2: Configure URLs in Supabase
2. ✅ Step 3A: Update Confirm Signup template
3. ✅ Step 3B: Update Reset Password template
4. ✅ Step 4: Configure SMTP (SendGrid)
5. ✅ Test signup once with your email

**Then test the rest later before launch.**

---

**Time to Complete:** 10-20 minutes  
**Difficulty:** Easy (mostly copy-paste)  
**Priority:** CRITICAL for launch  
**Status:** Ready to deploy

