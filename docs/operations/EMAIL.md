# Email — Setup, Templates, Troubleshooting

> Single canonical reference for transactional email. Replaces `EMAIL_SETUP_QUICK_START.md`, `EMAIL_PRODUCTION_CHECKLIST.md`, `EMAIL_AUDIT_SUMMARY.md`, `EMAIL_MIGRATION_PLAN.md`, `EMAIL_TEMPLATE_SETUP.md`, `EMAIL_TROUBLESHOOTING.md`, `SUPABASE_EMAIL_SETUP.md`, `SUPABASE_EMAIL_PRODUCTION_SETUP.md`, and `SUPABASE_EMAIL_REDIRECT_FIX.md`.

---

## What we send

| Email | Trigger | Template file |
|---|---|---|
| **Confirm signup** | New account registration | `docs/email-templates/confirm-signup.html` |
| **Reset password** | Forgot-password flow | `docs/email-templates/reset-password.html` |
| **Magic Link** | Passwordless login | `docs/email-templates/magic-link.html` |
| **Change email** *(rarely used)* | User changes email in profile | Default Supabase template |
| **Invite user** *(future)* | Team invites | Default Supabase template |

All transactional auth email is sent via **Supabase Auth**. Stripe handles its own email (receipts, dunning, cancellation confirmations) — see [`STRIPE.md`](./STRIPE.md).

---

## 15-minute setup

Run through this once per environment (dev local, dev cloud, prod).

### 1. Configure URLs in Supabase

Authentication → URL Configuration:

```
Site URL:        https://pagestash.app

Redirect URLs (whitelist):
  https://pagestash.app/**
  https://www.pagestash.app/**
  http://localhost:3000/**
  http://localhost:3001/**
```

### 2. Update each email template

Authentication → Email Templates. For **each** template:

1. Click the template name (e.g. *Confirm signup*).
2. Paste in the HTML from `docs/email-templates/{template-name}.html`.
3. Set the **Redirect URL** field (this is **separate** from the URL whitelist):

   | Template | Redirect URL |
   |---|---|
   | Confirm signup | `{{ .SiteURL }}/auth/callback?next=/dashboard` |
   | Reset password | `{{ .SiteURL }}/auth/callback?next=/auth/reset-password` |
   | Magic Link | `{{ .SiteURL }}/auth/callback?next=/dashboard` |

4. Set the **Subject** (defaults are fine; custom subjects below are nicer):

   | Template | Suggested subject |
   |---|---|
   | Confirm signup | `Confirm your PageStash account` |
   | Reset password | `Reset your PageStash password` |
   | Magic Link | `Sign in to PageStash` |

5. Save.

### 3. Configure custom SMTP (critical)

Without custom SMTP, Supabase rate-limits to ~4 emails/hour using their shared sender. **Production cannot launch on this.**

Project Settings → Auth → SMTP Settings → toggle **Enable Custom SMTP** → fill in:

```
Sender Name:           PageStash
Sender Email:          noreply@pagestash.app
Host:                  smtp.sendgrid.net
Port:                  587
Minimum TLS Version:   TLSv1.2
Username:              apikey                  (literally the word "apikey")
Password:              <your SendGrid API key>
```

#### Recommended providers

| Provider | Free tier | Notes |
|---|---|---|
| **SendGrid** | 100 emails/day | Easiest setup; what we use |
| **Resend** | 3000 emails/month | Cleanest developer experience; modern alternative |
| **Postmark** | 100/month then paid | Best deliverability for transactional |
| **AWS SES** | Pay-as-you-go (~$0.10/1000) | Cheapest at scale; more setup |

### 4. Configure DNS for deliverability

Without these, emails land in spam more often. Set on your DNS for `pagestash.app`:

- **SPF** — `TXT @ "v=spf1 include:sendgrid.net ~all"` (adjust per provider)
- **DKIM** — provider-generated `CNAME` records (SendGrid: 3 records `s1._domainkey`, `s2._domainkey`, `em.pagestash.app`)
- **DMARC** — `TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:dmarc@pagestash.app; pct=100"`

Verify with:
- https://www.mail-tester.com (send to the address it gives you, check the score)
- https://mxtoolbox.com/SuperTool.aspx (look up SPF / DKIM / DMARC)

