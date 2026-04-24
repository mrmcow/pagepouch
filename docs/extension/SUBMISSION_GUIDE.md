# Extension Store Submission Guide - PageStash

## Overview
This guide will walk you through submitting the PageStash extension to both the Chrome Web Store and Firefox Add-ons (AMO).

**Estimated Time**: 2-3 hours for both stores
**Cost**: $5 one-time for Chrome Web Store Developer Account

---

## 📋 Pre-Submission Checklist

### ✅ Required Assets (Create these first!)

#### Icons (Already have these ✓)
- [x] 16x16px icon
- [x] 32x32px icon  
- [x] 48x48px icon
- [x] 128x128px icon

#### Screenshots (NEED TO CREATE)
You need 5-8 screenshots for each store:

**Chrome Web Store Requirements:**
- Min: 1280x800px or 640x400px
- Recommended: 1280x800px
- Max 5 screenshots

**Firefox Add-ons Requirements:**
- Any size, but recommended: 1280x800px
- Up to 10 screenshots

**Required Screenshots:**
1. **Extension Popup** - Show the PageStash popup with capture button and folder selection
2. **Dashboard View** - Show the web app with clips organized in folders
3. **Search Results** - Show the search functionality in action
4. **Clip Detail View** - Show an individual clip with screenshot preview
5. **Folder Organization** - Show folder/tag management

**Optional but Recommended:**
6. **Knowledge Graph** - Show the knowledge graph feature (Pro feature)
7. **Mobile/Responsive View** - Show responsive design
8. **Settings/Profile** - Show user settings

#### Promotional Images (Chrome Only - NEED TO CREATE)

**Small Promotional Tile (Required)**
- Size: 440x280px
- Format: PNG or JPEG
- Use: Appears in search results and category pages

**Large Promotional Tile (Recommended)**
- Size: 920x680px
- Format: PNG or JPEG  
- Use: Featured placements

**Marquee Promotional Tile (Optional)**
- Size: 1400x560px
- Format: PNG or JPEG
- Use: Featured on Chrome Web Store homepage

### ✅ Documentation (Already have most!)
- [x] Privacy Policy: https://pagestash.app/privacy
- [x] Terms of Service: https://pagestash.app/terms
- [x] Support Email: support@pagestash.app
- [x] Website: https://pagestash.app

### ✅ Extension Files (Already built!)
- [x] Chrome extension: `/apps/extension/dist/`
- [x] Firefox extension: `/apps/extension/dist-firefox/`

---

## 🌐 Chrome Web Store Submission

### Step 1: Register as a Chrome Web Store Developer

