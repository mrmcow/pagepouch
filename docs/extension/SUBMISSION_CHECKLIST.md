# Extension Store Submission - Quick Checklist

## 🎯 Before You Start

### Required Accounts
- [ ] Google Account for Chrome Web Store ($5 registration fee)
- [ ] Firefox Account for Mozilla Add-ons (Free)
- [ ] Payment method for Chrome Web Store fee

### Required Information
- [ ] Support Email: support@pagestash.app ✓
- [ ] Website: https://pagestash.app ✓
- [ ] Privacy Policy: https://pagestash.app/privacy ✓
- [ ] Terms of Service: https://pagestash.app/terms ✓

---

## 📦 Assets Preparation

### Icons (✅ Already Have)
- [x] 16x16px icon
- [x] 32x32px icon
- [x] 48x48px icon
- [x] 128x128px icon

### Screenshots (❌ NEED TO CREATE)
Create 5-8 screenshots at 1280x800px:

- [ ] 1. Extension popup showing capture interface
- [ ] 2. Dashboard with multiple clips organized
- [ ] 3. Search functionality in action
- [ ] 4. Individual clip detail view
- [ ] 5. Folder/tag organization interface
- [ ] 6. (Optional) Knowledge graph feature
- [ ] 7. (Optional) Mobile responsive view
- [ ] 8. (Optional) Settings/profile page

**Save all screenshots to:** `/apps/extension/store-assets/screenshots/`

### Promotional Images - Chrome Only (❌ NEED TO CREATE)

- [ ] Small Tile: 440x280px (REQUIRED)
- [ ] Large Tile: 920x680px (Recommended)
- [ ] Marquee: 1400x560px (Optional, for featured placement)

**Save promotional images to:** `/apps/extension/store-assets/promo/`

---

## 🌐 Chrome Web Store Submission

### Pre-Submission
- [ ] Build Chrome extension: `cd apps/extension && npm run build`
- [ ] Create ZIP: `cd dist && zip -r pagestash-chrome-v1.2.0.zip .`
- [ ] Test extension locally (load unpacked)
- [ ] Create test account for reviewers

