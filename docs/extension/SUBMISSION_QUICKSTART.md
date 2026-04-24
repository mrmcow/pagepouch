# Extension Store Submission - Quick Start

## 🚀 Complete This in One Sitting (3-5 hours)

This is your actionable, step-by-step guide to get your extensions submitted today.

---

## Step 1: Create Screenshots (1-2 hours)

### Setup:
1. Install PageStash extension locally in Chrome
2. Create test account at pagestash.app/auth/signup
3. Capture 5-10 test pages with interesting content
4. Create 2-3 folders and organize clips

### Take These 5 Screenshots:

#### Screenshot 1: Extension Popup
```bash
1. Go to any webpage (e.g., https://techcrunch.com/article)
2. Click PageStash icon in toolbar
3. Screenshot the popup (Cmd+Shift+4 on Mac)
4. Save as: apps/extension/store-assets/screenshots/01-extension-popup.png
5. Resize to 1280x800px
```

#### Screenshot 2: Dashboard View
```bash
1. Go to https://pagestash.app/dashboard
2. Make sure 6-10 clips are visible with previews
3. Take full-screen screenshot
4. Save as: apps/extension/store-assets/screenshots/02-dashboard-view.png
5. Resize to 1280x800px
```

#### Screenshot 3: Search Results
```bash
1. In dashboard, enter search query
2. Wait for results to appear
3. Take screenshot showing search + results
4. Save as: apps/extension/store-assets/screenshots/03-search-results.png
5. Resize to 1280x800px
```

#### Screenshot 4: Clip Detail
```bash
1. Click on any clip to open detail view
2. Scroll to show screenshot preview
3. Take screenshot showing full clip
4. Save as: apps/extension/store-assets/screenshots/04-clip-detail.png
5. Resize to 1280x800px
```

#### Screenshot 5: Organization
```bash
1. Show folder sidebar with multiple folders
2. Show clips organized in folders
3. Take screenshot
4. Save as: apps/extension/store-assets/screenshots/05-folder-organization.png
5. Resize to 1280x800px
```

---

## Step 2: Create Promo Image - Chrome Only (30-60 minutes)

### Option A: Quick Canva Template (Easiest)
```
1. Go to https://canva.com
2. Create account (free)
3. Create custom size: 440x280px
4. Add blue gradient background (#3B82F6 to #6366F1)
5. Upload PageStash logo from apps/extension/icons/icon-128.png
6. Add text:
   - "PageStash" (32px, bold)
   - "One-Click Web Archival" (18px)
   - "For Researchers & Analysts" (14px)
7. Download as PNG
8. Save as: apps/extension/store-assets/promo/small-tile-440x280.png
```

### Option B: Use Figma (More Control)
```
1. Go to https://figma.com
2. Create frame: 440x280px
3. Add gradient background
4. Place logo and text
5. Export as PNG @2x
6. Save as: apps/extension/store-assets/promo/small-tile-440x280.png
```

---

## Step 3: Create Test Account (10 minutes)

```bash
1. Go to https://pagestash.app/auth/signup
2. Email: test@pagestash.app (or similar)
3. Password: [Create strong password - write it down!]
4. Capture 3-5 test pages
5. Create 2-3 folders
6. Test search functionality
7. Note credentials for reviewer instructions
```

---

## Step 4: Package Extensions (5 minutes)

```bash
cd /Users/michaelcouch/DEV/pagepouch/apps/extension
./scripts/package-for-stores.sh
```

This creates:
- `store-packages/pagestash-chrome-v1.2.0.zip`
- `store-packages/pagestash-firefox-v1.1.0.zip`

---

## Step 5: Register Developer Accounts (15 minutes)

### Chrome Web Store:
```
1. Go to: https://chrome.google.com/webstore/devconsole/
2. Sign in with Google account
3. Pay $5 registration fee (one-time)
4. Complete developer profile
   - Publisher: PageStash
   - Email: support@pagestash.app
   - Website: https://pagestash.app
```

### Firefox Add-ons:
```
1. Go to: https://addons.mozilla.org/developers/
2. Sign in with Firefox Account (create if needed)
3. Complete developer profile (free)
```

---

## Step 6: Submit to Chrome Web Store (30 minutes)

### Upload:
```
1. Go to Chrome Developer Dashboard
2. Click "New Item"
3. Upload: store-packages/pagestash-chrome-v1.2.0.zip
4. Wait for processing
```

