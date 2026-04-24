# Extension Deployment Guide

## Overview
This guide explains how to build and deploy extension updates to the production website.

## The Issue We Fixed (Oct 31, 2024)
The production site was showing 404 errors when users tried to download the Chrome extension. This happened because:
1. The code referenced `pagestash-extension-chrome.zip` (new branding)
2. But the public folder only had `pagepouch-extension-chrome.zip` (old branding)
3. The files were never synced after the rebranding

## How to Build & Deploy Extension Updates

### 1. Build the Extension
From the `apps/extension` directory:

```bash
cd apps/extension

# Build for both browsers
npm run build:download:all

# Or build individually:
npm run build:download:chrome
npm run build:download:firefox
```

This creates downloadable packages in `apps/extension/downloads/chrome/` and `apps/extension/downloads/firefox/`

### 2. Copy to Web App Public Folder
After building, copy the files to the web app's public folder:

```bash
# Copy Chrome extension
cp apps/extension/downloads/chrome/pagestash-extension-chrome.zip apps/web/public/extension/downloads/
cp -r apps/extension/downloads/chrome/pagestash-extension-chrome-unpacked apps/web/public/extension/downloads/

# Copy Firefox extension
cp apps/extension/downloads/firefox/pagestash-extension-firefox.zip apps/web/public/extension/downloads/
cp -r apps/extension/downloads/firefox/pagestash-extension-firefox-unpacked apps/web/public/extension/downloads/

# Copy generic version (defaults to Chrome)
cp apps/extension/downloads/chrome/pagestash-extension-chrome.zip apps/web/public/extension/downloads/pagestash-extension.zip
cp -r apps/extension/downloads/chrome/pagestash-extension-chrome-unpacked apps/web/public/extension/downloads/pagestash-extension-unpacked

# Copy documentation
cp apps/extension/downloads/chrome/download.html apps/web/public/extension/downloads/
cp apps/extension/downloads/chrome/INSTALLATION_GUIDE.md apps/web/public/extension/downloads/
cp apps/extension/downloads/chrome/version-info.json apps/web/public/extension/downloads/
```

### 3. Commit and Deploy

```bash
git add apps/web/public/extension/downloads/
git commit -m "Update extension downloads to latest version"
git push origin main
```

Vercel will automatically deploy the changes.

## Download URLs Used in Production

The web app references these download URLs:
- `/extension/downloads/pagestash-extension-chrome.zip` - Chrome extension
- `/extension/downloads/pagestash-extension-firefox.zip` - Firefox extension
- `/extension/downloads/download.html` - Standalone download page
- `/extension/downloads/INSTALLATION_GUIDE.md` - Installation guide

## File Locations

### Extension Source
- `apps/extension/` - Extension source code
- `apps/extension/dist/` - Built Chrome extension
- `apps/extension/dist-firefox/` - Built Firefox extension
- `apps/extension/downloads/` - Downloadable packages (not deployed)

### Web App Public Files
- `apps/web/public/extension/downloads/` - Files served to users (deployed to Vercel)

## Components That Reference Downloads

1. `apps/web/src/components/ui/download-modal.tsx` - Main download modal
2. `apps/web/src/components/ui/browser-selector.tsx` - Browser selection component
3. `apps/web/src/app/page.tsx` - Homepage with download CTA

## Automated Build Script (Recommended)

Consider creating this script as `scripts/sync-extension-downloads.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Building extensions..."
cd apps/extension
npm run build:download:all

echo "📦 Copying files to web app..."
cd ../..
cp apps/extension/downloads/chrome/pagestash-extension-chrome.zip apps/web/public/extension/downloads/
cp -r apps/extension/downloads/chrome/pagestash-extension-chrome-unpacked apps/web/public/extension/downloads/
cp apps/extension/downloads/firefox/pagestash-extension-firefox.zip apps/web/public/extension/downloads/
cp -r apps/extension/downloads/firefox/pagestash-extension-firefox-unpacked apps/web/public/extension/downloads/
cp apps/extension/downloads/chrome/pagestash-extension-chrome.zip apps/web/public/extension/downloads/pagestash-extension.zip
cp -r apps/extension/downloads/chrome/pagestash-extension-chrome-unpacked apps/web/public/extension/downloads/pagestash-extension-unpacked
cp apps/extension/downloads/chrome/download.html apps/web/public/extension/downloads/
cp apps/extension/downloads/chrome/INSTALLATION_GUIDE.md apps/web/public/extension/downloads/
cp apps/extension/downloads/chrome/version-info.json apps/web/public/extension/downloads/

echo "✅ Extension downloads synced successfully!"
echo "📝 Don't forget to commit and push the changes"
```

## Troubleshooting

### Downloads showing 404
- Check that files exist in `apps/web/public/extension/downloads/`
- Verify filenames match exactly what the code references
- Check that changes are committed and deployed

### Wrong version showing
- Rebuild the extension with latest code
- Copy the new files to public folder
- Clear CDN cache if needed (Vercel usually handles this)

### Extension not loading after download
- Check manifest.json is valid
- Verify all required files are in the unpacked folder
- Test locally before deploying