### Registration
- [ ] Register at [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
- [ ] Pay $5 registration fee
- [ ] Complete developer profile

### Upload & Listing
- [ ] Upload ZIP file
- [ ] Fill in product name: "PageStash"
- [ ] Add summary (132 chars max)
- [ ] Add full description
- [ ] Select category: Productivity
- [ ] Upload icon (128x128px)
- [ ] Upload 5 screenshots
- [ ] Upload promotional images

### Privacy Practices
- [ ] Select data collection types
- [ ] Justify all permissions
- [ ] Link to privacy policy
- [ ] Certify compliance

### Distribution
- [ ] Set visibility: Public
- [ ] Set pricing: Free
- [ ] Select regions: All

### Test Instructions
- [ ] Provide test account credentials
- [ ] Write clear testing steps

### Submit
- [ ] Review all information
- [ ] Submit for review
- [ ] Choose publish timing

**Expected Review Time:** 1-7 days

---

## 🦊 Firefox Add-ons Submission

### Pre-Submission
- [ ] Build Firefox extension: `cd apps/extension && npm run build:firefox`
- [ ] Create ZIP: `cd dist-firefox && zip -r pagestash-firefox-v1.1.0.zip .`
- [ ] Test extension locally

### Registration
- [ ] Register at [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
- [ ] Create Firefox Account (if needed)
- [ ] Complete developer profile

### Upload & Listing
- [ ] Upload ZIP file
- [ ] Wait for automatic validation
- [ ] Fix any validation errors/warnings

### Add-on Details
- [ ] Set name: "PageStash"
- [ ] Set URL slug: "pagestash"
- [ ] Add summary (250 chars max)
- [ ] Add full description
- [ ] Select primary category: Productivity
- [ ] Select secondary category: Research & Education
- [ ] Add tags (8 tags)
- [ ] Set homepage: https://pagestash.app
- [ ] Set support email: support@pagestash.app
- [ ] Link privacy policy

### Media
- [ ] Upload icon (128x128px)
- [ ] Upload 5-8 screenshots with captions
- [ ] (Optional) Upload promotional image

### Additional Details
- [ ] Requires payment: No
- [ ] Is experimental: No
- [ ] Requires external account: Yes (explain)
- [ ] Collects user data: Yes (explain)

### Submit
- [ ] Review all information
- [ ] Submit for review
- [ ] Choose: Listed (public)

**Expected Review Time:** 30 mins - 14 days

---

## 🧪 Testing Checklist

### Functionality Tests
- [ ] Extension installs without errors
- [ ] Icon appears in toolbar
- [ ] Popup opens correctly
- [ ] Can capture a webpage
- [ ] Clip appears in dashboard
- [ ] Search works
- [ ] Folder organization works
- [ ] Login/logout works
- [ ] No console errors

### Cross-Browser Tests
- [ ] Chrome: All features work
- [ ] Firefox: All features work
- [ ] Edge (Chrome): All features work

### Edge Case Tests
- [ ] Works on HTTPS sites
- [ ] Works on HTTP sites
- [ ] Handles very long pages
- [ ] Handles JavaScript-heavy sites
- [ ] Shows errors gracefully
- [ ] Works with slow internet

---

## 📋 Test Account for Reviewers

Create a dedicated test account:

**Email:** test@pagestash.app (or create a new one)
**Password:** [Create a strong password]

**Setup:**
1. Create account at pagestash.app/auth/signup
2. Capture 3-5 test pages
3. Create 2-3 folders
4. Add some tags

**Provide to reviewers:**
```
Test Account Credentials:
Email: test@pagestash.app
Password: [your-test-password]

Test Instructions:
1. Install the extension
2. Click the PageStash icon
3. Sign in with credentials above
4. Go to any webpage (e.g., https://example.com)
5. Click "Capture Page" in popup
6. Visit https://pagestash.app/dashboard to see captured content
7. Try searching for "example"
8. Verify all features work correctly
```

---

## 📈 Post-Submission

### Immediate Actions
- [ ] Monitor developer dashboard daily
- [ ] Respond to any reviewer questions quickly
- [ ] Fix any issues found during review

### After Approval
- [ ] Add store badges to website
- [ ] Update homepage with store links
- [ ] Announce launch
  - [ ] Social media
  - [ ] Email list
  - [ ] Blog post
- [ ] Monitor reviews daily (first week)
- [ ] Set up review response templates
- [ ] Track installation metrics

### Ongoing Maintenance
- [ ] Respond to reviews within 24-48 hours
- [ ] Fix reported bugs quickly
- [ ] Release updates regularly
- [ ] Monitor Chrome/Firefox policy changes
- [ ] Keep documentation updated

---

## 🆘 Common Issues & Solutions

### Chrome Rejections
**Issue:** Permission justification insufficient
**Solution:** Provide detailed, specific use cases for each permission

**Issue:** Privacy policy unclear
**Solution:** Add explicit data collection details to privacy page

**Issue:** Screenshots don't match functionality
**Solution:** Ensure screenshots show actual product, not mockups

### Firefox Rejections
**Issue:** Validation errors
**Solution:** Fix manifest.json syntax, remove unused permissions

**Issue:** Code obfuscation detected
**Solution:** Provide source code map, explain build process

**Issue:** Missing required fields
**Solution:** Complete all required sections in listing

---

## 📞 Support Contacts

### Chrome Web Store
- Dashboard: https://chrome.google.com/webstore/devconsole/
- Documentation: https://developer.chrome.com/docs/webstore/
- Support: https://groups.google.com/a/chromium.org/g/chromium-extensions

### Firefox Add-ons
- Dashboard: https://addons.mozilla.org/developers/
- Documentation: https://extensionworkshop.com/
- Support: https://discourse.mozilla.org/c/add-ons/35

---

## ⏱️ Timeline Estimate

| Task | Time Required |
|------|---------------|
| Create screenshots | 1-2 hours |
| Create promo images (Chrome) | 1-2 hours |
| Register accounts | 15 minutes |
| Chrome submission | 30 minutes |
| Firefox submission | 30 minutes |
| **Total Prep Time** | **3-5 hours** |
| Chrome review wait | 1-7 days |
| Firefox review wait | 30 mins - 14 days |

---

## ✅ Ready to Submit?

Before clicking submit, verify:
- [ ] All required assets uploaded
- [ ] All text fields filled correctly
- [ ] Privacy policy is current and linked
- [ ] Test account credentials provided
- [ ] Screenshots are high quality
- [ ] Extension tested thoroughly
- [ ] No console errors
- [ ] Description is clear and accurate
- [ ] All permissions justified
- [ ] Contact information is correct

**Good luck! 🚀**