1. **Go to**: [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. **Sign in** with your Google account
3. **Pay the $5 registration fee** (one-time payment)
4. **Complete your developer profile**:
   - Email: support@pagestash.app
   - Publisher Name: PageStash
   - Website: https://pagestash.app

### Step 2: Prepare the Extension Package

1. **Navigate to** `/apps/extension/dist/`
2. **Create a ZIP file** containing:
   ```bash
   cd /Users/michaelcouch/DEV/pagepouch/apps/extension/dist
   zip -r pagestash-chrome-v1.2.0.zip .
   ```
   
   **Important**: Zip the CONTENTS of the dist folder, not the folder itself!
   
   Files included:
   - manifest.json
   - background.js
   - content.js
   - popup.html
   - popup.js
   - icons/ folder

3. **Verify the ZIP**:
   - Max size: 2GB (yours will be ~1-2MB)
   - Contains manifest.json at root level
   - All referenced files are included

### Step 3: Upload to Chrome Web Store

1. **Go to**: [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. **Click**: "New Item"
3. **Upload**: Your `pagestash-chrome-v1.2.0.zip` file
4. **Wait** for the upload and processing to complete

### Step 4: Complete Store Listing

#### **Store Listing Tab:**

**Product Name:**
```
PageStash
```

**Summary** (132 characters max):
```
Capture any webpage with one click. Perfect for researchers, analysts, and anyone who needs to archive web content reliably.
```

**Description** (16,000 characters max):
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

**Category:**
```
Productivity
```

**Language:**
```
English (United States)
```

**Icon:**
- Upload: `/apps/extension/icons/icon-128.png`

**Screenshots:**
- Upload 5 screenshots (create these from your requirements)
- Order them logically (Popup → Dashboard → Search → Detail → Organization)

**Promotional Images:**
- Small Tile (440x280px): Upload when created
- Large Tile (920x680px): Upload when created (optional)
- Marquee (1400x560px): Upload when created (optional)

#### **Privacy Practices Tab:**

**Data Collection:**
Select:
- ✅ Personal data (email, saved web content)
- ✅ Authentication information (session tokens)
- ✅ Website content (user-saved pages)

**Justify Data Collection:**
```
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
```

**Single Purpose:**
```
PageStash serves a single purpose: to capture, organize, and search web content for research and knowledge management.
```

**Permission Justification:**
```
activeTab: Capture screenshots and extract content from the current webpage when user clicks capture
storage: Store user preferences and offline data locally
scripting: Inject content scripts to extract page HTML and text for searchability
host_permissions (http://*/* and https://*/*): Enable capture from any website user visits
```

**Privacy Policy:**
```
https://pagestash.app/privacy
```

**Data Handling Certification:**
- ✅ Check: "I certify that my extension's use of data complies with the Chrome Web Store Developer Program Policies"

#### **Distribution Tab:**

**Visibility:**
```
Public
```

**Pricing:**
```
Free
```
(In-app purchases handled separately on your website)

**Regions:**
```
All regions (default)
```

#### **Test Instructions Tab:**

**Testing Account (Optional but helpful):**
```
Test Account Email: test@pagestash.app
Test Account Password: [Create a test account and provide credentials]

Test Instructions:
1. Click the PageStash icon in the browser toolbar
2. Sign in with the test credentials provided
3. Navigate to any webpage (e.g., https://example.com)
4. Click "Capture Page" in the popup
5. The page should be captured and appear in the dashboard at pagestash.app/dashboard
6. Verify the screenshot, text extraction, and metadata are captured correctly

Note: The extension requires an active internet connection and valid authentication to function properly.
```

### Step 5: Submit for Review

1. **Review all information** carefully
2. **Click**: "Submit for review"
3. **Choose**: "Publish immediately after review" or "Publish manually"
4. **Confirm** submission

**Expected Review Time**: 1-7 days (can be longer for first submission)

---

## 🦊 Firefox Add-ons (AMO) Submission

### Step 1: Register as a Firefox Add-on Developer

1. **Go to**: [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
2. **Sign in** with Firefox Account (or create one)
3. **Complete your developer profile**

### Step 2: Prepare the Firefox Extension Package

1. **Navigate to** `/apps/extension/dist-firefox/`
2. **Create a ZIP file**:
   ```bash
   cd /Users/michaelcouch/DEV/pagepouch/apps/extension/dist-firefox
   zip -r pagestash-firefox-v1.1.0.zip .
   ```

   Files included:
   - manifest.json (Manifest V2 for Firefox)
   - background.js
   - content.js
   - firefox-popup.js
   - popup.html
   - icons/ folder

### Step 3: Upload to Firefox Add-ons

1. **Go to**: [Submit Add-on](https://addons.mozilla.org/developers/addon/submit/upload-listed)
2. **Click**: "Upload Add-on"
3. **Upload**: Your `pagestash-firefox-v1.1.0.zip` file
4. **Wait** for automatic validation

**Validation Issues:**
- If you get warnings about `eval()` or CSP, you may need to justify them
- Minor warnings are usually okay, but fix any errors

### Step 4: Complete Add-on Listing

#### **Describe Your Add-on:**

**Name:**
```
PageStash
```

**Add-on URL:**
```
pagestash
```
(This will be: https://addons.mozilla.org/firefox/addon/pagestash/)

**Summary** (250 characters max):
```
Capture any webpage with one click. Perfect for researchers, analysts, and knowledge workers. Full-page screenshots, text extraction, smart organization, and powerful search. Privacy-first web archival tool.
```

**Description:**
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
Visualize connections between your research with AI-powered knowledge graphs.

🎯 PERFECT FOR
• Researchers & Academics  
• Threat Intelligence Analysts
• Journalists & Content Creators
• Legal Professionals
• Students & Educators

💎 PRICING
• Free: 10 clips per month
• Pro: 1,000 clips per month + 5GB storage - $12/month or $120/year

🔐 PRIVACY & SECURITY
• Encrypted data in transit and at rest
• No browsing tracking
• GDPR compliant
• You own your data

SUPPORT
Website: https://pagestash.app
Email: support@pagestash.app
Privacy Policy: https://pagestash.app/privacy
```

**Categories:**
- Primary: `Productivity`
- Secondary: `Research & Education`

**Tags:**
```
web clipper, research, screenshot, archive, productivity, knowledge management, bookmarks, note taking
```

**Homepage:**
```
https://pagestash.app
```

**Support Email:**
```
support@pagestash.app
```

**Support Website:**
```
https://pagestash.app
```

**Privacy Policy:**
```
https://pagestash.app/privacy
```

**License:**
```
All Rights Reserved (or choose open source if applicable)
```

#### **Upload Media:**

**Icon:**
- Upload: `/apps/extension/icons/icon-128.png`

**Screenshots:**
- Upload 5-8 screenshots
- Same ones as Chrome (can reuse)
- Add captions to each:
  1. "One-click capture from any webpage"
  2. "Organize clips with folders and tags"
  3. "Powerful full-text search"
  4. "View captured pages with full fidelity"
  5. "Smart organization for research"

#### **Additional Details:**

**This add-on requires payment, non-free services, or software:**
```
No (Free tier available, Pro is optional)
```

**This add-on is experimental:**
```
No
```

**This add-on requires an external account:**
```
Yes
```

**Explanation:**
```
PageStash requires a free account at pagestash.app to sync and store captured web content across devices. Account creation is free and takes less than a minute.
```

**This add-on collects user data:**
```
Yes
```

**Data Collection Details:**
```
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

### Step 5: Submit for Review

1. **Review all information**
2. **Click**: "Submit Version"
3. **Choose**: Listed (public) or Unlisted (for testing)

**Expected Review Time**: 
- Automated review: ~30 minutes if no issues
- Manual review: 1-14 days if flagged

---

## 📸 Creating Required Screenshots

### Tools You'll Need:
- Chrome/Firefox browser with extension installed
- Screenshot tool (macOS: Cmd+Shift+4, Windows: Snipping Tool)
- Image editor (optional): Figma, Photoshop, or Preview

### Screenshot Specifications:

**General Requirements:**
- Format: PNG (preferred) or JPEG
- Size: 1280x800px recommended
- Quality: High resolution, clear text
- Content: Show real functionality, not mockups

### Screenshot Checklist:

#### 1. Extension Popup (Required)
**What to show:**
- PageStash popup open on a real webpage
- Capture button visible
- Folder selection dropdown
- Usage counter (e.g., "6 of 10 clips used")

**How to capture:**
1. Install the extension locally
2. Go to any interesting webpage
3. Click the PageStash icon
4. Take screenshot of the popup

#### 2. Dashboard/Library View (Required)
**What to show:**
- Main dashboard at pagestash.app/dashboard
- Multiple clips with screenshots
- Folder sidebar
- Search bar

**How to capture:**
1. Go to pagestash.app/dashboard
2. Make sure you have several clips saved
3. Take full-screen screenshot

#### 3. Search Results (Required)
**What to show:**
- Search bar with query entered
- Search results displayed
- Filters visible (optional)

**How to capture:**
1. In dashboard, enter a search query
2. Show results appearing
3. Take screenshot

#### 4. Clip Detail View (Required)
**What to show:**
- Single clip detail page
- Screenshot preview
- Text content
- Metadata (date, URL, folder, tags)

**How to capture:**
1. Click on any clip in dashboard
2. Show the detail/preview
3. Take screenshot

#### 5. Organization Features (Recommended)
**What to show:**
- Folder management
- Tag system
- Organization interface

### Post-Processing:
1. **Resize** all screenshots to 1280x800px
2. **Compress** to reduce file size (keep under 5MB each)
3. **Add subtle border** (optional) to make them pop
4. **Add annotations** if helpful (arrows, callouts)

---

## 🎨 Creating Promotional Images (Chrome Only)

### Small Promotional Tile (440x280px) - REQUIRED

**Design Tips:**
- Feature your logo prominently
- Include key benefit: "One-Click Web Archival"
- Use brand colors
- Keep text minimal and readable
- Show icon + tagline

**Template:**
```
[PageStash Logo]
One-Click Web Archival
For Researchers & Analysts
```

### Large Promotional Tile (920x680px) - RECOMMENDED

**Design Tips:**
- Feature screenshot of the product in use
- Add logo and tagline
- Include 2-3 key features with icons
- Professional, clean design

### Marquee (1400x560px) - OPTIONAL

**Design Tips:**
- Horizontal layout
- Feature screenshot on one side
- Key features on the other
- Very professional quality
- High contrast for readability

**Tools for Creating:**
- Canva (easiest, has templates)
- Figma (professional)
- Photoshop (advanced)
- Adobe Express (quick)

---

## ✅ Pre-Submission Testing Checklist

### Test in Chrome:
- [ ] Extension installs without errors
- [ ] Icon appears in toolbar
- [ ] Popup opens when clicked
- [ ] Can capture a webpage successfully
- [ ] Clip appears in dashboard
- [ ] Can search for captured clip
- [ ] Can organize clips in folders
- [ ] Can logout/login successfully
- [ ] No console errors

### Test in Firefox:
- [ ] Extension installs without errors  
- [ ] Icon appears in toolbar
- [ ] Popup opens when clicked
- [ ] Can capture a webpage successfully
- [ ] Clip appears in dashboard
- [ ] All features work as expected
- [ ] No console errors

### Test Edge Cases:
- [ ] Works on HTTPS sites
- [ ] Works on HTTP sites
- [ ] Handles long pages
- [ ] Handles JavaScript-heavy sites
- [ ] Shows error messages gracefully
- [ ] Handles slow networks
- [ ] Works offline (where applicable)

---

## 🚀 After Approval

### Chrome Web Store:
1. **Monitor** your [Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. **Respond** to user reviews promptly
3. **Track** analytics and crash reports
4. **Update** extension as needed

### Firefox Add-ons:
1. **Monitor** your [Developer Dashboard](https://addons.mozilla.org/developers/)
2. **Respond** to user reviews
3. **Update** extension as needed
4. **Check** AMO guidelines regularly

### Post-Launch Checklist:
- [ ] Add "Download on Chrome Web Store" badge to website
- [ ] Add "Get the Add-on for Firefox" badge to website
- [ ] Update homepage with store links
- [ ] Announce launch on social media
- [ ] Monitor reviews daily for first week
- [ ] Fix any reported issues quickly

---

## 📞 Support & Resources

### Chrome Web Store:
- Documentation: https://developer.chrome.com/docs/webstore/
- Program Policies: https://developer.chrome.com/docs/webstore/program-policies/
- Developer Support: https://groups.google.com/a/chromium.org/g/chromium-extensions

### Firefox Add-ons:
- Documentation: https://extensionworkshop.com/
- Add-on Policies: https://extensionworkshop.com/documentation/publish/add-on-policies/
- Developer Support: https://discourse.mozilla.org/c/add-ons/35

### Common Issues:

**Chrome Rejection Reasons:**
- Misleading description/screenshots
- Privacy policy issues
- Permission usage not justified
- Code minification/obfuscation issues
- Violation of program policies

**Firefox Rejection Reasons:**
- Validation errors
- Missing privacy policy
- Code obfuscation
- Malicious code detected
- Policy violations

---

## 📝 Submission Summary

### What You Have:
✅ Extension code built and ready
✅ Manifests configured correctly
✅ Icons in all required sizes
✅ Privacy policy and terms of service
✅ Support email and website

### What You Need to Create:
❌ 5-8 high-quality screenshots (1280x800px)
❌ Chrome promotional images (440x280px minimum)
❌ Test account credentials for reviewers
❌ Developer accounts ($5 for Chrome, free for Firefox)

### Estimated Timeline:
- **Assets Creation**: 2-4 hours
- **Chrome Submission**: 30 minutes
- **Firefox Submission**: 30 minutes
- **Chrome Review**: 1-7 days
- **Firefox Review**: 30 minutes - 14 days

---

## 🎯 Next Steps

1. **Create screenshots** following the guide above
2. **Create promotional images** for Chrome
3. **Register developer accounts** (Chrome: $5, Firefox: free)
4. **Follow submission steps** for each store
5. **Monitor and respond** to reviews

Good luck with your submission! 🚀

