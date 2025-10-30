# 📧 Email Address Migration Plan for PageStash

**Date:** October 30, 2025  
**Status:** Ready for Implementation  
**Primary Email:** support@pagestash.app (newly registered)

---

## 🎯 Objective

Update all email addresses across the PageStash application, documentation, and extensions to use the new **pagestash.app** domain with the working inbox: **support@pagestash.app**

---

## 📊 Current State Analysis

### ✅ Already Correct:
- `apps/web/src/app/page.tsx` - Already using `support@pagestash.app`

### ❌ Needs Migration:

#### **Category 1: Old Brand (pagepouch.com)**
These reference the old PagePouch brand and need complete update:

| File | Current Email | Line | Update To |
|------|--------------|------|-----------|
| `docs/email-templates/reset-password.html` | `support@pagepouch.com` | 77 | `support@pagestash.app` |
| `docs/email-templates/magic-link.html` | `support@pagepouch.com` | 73 | `support@pagestash.app` |
| `docs/email-templates/confirm-signup.html` | `support@pagepouch.com` | 90 | `support@pagestash.app` |
| `apps/extension/downloads/firefox/INSTALLATION_GUIDE.md` | `support@pagepouch.com` | 60 | `support@pagestash.app` |
| `apps/web/public/extension/downloads/INSTALLATION_GUIDE.md` | `support@pagepouch.com` | 60 | `support@pagestash.app` |
| `apps/extension/downloads/INSTALLATION_GUIDE.md` | `support@pagepouch.com` | 60 | `support@pagestash.app` |
| `packages/shared/src/constants/index.ts` | `support@pagepouch.com` | 8 | `support@pagestash.app` |

**Total: 7 files**

#### **Category 2: Wrong Domain (.com instead of .app)**
These have the correct brand but wrong domain:

| File | Current Email | Line | Update To |
|------|--------------|------|-----------|
| `apps/extension/downloads/chrome/INSTALLATION_GUIDE.md` | `support@pagestash.com` | 60 | `support@pagestash.app` |
| `apps/extension/scripts/create-downloadable.js` | `support@pagestash.com` | 96 | `support@pagestash.app` |
| `README.md` | `support@pagestash.com` | 258 | `support@pagestash.app` |
| `docs/INSTALLATION_GUIDE.md` | `support@pagestash.com` | 60 | `support@pagestash.app` |
| `docs/description.md` | `support@pagestash.com` | 71 | `support@pagestash.app` |
| `docs/EMAIL_TEMPLATE_SETUP.md` | `support@pagestash.com` | 171 | `support@pagestash.app` |
| `docs/PRODUCTION_READINESS_CHECKLIST.md` | `support@pagestash.com` | 332 | `support@pagestash.app` |
| `docs/chrome-store-listing.md` | `support@pagestash.com` | 110 | `support@pagestash.app` |

**Total: 8 files**

#### **Category 3: Legal & Privacy Emails (.com → .app)**
These use specialized addresses that should forward to support:

| File | Current Email | Line | Update To |
|------|--------------|------|-----------|
| `apps/web/src/app/terms/page.tsx` | `legal@pagestash.com` | 345 | `support@pagestash.app` |
| `apps/web/src/app/privacy/page.tsx` | `privacy@pagestash.com` | 193 | `support@pagestash.app` |
| `apps/web/src/app/privacy/page.tsx` | `privacy@pagestash.com` | 243 | `support@pagestash.app` |

**Total: 3 files (2 unique files)**

---

## 🗂️ Files Summary

### **CRITICAL - User-Facing (Priority 1)**
These are seen by users and must be updated first:

1. ✅ `apps/web/src/app/page.tsx` - Homepage footer (already correct!)
2. ❌ `apps/web/src/app/terms/page.tsx` - Legal contact
3. ❌ `apps/web/src/app/privacy/page.tsx` - Privacy contact (2 instances)
4. ❌ `docs/email-templates/reset-password.html` - Supabase template
5. ❌ `docs/email-templates/magic-link.html` - Supabase template
6. ❌ `docs/email-templates/confirm-signup.html` - Supabase template
7. ❌ `packages/shared/src/constants/index.ts` - Shared constant (used by extension)