### 5. Test end-to-end

In an incognito window, do all three flows with a real inbox you can check:

1. Sign up → confirmation email arrives → click link → land on `/dashboard`
2. Forgot password → reset email arrives → click link → land on `/auth/reset-password` → submit new password
3. Magic Link sign-in (if enabled) → email arrives → click link → land on `/dashboard`

Test from at least three providers: **Gmail**, **Apple Mail**, **Outlook web**. Test on mobile too.

---

## Email template variables

Supabase exposes these in the HTML templates. Use them, don't hardcode URLs.

| Variable | What it is |
|---|---|
| `{{ .ConfirmationURL }}` | Pre-built confirm/reset/magic link with token |
| `{{ .SiteURL }}` | The Site URL configured in Supabase |
| `{{ .Email }}` | Recipient's email address |
| `{{ .Token }}` | Raw confirmation token (custom flows only) |
| `{{ .TokenHash }}` | Hashed token |

The branded HTML templates live under `docs/email-templates/`. They use the PageStash gradient header, the `Inter` font, and CTAs that match the marketing site.

---

## Production launch checklist

- [ ] Site URL set to `https://pagestash.app`
- [ ] Redirect URL whitelist includes prod and dev domains
- [ ] All three branded templates pasted in
- [ ] Per-template **Redirect URL** field set (this is the most-missed step)
- [ ] Custom SMTP enabled with SendGrid (or alternative)
- [ ] SPF, DKIM, DMARC records published and verified via mxtoolbox
- [ ] Mail-tester.com score ≥ 8/10
- [ ] All three flows tested in Gmail, Apple Mail, Outlook
- [ ] Mobile rendering verified (iOS Mail, Android Gmail)
- [ ] `support@pagestash.app` mailbox set up and forwarded to a real human
- [ ] First-week monitoring plan (Supabase Auth logs + SendGrid activity dashboard)

---

## Troubleshooting

### "I'm not receiving emails"

1. **Check spam folder first.** Especially for Outlook / Hotmail / corporate filters.
2. Supabase Dashboard → **Logs → Auth** — look for email errors.
3. Most common causes:
   - Custom SMTP not enabled → rate-limited to 4/hour from Supabase shared sender
   - Wrong SMTP credentials (SendGrid uses `apikey` as the literal username, password is the API key)
   - Site URL incorrect → links bounce off whitelist
   - Redirect URL not in the whitelist → user lands on `/auth/error`

### Email arrives but link → 404 or homepage

**Cause:** Per-template **Redirect URL** field is empty or wrong. Supabase falls back to the Site URL with no path.

**Fix:** Set the Redirect URL field per the table in [step 2](#2-update-each-email-template) — `{{ .SiteURL }}/auth/callback?next=/dashboard` (or `/auth/reset-password` for the reset flow).

### Email goes to spam

**Short term:** Ask users to mark `noreply@pagestash.app` as not-spam.

**Long term:** Configure SPF + DKIM + DMARC (see [step 4](#4-configure-dns-for-deliverability)) and verify with mail-tester.com. A score under 8/10 will keep landing in spam.

### "Link expired" error

Confirmation links expire by design:

| Flow | Link lifetime |
|---|---|
| Signup confirm | 24 hours |
| Password reset | 1 hour |
| Magic Link | 1 hour |

User must request a new link.

### Magic Link auto-clicked by email scanner (Outlook, antivirus)

Some corporate email scanners pre-fetch URLs to scan them, which consumes the single-use token. The user then sees "link already used" when they click. Workarounds:

- Use **Confirm signup + password** flow instead of magic link for users on enterprise email
- Recommend Magic Link only for B2C audiences

---

## Source materials this replaced

- `EMAIL_SETUP_QUICK_START.md`
- `EMAIL_PRODUCTION_CHECKLIST.md`
- `EMAIL_AUDIT_SUMMARY.md`
- `EMAIL_MIGRATION_PLAN.md`
- `EMAIL_TEMPLATE_SETUP.md`
- `EMAIL_TROUBLESHOOTING.md`
- `SUPABASE_EMAIL_SETUP.md`
- `SUPABASE_EMAIL_PRODUCTION_SETUP.md`
- `SUPABASE_EMAIL_REDIRECT_FIX.md`

*Last updated: April 2026*
