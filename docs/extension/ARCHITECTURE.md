# 📦 PageStash Extension Architecture & Cross-Browser Support

## 🎯 **Current Chrome Extension Overview**

### **Architecture Components**

Our Chrome extension (v1.1.0) is built with a modern, robust architecture:

#### **1. Manifest V3 Structure**
```json
{
  "manifest_version": 3,
  "name": "PageStash",
  "version": "1.1.0",
  "permissions": ["activeTab", "storage", "scripting"],
  "background": { "service_worker": "background.js" },
  "action": { "default_popup": "popup.html" },
  "content_scripts": [...]
}
```

#### **2. Core Components**

- **🎨 Popup Interface** (`src/popup/enhanced-popup.tsx`)
  - React-based UI with beautiful PageStash logo
  - Authentication flow integration
  - Capture controls (Full Page / Visible Area)
  - Compact, professional design
  - Smart auth flow (prevents capture when not logged in)

- **⚙️ Background Service Worker** (`src/background/index.ts`)
  - Handles capture orchestration
  - Manages authentication state
  - Coordinates between popup and content scripts

- **📄 Content Scripts** (`src/content/index.ts`)
  - Injected into web pages
  - Handles DOM manipulation for captures
  - Communicates with background worker

- **🔧 Build System** (`webpack.config.js`)
  - TypeScript compilation
  - React JSX processing
  - Asset bundling and optimization
  - Development and production builds

#### **3. Key Features**
- ✅ **Real PageStash Logo** - SVG-based document + paperclip design
- ✅ **Smart Authentication** - Graceful login prompts
- ✅ **Full Page Capture** - Scroll and stitch entire pages
- ✅ **Visible Area Capture** - Quick screenshots
- ✅ **Cloud Sync** - Supabase integration
- ✅ **Modern UI** - Compact, professional design
- ✅ **Error Handling** - Comprehensive user feedback

### **Build & Distribution Process**

#### **Development Workflow**
```bash
# Development with hot reload
npm run dev

# Production build
npm run build

# Create downloadable package
npm run build:download
```

#### **Distribution Files**
- `pagestash-extension.zip` - For Firefox and Chrome manual installation
- `pagestash-extension-unpacked/` - For Chrome "Load unpacked"
- `INSTALLATION_GUIDE.md` - Step-by-step instructions
- `download.html` - Beautiful download page
- `version-info.json` - Build metadata

#### **Web App Integration**
- Download links serve latest v1.1.0 from `/apps/web/public/extension/downloads/`
- Homepage download modal shows correct version and build date
- Consistent branding across extension and web app

---

## 🦊 **Firefox Extension Implementation Plan**

### **Current Compatibility Status**

#### **✅ What Works Out of the Box**
- **WebExtensions API** - Our extension uses standard APIs
- **React Components** - UI will work identically
- **Supabase Integration** - Network requests are compatible
- **Content Scripts** - DOM manipulation is the same
- **Icons & Assets** - All static files are compatible

#### **⚠️ What Needs Adaptation**

1. **Manifest Version**
   - Chrome: Manifest V3 (current)
   - Firefox: Manifest V2 (primary support) + limited V3 support
   - **Solution**: Create Firefox-specific manifest

2. **Background Scripts**
   - Chrome: Service Worker (`background.js`)
   - Firefox: Background Page/Script (persistent or event-based)
   - **Solution**: Conditional background script loading

3. **Browser Namespace**
   - Chrome: `chrome.*` APIs
   - Firefox: `browser.*` APIs (promise-based)
   - **Solution**: Use webextension-polyfill or conditional namespace

4. **Extension ID**
   - Firefox requires explicit extension ID in manifest
   - **Solution**: Add `browser_specific_settings`

### **Implementation Strategy**

#### **Phase 1: Manifest Adaptation**

Create Firefox-compatible manifest:

```json
{
  "manifest_version": 2,
  "name": "PageStash",
  "version": "1.1.0",
  "description": "Capture any webpage with one click...",
  
  "browser_specific_settings": {
    "gecko": {
      "id": "pagestash@pagestash.com",
      "strict_min_version": "78.0"
    }
  },
  
  "permissions": [
    "activeTab",
    "storage",
    "https://*/*",
    "http://*/*"
  ],
  
  "background": {
    "scripts": ["background.js"],
    "persistent": false
  },
  
  "browser_action": {
    "default_popup": "popup.html",
    "default_title": "PageStash - Capture this page",
    "default_icon": { ... }
  },
  
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_end"
    }
  ]
}
```