### **HIGH - Extension Distribution (Priority 2)**
These are included in downloadable extensions:

8. ❌ `apps/extension/downloads/chrome/INSTALLATION_GUIDE.md`
9. ❌ `apps/extension/downloads/firefox/INSTALLATION_GUIDE.md`
10. ❌ `apps/extension/downloads/INSTALLATION_GUIDE.md`
11. ❌ `apps/extension/scripts/create-downloadable.js` - Script that generates installation guides

### **MEDIUM - Documentation (Priority 3)**
These are internal/reference documentation:

12. ❌ `README.md` - Project README
13. ❌ `docs/INSTALLATION_GUIDE.md`
14. ❌ `docs/description.md`
15. ❌ `docs/EMAIL_TEMPLATE_SETUP.md`
16. ❌ `docs/PRODUCTION_READINESS_CHECKLIST.md`
17. ❌ `docs/chrome-store-listing.md`

### **LOW - Generated/Dist Files (Priority 4)**
These are build artifacts and should be regenerated:

18. ❌ `apps/web/public/extension/downloads/INSTALLATION_GUIDE.md`
19. ❌ `apps/web/public/extension/downloads/pagepouch-extension-firefox-unpacked/manifest.json`
20. ❌ `apps/web/public/extension/downloads/pagepouch-extension-firefox-unpacked/popup.js`
21. ❌ `apps/web/public/extension/downloads/pagepouch-extension-unpacked/popup.js`

**Note:** Items 18-21 are build outputs. After updating source files, rebuild extensions to auto-fix these.

---

## 🎯 Email Strategy

### **Primary Email: support@pagestash.app**
This is the only working inbox. All user inquiries should go here.

**Use for:**
- General support inquiries
- Technical support
- Extension installation help
- Bug reports
- Feature requests
- Legal inquiries (until/unless separate inbox is created)
- Privacy inquiries (until/unless separate inbox is created)

### **Future Email Aliases (Optional)**
If you want to set up email aliases/forwards later for better organization:
- `legal@pagestash.app` → forwards to `support@pagestash.app`
- `privacy@pagestash.app` → forwards to `support@pagestash.app`
- `hello@pagestash.app` → forwards to `support@pagestash.app`

**For now:** Use `support@pagestash.app` everywhere for simplicity.

---

## ✅ Implementation Checklist

### **Phase 1: Critical User-Facing (Do First)**

- [ ] `apps/web/src/app/terms/page.tsx`
  - Change `legal@pagestash.com` → `support@pagestash.app`
  
- [ ] `apps/web/src/app/privacy/page.tsx`
  - Change `privacy@pagestash.com` → `support@pagestash.app` (2 instances)
  
- [ ] `packages/shared/src/constants/index.ts`
  - Change `SUPPORT_EMAIL: 'support@pagepouch.com'` → `'support@pagestash.app'`
  - Rebuild shared package: `npm run build` in `packages/shared`
  
- [ ] Email Templates (Supabase):
  - [ ] `docs/email-templates/reset-password.html`
  - [ ] `docs/email-templates/magic-link.html`
  - [ ] `docs/email-templates/confirm-signup.html`
  - Upload these to Supabase after updating

### **Phase 2: Extension Distribution**

- [ ] `apps/extension/scripts/create-downloadable.js`
  - Update email in installation guide template
  
- [ ] `apps/extension/downloads/chrome/INSTALLATION_GUIDE.md`
- [ ] `apps/extension/downloads/firefox/INSTALLATION_GUIDE.md`
- [ ] `apps/extension/downloads/INSTALLATION_GUIDE.md`
  
