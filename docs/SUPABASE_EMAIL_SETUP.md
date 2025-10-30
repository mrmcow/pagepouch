# Supabase Email Template Setup - Quick Start

## 🎯 Quick Setup (5 minutes)

### Step 1: Access Supabase Dashboard

1. Go to https://app.supabase.com
2. Select your PagePouch project
3. Navigate to **Authentication** → **Email Templates**

### Step 2: Configure Site URL

**⚠️ CRITICAL for Production**

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**:
   - Development: `http://localhost:3001`
   - Production: `https://pagepouch.com`

3. Add **Redirect URLs** (whitelist):
   ```
   http://localhost:3001/**
   https://pagepouch.com/**
   https://www.pagepouch.com/**
   ```

### Step 3: Update Email Templates

#### Confirm Signup Email

1. Go to **Email Templates** → **Confirm signup**
2. Copy contents from: `docs/email-templates/confirm-signup.html`
3. Paste and save

#### Reset Password Email

1. Go to **Email Templates** → **Reset Password**
2. Copy contents from: `docs/email-templates/reset-password.html`
3. Paste and save

#### Magic Link Email (Optional)

1. Go to **Email Templates** → **Magic Link**
2. Copy contents from: `docs/email-templates/magic-link.html`
3. Paste and save

## 📧 What You Get

### Before
```
Confirm your signup

Follow this link to confirm your user:
[Confirm your mail]
```

### After
✨ Beautiful, branded email with:
- PagePouch logo and colors
- Professional gradient buttons
- Clear call-to-action
- Security notes
- Responsive design
- Mobile-friendly
- Works across all email clients

## 🚀 Production Deployment

### Checklist

Before deploying to production:

- [ ] Update Site URL in Supabase to production domain
- [ ] Add production domain to Redirect URLs
- [ ] Update `NEXT_PUBLIC_APP_URL` in production environment
- [ ] Test signup flow with real email
- [ ] Verify email links point to production
- [ ] Test in Gmail, Outlook, Apple Mail

### Environment Variables

Update for production:

```bash
# .env.production or Vercel environment variables
NEXT_PUBLIC_APP_URL=https://pagepouch.com
NEXT_PUBLIC_SUPABASE_URL=https://gwvsltgmjreructvbpzg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 🧪 Testing

### Test Locally

1. Sign up with your own email address
2. Check inbox for confirmation email
3. Verify styling looks correct
4. Click confirmation link
5. Ensure redirect works to `localhost:3001`

### Test in Production

1. Deploy to production
2. Sign up with test email
3. Verify links point to production domain
4. Test across multiple devices/email clients

## 🎨 Brand Colors Used

- **Primary Blue**: `#2563eb`
- **Secondary Purple**: `#4f46e5`
- **Text Dark**: `#0f172a`
- **Text Medium**: `#475569`
- **Background**: `#f8fafc`

## 💡 Tips

1. **Always test after changes**: Email rendering can vary by client
2. **Keep styles inline**: Required for email compatibility
3. **Use tables for layout**: Most reliable for email HTML
4. **Test on mobile**: Many users read email on phones
5. **Check spam folder**: If emails aren't arriving

## 🆘 Troubleshooting

### Issue: Links show localhost in production

**Solution**: Update Site URL in Supabase Dashboard to production domain

### Issue: Emails not arriving

**Solution**: 
1. Check Supabase email settings
2. Verify spam folder
3. Review Supabase logs

### Issue: Styling broken in Outlook

**Solution**: 
1. Ensure all styles are inline
2. Use table-based layout
3. Avoid modern CSS features

## 📚 Additional Resources

- Full documentation: `docs/EMAIL_TEMPLATE_SETUP.md`
- Supabase Auth Docs: https://supabase.com/docs/guides/auth/auth-email-templates
- Email template files: `docs/email-templates/`

## ✅ Complete!

Your PagePouch email templates are now beautifully branded and professional! 🎉

