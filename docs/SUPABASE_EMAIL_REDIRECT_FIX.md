# Supabase Email Redirect Configuration

**Last Updated:** November 1, 2025  
**Critical Issue:** Password reset and signup links redirect to homepage instead of correct pages

---

## 🚨 The Problem

When users click email links, they get redirected to the homepage instead of:
- `/auth/reset-password` (for password resets)
- `/dashboard` (for signup confirmations)

---

## 🎯 The Solution

Configure the **"Redirect URL"** field in EACH Supabase email template.

> **Important:** This is DIFFERENT from the "Redirect URLs" whitelist on the URL Configuration page!

---

## 📍 Where to Find It

### Step 1: Open Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Select your **pagepouch** project
3. Click **Authentication** in the left sidebar
4. Click **Email Templates** in the sub-menu

### Step 2: Configure Each Template

You'll see a list of email templates:
- ✅ Confirm signup
- 🔑 Reset password  
- 🔗 Magic Link
- 📧 Change Email Address
- 📧 Invite user

---

## 🔧 Configuration for Each Template

### 1. Confirm Signup Template

**Steps:**
1. Click **"Confirm signup"** in the template list
2. Scroll down past the HTML template editor
3. Find the **"Redirect URL"** field
4. Enter exactly:
   ```
   {{ .SiteURL }}/auth/callback?next=/dashboard
   ```
5. Click **Save**

**What This Does:**
- User clicks confirmation link in email
- Goes to: `https://pagestash.app/auth/callback?next=/dashboard`
- Callback exchanges auth code for session
- Redirects to: `/dashboard`

---

### 2. Reset Password Template

**Steps:**
1. Click **"Reset password"** in the template list
2. Scroll down past the HTML template editor
3. Find the **"Redirect URL"** field
4. Enter exactly:
   ```
   {{ .SiteURL }}/auth/callback?next=/auth/reset-password
   ```
5. Click **Save**

**What This Does:**
- User clicks reset link in email
- Goes to: `https://pagestash.app/auth/callback?next=/auth/reset-password`
- Callback exchanges auth code for session
- Redirects to: `/auth/reset-password`
- User can now enter new password

---

### 3. Magic Link Template (Optional)

**Steps:**
1. Click **"Magic Link"** in the template list
2. Scroll down past the HTML template editor
3. Find the **"Redirect URL"** field
4. Enter exactly:
   ```
   {{ .SiteURL }}/auth/callback?next=/dashboard
   ```
5. Click **Save**

**Note:** Only needed if you enable Magic Link authentication.

---

## 🧪 Testing After Configuration

### Test Password Reset:
1. Go to `https://pagestash.app/auth/forgot-password`
2. Enter your email
3. Check email and click "Reset Password"
4. **Expected:** Redirects to `https://pagestash.app/auth/reset-password`
5. **Wrong:** Redirects to `https://pagestash.app` (homepage)

### Test Signup Confirmation:
1. Go to `https://pagestash.app/auth/signup`
2. Create new account
3. Check email and click "Confirm Account"
4. **Expected:** Redirects to `https://pagestash.app/dashboard`
5. **Wrong:** Redirects to `https://pagestash.app` (homepage)

---

## 📝 Understanding the Redirect Flow

### The Full Flow:
```
1. User requests password reset
   ↓
2. Supabase sends email with link:
   https://pagestash.app/auth/callback?token=ABC123&type=recovery&next=/auth/reset-password
   ↓
3. User clicks link
   ↓
4. /auth/callback route:
   - Exchanges token for session (logs user in)
   - Reads "next" parameter
   ↓
5. Redirects to: /auth/reset-password
   ↓
6. User enters new password
```

### Why We Need `/auth/callback`:
- Supabase sends a **code**, not a session
- The code must be **exchanged** for a session
- Our `/auth/callback` route handles this exchange
- Then redirects to the final destination

---

## 🔍 Common Mistakes

### ❌ Wrong: Leaving Redirect URL blank
**Result:** Homepage redirect (bad UX)

### ❌ Wrong: Using the final page directly
```
{{ .SiteURL }}/auth/reset-password
```
**Result:** No session established, password reset fails

### ✅ Correct: Using callback with next parameter
```
{{ .SiteURL }}/auth/callback?next=/auth/reset-password
```
**Result:** Session established, then redirected to reset page

---

## 🎯 Quick Checklist

After configuration, verify:

- [ ] Confirm Signup redirect URL configured
- [ ] Reset Password redirect URL configured
- [ ] Magic Link redirect URL configured (if used)
- [ ] Site URL is `https://pagestash.app`
- [ ] Redirect URLs whitelist includes `https://pagestash.app/**`
- [ ] Tested password reset flow end-to-end
- [ ] Tested signup confirmation flow end-to-end

---

## 🆘 Still Having Issues?

### Check Your Site URL:
1. Go to: **Authentication → URL Configuration**
2. Verify **Site URL** is: `https://pagestash.app`
3. Verify **Redirect URLs** includes:
   ```
   https://pagestash.app/**
   https://www.pagestash.app/**
   http://localhost:3001/** (for development)
   http://localhost:3000/** (for development)
   ```

### Check Browser Console:
1. Open DevTools (F12)
2. Go to Console tab
3. Trigger password reset
4. Look for error messages or redirect logs

### Check Supabase Logs:
1. Go to: **Logs → Auth Logs**
2. Look for:
   - Email sent events
   - Token exchange events
   - Redirect events
   - Error messages

---

## 📚 Related Documentation

- [EMAIL_PRODUCTION_CHECKLIST.md](./EMAIL_PRODUCTION_CHECKLIST.md) - Full email setup guide
- [STRIPE_SETUP.md](./STRIPE_SETUP.md) - Stripe billing setup
- [EXTENSION_DEPLOYMENT.md](./EXTENSION_DEPLOYMENT.md) - Extension deployment guide

---

## 💡 Why This Isn't Documented Better

This is a common gotcha with Supabase email templates:
- The "Redirect URL" field is BELOW the template editor (easy to miss)
- It's different from the "Redirect URLs" whitelist (confusing naming)
- If left blank, Supabase defaults to the Site URL (homepage)
- Most tutorials don't mention this step

**Now you know!** 🎉

