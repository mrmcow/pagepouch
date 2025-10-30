# Email Not Sending - Troubleshooting Guide

## Quick Checks

### 1. Check Browser Console

After signing up, check the browser console for these logs:

```
🚀 Starting signup for: your@email.com
📧 Signup response: { data: {...}, error: null }
✅ User created: {...}
📮 Email confirmation status: Pending confirmation
📬 Showing confirmation message, check your email!
```

If you don't see these logs, the form might not be submitting correctly.

### 2. Check Supabase Email Settings

Go to your Supabase Dashboard:

1. **Navigate to**: Project → Authentication → Providers
2. **Enable Email Provider**: Make sure it's turned ON
3. **Check Email Templates**: Go to Email Templates and verify they're configured
4. **SMTP Settings**: By default, Supabase uses their own SMTP (limited in dev)

## Common Issues & Solutions

### Issue 1: Email Confirmation Disabled

**Symptom**: User is created but no email sent, and user is immediately logged in.

**Solution**:
1. Go to Supabase Dashboard → Authentication → Settings
2. Find "Email Confirmation" setting
3. Make sure **"Enable email confirmations"** is checked
4. Save changes

### Issue 2: Development Email Limits

**Symptom**: First email worked, but subsequent emails don't send.

**Problem**: Supabase has rate limits on their default SMTP for development:
- Limited to 3-4 emails per hour
- Not suitable for production

**Solution**:
1. For development: Wait 1 hour between tests
2. For production: Configure custom SMTP (see below)

### Issue 3: Site URL Not Configured

**Symptom**: Email sends but confirmation link doesn't work.

**Solution**:
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Set **Site URL** to: `http://localhost:3001` (dev) or `https://yourdomain.com` (prod)
3. Add to **Redirect URLs**:
   ```
   http://localhost:3001/**
   https://yourdomain.com/**
   ```

### Issue 4: Custom SMTP Not Configured (Production)

**Symptom**: Emails work in development but not in production, or rate limits hit quickly.

**Solution**: Configure custom SMTP provider

#### Option A: SendGrid (Recommended)

1. Sign up at https://sendgrid.com (Free tier: 100 emails/day)
2. Create an API key
3. In Supabase Dashboard → Project Settings → Auth:
   ```
   Enable Custom SMTP: ON
   Sender email: noreply@pagepouch.com
   Sender name: PagePouch
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Your SendGrid API Key]
   ```

#### Option B: AWS SES

1. Set up AWS SES
2. Get SMTP credentials
3. Configure in Supabase:
   ```
   Host: email-smtp.us-east-1.amazonaws.com
   Port: 587
   Username: [Your SMTP Username]
   Password: [Your SMTP Password]
   ```

#### Option C: Mailgun

1. Sign up at https://www.mailgun.com
2. Get SMTP credentials
3. Configure in Supabase

### Issue 5: Email in Spam Folder

**Symptom**: Email sent but not in inbox.

**Solution**:
1. Check spam/junk folder
2. Add `noreply@supabase.co` or your custom sender to contacts
3. For production: Use custom domain SMTP (SendGrid, etc.)

### Issue 6: Email Template Errors

**Symptom**: Error in Supabase logs about email template.

**Solution**:
1. Go to Authentication → Email Templates
2. Check for syntax errors in HTML
3. Verify all Supabase variables are correct:
   - `{{ .ConfirmationURL }}`
   - `{{ .Email }}`
   - Use double curly braces

## Testing Email Delivery

### Development Test

1. Open browser console
2. Sign up with your email
3. Check console for signup logs
4. Check email inbox (and spam)
5. If not received, check Supabase logs

### Check Supabase Logs

1. Go to Supabase Dashboard
2. Navigate to Logs → Auth Logs
3. Look for email-related errors
4. Check for rate limit warnings

### Manual Email Test

You can manually test email sending via Supabase:

```typescript
// In browser console after logging in
const { data, error } = await supabase.auth.api.sendMagicLinkEmail(
  'your@email.com'
)
console.log({ data, error })
```

## Production Checklist

Before going to production:

- [ ] Custom SMTP configured (SendGrid/AWS SES/Mailgun)
- [ ] Site URL set to production domain
- [ ] Email templates updated with beautiful branded design
- [ ] Sender email verified (required by most SMTP providers)
- [ ] SPF/DKIM records configured (for better deliverability)
- [ ] Test signup flow end-to-end
- [ ] Monitor email delivery rates

## Email Deliverability Best Practices

### 1. Use Custom Domain

Instead of `noreply@supabase.co`, use `noreply@pagepouch.com`

### 2. Configure SPF Record

Add to your DNS:
```
v=spf1 include:sendgrid.net ~all
```

### 3. Configure DKIM

Follow your SMTP provider's DKIM setup guide.

### 4. Warm Up IP (Production)

When first launching:
- Start with low email volumes
- Gradually increase over 2-4 weeks
- Helps establish sender reputation

## Debugging Commands

### Check Supabase Connection

```typescript
// In browser console
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)
```

### Check Auth Settings

```typescript
// In browser console
const { data, error } = await supabase.auth.getUser()
console.log('User:', data, error)
```

### Force Resend Confirmation Email

```typescript
// In signup page, add this button for testing
await supabase.auth.resend({
  type: 'signup',
  email: 'user@example.com'
})
```

## Getting Help

If emails still aren't sending:

1. **Check Supabase Status**: https://status.supabase.com
2. **Review Supabase Logs**: Dashboard → Logs → Auth Logs
3. **Supabase Discord**: https://discord.supabase.com
4. **Check Rate Limits**: You may have hit hourly limit in dev

## Quick Fix for Development

If you need to test without emails:

1. Go to Supabase Dashboard → Authentication → Settings
2. **Disable** "Enable email confirmations"
3. Users will be immediately confirmed (no email needed)
4. **Remember to re-enable for production!**

## Console Log Reference

Successful signup shows:
```
🚀 Starting signup for: user@example.com
📧 Signup response: { data: { user: {...}, session: null }, error: null }
✅ User created: { id: '...', email: 'user@example.com', ... }
📮 Email confirmation status: Pending confirmation
📬 Showing confirmation message, check your email!
```

Error shows:
```
❌ Signup error: { message: "Error description" }
```

Rate limit shows:
```
❌ Signup error: { message: "Email rate limit exceeded" }
```