### Store Listing:
```
Name: PageStash

Summary (copy/paste):
Capture any webpage with one click. Perfect for researchers, analysts, and anyone who needs to archive web content reliably.

Category: Productivity

Icon: apps/extension/icons/icon-128.png

Screenshots: Upload all 5 from store-assets/screenshots/

Promotional Images: Upload small-tile-440x280.png
```

### Description (copy/paste):
```
The most frictionless way to capture, organize, and retrieve web content

PageStash is the perfect tool for researchers, analysts, and knowledge workers who need to reliably archive web content with zero friction and maximum searchability.

✨ KEY FEATURES

🚀 One-Click Capture
Save any webpage instantly with a single click. Perfect screenshot capture with full visual fidelity, complete HTML and text extraction for searchability, and automatic metadata collection.

📁 Smart Organization
Organize clips into folders and tags, add notes and annotations, with everything syncing across your devices automatically.

🔍 Powerful Search
Find anything in seconds with full-text search across all your saved content, notes, and metadata. Filter by folders, tags, and date ranges.

🔒 Secure & Private
Your data is encrypted and secure. Perfect for sensitive research and threat intelligence work with GDPR compliance.

📊 Knowledge Graphs (Pro)
Visualize connections between your research with AI-powered knowledge graphs that reveal hidden patterns and relationships.

🎯 PERFECT FOR
• Threat Intelligence Analysts
• Researchers & Academics  
• Journalists & Content Creators
• Legal Professionals
• Students & Educators
• Market Research Analysts
• Competitive Intelligence Teams

💎 PRICING
• Free: 10 clips per month - Perfect for trying PageStash
• Pro: 1,000 clips per month + 5GB storage - $12/month or $120/year

🚀 GETTING STARTED
1. Install the extension
2. Click the PageStash icon on any webpage
3. Your content is captured and organized automatically
4. Access your library at pagestash.app

🔐 PRIVACY & SECURITY
• Your data is encrypted in transit and at rest
• No tracking of your browsing behavior
• GDPR compliant with full user data rights
• You own your data, not us

Start capturing the web today with PageStash!

SUPPORT
Website: https://pagestash.app
Email: support@pagestash.app
Privacy Policy: https://pagestash.app/privacy
```

### Privacy Practices:
```
Data Collection: Personal data, Authentication info, Website content

Justification (copy/paste):
PageStash collects the following data to provide our core service:

1. Personal Information (Email):
   - Purpose: User authentication and account management
   - Usage: Creating and maintaining user accounts
   - Storage: Encrypted in Supabase (PostgreSQL)

2. Web Content:
   - Purpose: Storing user-captured web pages
   - Usage: Content archival, search, and organization
   - Collection: Only when user explicitly clicks "Capture"
   - Storage: Screenshots in cloud storage, text in database

3. Authentication Tokens:
   - Purpose: Maintaining user sessions
   - Usage: Keeping users logged in securely
   - Storage: Encrypted, short-lived tokens

We do NOT:
❌ Track browsing history
❌ Collect data without user consent
❌ Sell data to third parties
❌ Use data for advertising

All data is encrypted in transit (HTTPS) and at rest. Users can export or delete their data at any time.

Single Purpose:
PageStash serves a single purpose: to capture, organize, and search web content for research and knowledge management.

Permission Justification:
activeTab: Capture screenshots and extract content from the current webpage when user clicks capture
storage: Store user preferences and offline data locally
scripting: Inject content scripts to extract page HTML and text for searchability
host_permissions: Enable capture from any website user visits

Privacy Policy: https://pagestash.app/privacy

✓ Check: I certify compliance with Chrome Web Store policies
```

### Distribution:
```
Visibility: Public
Pricing: Free
Regions: All regions
```

### Test Instructions:
```
Test Account:
Email: test@pagestash.app
Password: [your-test-password]

Test Instructions:
1. Click the PageStash icon in the browser toolbar
2. Sign in with the test credentials provided
3. Navigate to any webpage (e.g., https://example.com)
4. Click "Capture Page" in the popup
5. The page should be captured and appear in the dashboard at pagestash.app/dashboard
6. Verify the screenshot, text extraction, and metadata are captured correctly

Note: The extension requires an active internet connection and valid authentication to function properly.
```

### Submit:
```
1. Review all information carefully
2. Click "Submit for review"
3. Choose "Publish immediately after review"
4. Confirm submission
```

---