#### **Phase 2: API Compatibility Layer**

Add browser API polyfill:

```typescript
// src/utils/browser-polyfill.ts
declare global {
  const browser: typeof chrome;
}

// Ensure browser API availability
if (typeof browser === "undefined") {
  (globalThis as any).browser = chrome;
}

export { browser };
```

#### **Phase 3: Build System Enhancement**

Extend webpack config for multi-browser builds:

```javascript
// webpack.firefox.config.js
const baseConfig = require('./webpack.config.js');

module.exports = {
  ...baseConfig,
  entry: {
    ...baseConfig.entry,
    // Firefox-specific entries if needed
  },
  plugins: [
    ...baseConfig.plugins,
    new CopyWebpackPlugin({
      patterns: [
        { from: 'manifest.firefox.json', to: 'manifest.json' },
        // ... other Firefox-specific files
      ],
    }),
  ],
};
```

#### **Phase 4: Enhanced Build Scripts**

Update package.json scripts:

```json
{
  "scripts": {
    "build:chrome": "webpack --config webpack.config.js --mode production",
    "build:firefox": "webpack --config webpack.firefox.config.js --mode production",
    "build:all": "npm run build:chrome && npm run build:firefox",
    "build:download:chrome": "node scripts/create-downloadable.js chrome",
    "build:download:firefox": "node scripts/create-downloadable.js firefox",
    "build:download:all": "npm run build:download:chrome && npm run build:download:firefox"
  }
}
```

### **Testing Strategy**

#### **Firefox Testing Workflow**
1. **Temporary Installation**
   - Navigate to `about:debugging`
   - Click "This Firefox" → "Load Temporary Add-on"
   - Select the Firefox build ZIP file

2. **Automated Testing**
   - Use Firefox Developer Edition for testing
   - Implement cross-browser test suite
   - Validate API compatibility

3. **User Acceptance Testing**
   - Test capture functionality across different sites
   - Verify authentication flow
   - Ensure UI consistency

### **Distribution Strategy**

#### **Multi-Browser Downloads**
- **Chrome**: `pagestash-extension-chrome.zip`
- **Firefox**: `pagestash-extension-firefox.zip`
- **Universal**: `pagestash-extension-universal.zip` (if possible)

#### **Updated Download Modal**
```typescript
// Enhanced browser detection and download options
const getBrowserSpecificDownload = (browser: 'chrome' | 'firefox') => {
  return {
    chrome: {
      file: 'pagestash-extension-chrome.zip',
      instructions: 'Chrome installation guide...'
    },
    firefox: {
      file: 'pagestash-extension-firefox.zip', 
      instructions: 'Firefox installation guide...'
    }
  }[browser];
};
```

#### **Store Submissions**
- **Chrome Web Store**: Submit Chrome build
- **Firefox Add-ons**: Submit Firefox build
- **Direct Downloads**: Maintain both versions

---

## 🚀 **Implementation Timeline**

### **Week 1: Foundation**
- [ ] Create Firefox manifest template
- [ ] Add browser API polyfill
- [ ] Set up Firefox build configuration
- [ ] Test basic functionality in Firefox

### **Week 2: Feature Parity**
- [ ] Ensure all capture features work in Firefox
- [ ] Verify authentication flow compatibility
- [ ] Test UI consistency across browsers
- [ ] Fix any Firefox-specific issues

### **Week 3: Distribution**
- [ ] Update build scripts for multi-browser support
- [ ] Create Firefox-specific download packages
- [ ] Update web app download system
- [ ] Enhance installation documentation

### **Week 4: Testing & Launch**
- [ ] Comprehensive cross-browser testing
- [ ] User acceptance testing
- [ ] Submit to Firefox Add-ons store
- [ ] Launch Firefox support announcement

---

## 📋 **Success Metrics**

### **Technical Goals**
- ✅ 100% feature parity between Chrome and Firefox versions
- ✅ Identical UI/UX experience across browsers
- ✅ Automated build process for both browsers
- ✅ Comprehensive testing coverage

### **User Experience Goals**
- ✅ Seamless installation process for both browsers
- ✅ Clear browser-specific download options
- ✅ Consistent capture quality and performance
- ✅ Unified authentication and sync experience

### **Business Goals**
- 📈 Expand user base to Firefox users (~8-10% market share)
- 🎯 Reduce browser-specific support requests
- 🚀 Position PageStash as truly cross-browser solution
- 💪 Strengthen competitive advantage

---

**Next Steps**: Begin Phase 1 implementation with Firefox manifest adaptation and basic compatibility testing.
