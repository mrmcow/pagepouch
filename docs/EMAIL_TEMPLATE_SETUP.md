# Email Template Setup Guide

This guide explains how to configure beautiful, branded email templates in Supabase for PagePouch.

## Overview

PagePouch uses custom HTML email templates that match our professional brand aesthetic. These templates are configured in the Supabase Dashboard.

## Templates Included

1. **Confirm Signup** - Email confirmation for new user registrations
2. **Reset Password** - Password reset request emails
3. **Magic Link** - Passwordless login emails

## Configuration Steps

### 1. Access Supabase Email Templates

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **Authentication** → **Email Templates**

### 2. Configure Site URL

**CRITICAL**: Set the correct Site URL for production

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**:
   - **Development**: `http://localhost:3001`
   - **Production**: `https://pagepouch.com` (or your production domain)
3. Add **Redirect URLs** (whitelist):
   - `http://localhost:3001/**`
   - `https://pagepouch.com/**`
   - `https://www.pagepouch.com/**`

### 3. Update Email Templates

For each template type, replace the default content with our custom templates:

#### Confirm Signup Template

1. Go to **Email Templates** → **Confirm signup**
2. Copy the contents of `docs/email-templates/confirm-signup.html`
3. Paste into the template editor
4. Save changes

The template uses these Supabase variables:
- `{{ .ConfirmationURL }}` - Auto-generated confirmation link
- `{{ .Email }}` - User's email address

### 4. Environment Variables

Update your `.env.local` file:

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001  # Development
# NEXT_PUBLIC_APP_URL=https://pagepouch.com  # Production

# Supabase will use this for email redirect URLs
```

### 5. Production Deployment Checklist

When deploying to production:

- [ ] Update Site URL in Supabase Dashboard to production domain
- [ ] Add production domain to Redirect URLs whitelist
- [ ] Update `NEXT_PUBLIC_APP_URL` environment variable
- [ ] Test email confirmation flow in production
- [ ] Verify all email links point to production domain

## Email Template Variables

Supabase provides these template variables:

- `{{ .ConfirmationURL }}` - Email confirmation link
- `{{ .Email }}` - User's email address
- `{{ .Token }}` - Confirmation token (use for custom flows)
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Configured site URL
- `{{ .RedirectTo }}` - Redirect destination after confirmation

## Testing Email Templates

### Development Testing

1. Sign up with a real email address (use your own)
2. Check your inbox for the confirmation email
3. Verify the styling and branding
4. Test the confirmation link
5. Ensure redirect works correctly

### Production Testing

1. Use a test account on production
2. Verify all links point to production domain
3. Test on multiple email clients:
   - Gmail
   - Outlook
   - Apple Mail
   - Mobile devices

## Email Client Compatibility

Our templates are designed to work across all major email clients:

- ✅ Gmail (Web, iOS, Android)
- ✅ Outlook (Windows, Mac, Web)
- ✅ Apple Mail (iOS, macOS)
- ✅ Yahoo Mail
- ✅ AOL Mail
- ✅ Mobile devices (responsive design)

## Customization

### Brand Colors

The templates use PagePouch brand colors:
- **Primary Blue**: `#2563eb`
- **Secondary Purple**: `#4f46e5`
- **Text Dark**: `#0f172a`
- **Text Medium**: `#475569`
- **Text Light**: `#64748b`
- **Background**: `#f8fafc`

### Modifying Templates

When customizing:
1. Keep inline styles (required for email clients)
2. Test in multiple email clients
3. Maintain responsive design
4. Keep accessibility in mind (alt text, contrast ratios)

## Troubleshooting

### Links Point to Localhost in Production

**Problem**: Confirmation emails show localhost URLs in production.

**Solution**: 
1. Check Site URL in Supabase Dashboard
2. Ensure it's set to your production domain
3. Verify environment variables are correct
4. Restart your application

### Emails Not Sending

**Problem**: Users don't receive confirmation emails.

**Solution**:
1. Check Supabase email settings
2. Verify email service provider is configured
3. Check spam folder
4. Review Supabase logs for errors

### Styling Issues

**Problem**: Email doesn't look right in certain clients.

**Solution**:
1. Ensure all styles are inline
2. Use table-based layout (required for email)
3. Test in problematic email client
4. Avoid modern CSS features (flexbox, grid, etc.)

## Support

For additional help:
- Supabase Email Documentation: https://supabase.com/docs/guides/auth/auth-email-templates
- PagePouch Support: support@pagepouch.com

## Notes

- Email templates are rendered server-side by Supabase
- Changes to templates take effect immediately
- No code deployment needed for template updates
- Always test after making changes