## Step 7: Submit to Firefox Add-ons (30 minutes)

### Upload:
```
1. Go to: https://addons.mozilla.org/developers/addon/submit/upload-listed
2. Upload: store-packages/pagestash-firefox-v1.1.0.zip
3. Wait for automatic validation
4. Fix any errors/warnings if needed
```

### Add-on Details:
```
Name: PageStash
URL Slug: pagestash
Categories: Productivity, Research & Education

Summary (250 chars):
Capture any webpage with one click. Perfect for researchers, analysts, and knowledge workers. Full-page screenshots, text extraction, smart organization, and powerful search. Privacy-first web archival tool.

Tags:
web clipper, research, screenshot, archive, productivity, knowledge management, bookmarks, note taking

Homepage: https://pagestash.app
Support Email: support@pagestash.app
Privacy Policy: https://pagestash.app/privacy
```

### Description (same as Chrome):
```
[Use the same description as Chrome Web Store submission above]
```

### Media:
```
Icon: apps/extension/icons/icon-128.png

Screenshots: Upload all 5 from store-assets/screenshots/ with captions:
1. "One-click capture from any webpage"
2. "Organize clips with folders and tags"
3. "Powerful full-text search"
4. "View captured pages with full fidelity"
5. "Smart organization for research"
```

### Additional Details:
```
Requires payment: No
Is experimental: No
Requires external account: Yes

External Account Explanation:
PageStash requires a free account at pagestash.app to sync and store captured web content across devices. Account creation is free and takes less than a minute.

Collects user data: Yes

Data Collection Details:
PageStash collects:
- Email (for authentication)
- Web content you explicitly capture
- Usage statistics (anonymized)

We do NOT collect:
- Browsing history
- Data from pages you don't capture
- Personal information without consent

All data is encrypted and you can delete it at any time.
Privacy Policy: https://pagestash.app/privacy
```

### Submit:
```
1. Review all information
2. Click "Submit Version"
3. Choose "Listed" (public)
4. Confirm submission
```

---

## Step 8: Monitor & Wait

### Chrome:
- Review time: 1-7 days (can be longer for first submission)
- Monitor: https://chrome.google.com/webstore/devconsole/

### Firefox:
- Automated review: ~30 minutes if no issues
- Manual review: 1-14 days if flagged
- Monitor: https://addons.mozilla.org/developers/

---

## ✅ Checklist Before Submission

- [ ] 5+ screenshots created and saved
- [ ] Screenshots are 1280x800px, PNG/JPEG, under 5MB
- [ ] Chrome promo tile (440x280px) created
- [ ] Test account created and documented
- [ ] Both ZIP packages created via script
- [ ] Chrome developer account registered ($5 paid)
- [ ] Firefox developer account registered (free)
- [ ] Privacy policy is live at pagestash.app/privacy
- [ ] Terms of service are live at pagestash.app/terms
- [ ] Extensions tested in both browsers
- [ ] No console errors in either browser
- [ ] Support email support@pagestash.app is active

---

## 🆘 If You Get Stuck

### For Screenshots:
- See: `docs/EXTENSION_ASSETS_CREATION_GUIDE.md`
- Use built-in screenshot tools (Cmd+Shift+4 on Mac)
- Resize in Preview (Mac) or Paint (Windows)

### For Promotional Images:
- Use Canva templates: https://canva.com
- Keep it simple: Logo + Tagline + Colors
- See examples in other extensions

### For Submission Issues:
- Chrome: https://groups.google.com/a/chromium.org/g/chromium-extensions
- Firefox: https://discourse.mozilla.org/c/add-ons/35
- See: `docs/EXTENSION_STORE_SUBMISSION_GUIDE.md` for detailed help

---

## 📞 Have Questions?

Refer to:
- **Detailed Guide**: `docs/EXTENSION_STORE_SUBMISSION_GUIDE.md`
- **Full Checklist**: `docs/EXTENSION_SUBMISSION_CHECKLIST.md`
- **Asset Guide**: `docs/EXTENSION_ASSETS_CREATION_GUIDE.md`
- **Summary**: `docs/EXTENSION_SUBMISSION_SUMMARY.md`

---

## 🎉 You're Ready!

Follow these steps in order and you'll have both extensions submitted in 3-5 hours.

**Remember:**
- Quality over speed
- Test thoroughly before submitting
- Read all error messages carefully
- First rejections are normal - just fix and resubmit

**Good luck! 🚀**