- [ ] Rebuild extensions:
  - `npm run build:download:all` in `apps/extension`

### **Phase 3: Documentation**

- [ ] `README.md`
- [ ] `docs/INSTALLATION_GUIDE.md`
- [ ] `docs/description.md`
- [ ] `docs/EMAIL_TEMPLATE_SETUP.md`
- [ ] `docs/PRODUCTION_READINESS_CHECKLIST.md`
- [ ] `docs/chrome-store-listing.md`

### **Phase 4: Cleanup Generated Files**

- [ ] Delete old extension dist files in `apps/web/public/extension/downloads/`
- [ ] Regenerate with `npm run build:download:all`
- [ ] Verify all generated files now use `support@pagestash.app`

---

## 🧪 Testing Plan

### **After Implementation:**

1. **Web Application:**
   - [ ] Visit https://pagestash.app/terms
     - Verify legal email shows `support@pagestash.app`
   - [ ] Visit https://pagestash.app/privacy
     - Verify privacy email shows `support@pagestash.app`
   - [ ] Check homepage footer
     - Should already be correct (`support@pagestash.app`)

2. **Email Templates:**
   - [ ] Trigger password reset
     - Check email received
     - Verify "Contact Support" link goes to `support@pagestash.app`
   - [ ] Sign up new account
     - Check confirmation email
     - Verify support link

3. **Extensions:**
   - [ ] Download Chrome extension
     - Open INSTALLATION_GUIDE.md
     - Verify shows `support@pagestash.app`
   - [ ] Download Firefox extension
     - Same verification

4. **Shared Package:**
   - [ ] Check extension uses correct constant
     - Import should resolve from rebuilt shared package
   - [ ] Verify web app imports work

---

## 🚨 Critical Notes

### **Must Update Supabase Email Templates**
After updating the HTML files in `docs/email-templates/`:

1. Go to Supabase Dashboard
2. Navigate to: **Authentication** → **Email Templates**
3. Update each template:
   - Confirm signup
   - Magic link
   - Reset password
4. Save changes

### **Must Rebuild Shared Package**
After updating `packages/shared/src/constants/index.ts`:

```bash
cd packages/shared
npm run build
```

This ensures both web app and extension use the new email constant.

### **Must Regenerate Extension Downloads**
After updating source files:

```bash
cd apps/extension
npm run build:download:all
```

This regenerates the downloadable .zip files with correct email addresses.

---

## 📊 Expected Impact

### **Users Will See:**
- ✅ Consistent `support@pagestash.app` across all touchpoints
- ✅ Working email inbox (you confirmed it's registered)
- ✅ Professional branding with `.app` domain
- ✅ No broken/bounced emails

### **Files Modified:**
- **Total:** 17 source files
- **Generated:** 4+ files (auto-updated via rebuild)
- **Build Time:** ~5 minutes
- **Testing Time:** ~10 minutes

---

## 🎯 Success Criteria

✅ **Complete when:**
- All user-facing pages show `support@pagestash.app`
- All email templates reference working inbox
- All extension downloads include correct email
- All documentation is consistent
- Shared constants package is rebuilt
- Extensions are rebuilt and deployed
- No references to `@pagepouch.com` or `.com` domain remain

---

## 🔄 Rollback Plan

If issues arise:
1. Git revert the commit
2. Old emails will be restored
3. No data loss (only text changes)

**Risk:** Low - these are text-only changes

---

## 📝 Notes for Future

### **Email Inbox Configuration**
Document your `support@pagestash.app` setup:
- Provider: [Your email provider]
- Forwarding rules: [If any]
- Auto-responders: [Consider adding one]
- Response SLA: [Your target response time]

### **Consider Adding:**
- Auto-reply for support emails
- Email signature template
- Support ticket system (e.g., Help Scout, Zendesk)
- FAQ/Help Center to reduce email volume

---

*Ready to implement! This will ensure all user communications go to your working inbox.*

