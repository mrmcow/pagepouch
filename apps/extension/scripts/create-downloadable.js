#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get browser target from command line argument
const browserTarget = process.argv[2] || 'chrome'; // Default to chrome
const validBrowsers = ['chrome', 'firefox'];

if (!validBrowsers.includes(browserTarget)) {
  console.error(`❌ Invalid browser target: ${browserTarget}`);
  console.log(`✅ Valid options: ${validBrowsers.join(', ')}`);
  process.exit(1);
}

console.log(`🚀 Creating downloadable PageStash extension for ${browserTarget.toUpperCase()}...\n`);

// Build the extension for the target browser
console.log('📦 Building extension...');
try {
  const buildCommand = browserTarget === 'firefox' ? 'npm run build:firefox' : 'npm run build:chrome';
  execSync(buildCommand, { stdio: 'inherit', cwd: __dirname + '/..' });
  console.log('✅ Extension built successfully\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Create browser-specific downloads directory
const downloadsDir = path.join(__dirname, '..', 'downloads', browserTarget);
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// Create installation guide
const installationGuide = `# PageStash Extension — Installation Guide

## Recommended: Install from your browser's store

The easiest way to install PageStash with automatic updates:

- **Chrome / Edge / Chromium:** [Chrome Web Store](https://chromewebstore.google.com/detail/pagestash/pimbnkabbjeacahcclicmfdkhojnjmif)
- **Firefox:** [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/pagestash/)

## Manual Install (Advanced)

### Chrome / Chromium

1. Download \`pagestash-extension-chrome.zip\`
2. Extract it to a folder on your computer
3. Open \`chrome://extensions/\`
4. Toggle **Developer mode** ON (top right corner)
5. Click **Load unpacked** and select the extracted folder
6. The PageStash icon should appear in your toolbar

### Firefox

1. Download \`pagestash-extension-firefox.zip\`
2. Open \`about:debugging\`
3. Click **This Firefox**
4. Click **Load Temporary Add-on**
5. Select the ZIP or the \`manifest.json\` inside the extracted folder

*Note: Temporary add-ons are removed when Firefox restarts.*

## Features

- Full page scroll capture and visible area screenshots
- Cloud sync across all your devices
- Full-text search across your entire library
- Folder organization with tags and notes
- Encrypted storage with enterprise-grade security

## Need Help?

- **Support:** support@pagestash.app
- **Web app:** https://pagestash.app/dashboard
- **Docs:** https://pagestash.app/docs

---

**PageStash v2.2.0** — Capture · Organize · Retrieve
`;

// Write installation guide
fs.writeFileSync(path.join(downloadsDir, 'INSTALLATION_GUIDE.md'), installationGuide);

// Create version info
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'dist', 'manifest.json'), 'utf8'));

const versionInfo = {
  name: 'PageStash Extension',
  version: manifest.version,
  buildDate: new Date().toISOString(),
  buildNumber: Date.now(),
  features: [
    'Full page scroll capture',
    'Visible area capture', 
    'Cloud synchronization',
    'Modern UI with new logo',
    'Cross-browser compatibility'
  ],
  requirements: {
    chrome: '88+',
    firefox: '78+',
    permissions: ['activeTab', 'storage', 'scripting']
  }
};

fs.writeFileSync(
  path.join(downloadsDir, 'version-info.json'), 
  JSON.stringify(versionInfo, null, 2)
);

// Copy dist folder contents for direct installation
const distDir = path.join(__dirname, '..', browserTarget === 'firefox' ? 'dist-firefox' : 'dist');
const unpackedDir = path.join(downloadsDir, `pagestash-extension-${browserTarget}-unpacked`);

// Remove existing unpacked directory
if (fs.existsSync(unpackedDir)) {
  fs.rmSync(unpackedDir, { recursive: true, force: true });
}

// Copy dist to unpacked directory
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(distDir, unpackedDir);

// Clean up manifest for unpacked extension (remove key field)
const manifestPath = path.join(unpackedDir, 'manifest.json');
const unpackedManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
delete unpackedManifest.key; // Remove key field for unpacked extensions
fs.writeFileSync(manifestPath, JSON.stringify(unpackedManifest, null, 2));

// Create ZIP file for the target browser
console.log('📁 Creating ZIP package...');
try {
  const zipPath = path.join(downloadsDir, `pagestash-extension-${browserTarget}.zip`);
  
  // Remove existing zip
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }
  
  // Create zip using system zip command
  execSync(`cd "${unpackedDir}" && zip -r "../pagestash-extension-${browserTarget}.zip" .`, { stdio: 'inherit' });
  
  console.log('✅ ZIP package created successfully\\n');
} catch (error) {
  console.error('❌ ZIP creation failed:', error.message);
  console.log('📝 You can manually zip the contents of:', unpackedDir);
}

// Create download page HTML
const downloadPageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Download PageStash Extension</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        *{box-sizing:border-box}body{font-family:'Inter',system-ui,-apple-system,sans-serif;max-width:720px;margin:0 auto;padding:48px 24px;line-height:1.6;color:#0f172a;-webkit-font-smoothing:antialiased}.header{text-align:center;margin-bottom:40px}.header h1{font-size:28px;font-weight:700;letter-spacing:-0.02em;margin:0 0 6px}.header p{color:#64748b;font-size:15px;margin:0 0 12px}.version-badge{display:inline-block;background:#dbeafe;color:#1d4ed8;padding:3px 12px;border-radius:10px;font-size:13px;font-weight:600}.card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:28px;margin:20px 0}.card h2{font-size:18px;font-weight:600;margin:0 0 8px}.card p{color:#475569;font-size:14px;margin:0 0 16px}.store-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}.store-link{display:flex;align-items:center;gap:10px;padding:14px 18px;border-radius:12px;text-decoration:none;border:1px solid #e2e8f0;background:#fff;color:#0f172a;font-weight:500;font-size:14px;transition:all .15s ease}.store-link:hover{border-color:#2563eb;box-shadow:0 2px 8px rgba(37,99,235,.1)}.store-link small{display:block;color:#64748b;font-weight:400;font-size:12px}.btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:500;font-size:13px;margin-right:8px;margin-bottom:8px;background:#fff;color:#475569;border:1px solid #e2e8f0;transition:background .15s ease}.btn:hover{background:#f1f5f9}.footer{text-align:center;margin-top:40px;font-size:13px;color:#94a3b8}@media(max-width:520px){.store-grid{grid-template-columns:1fr}}
    </style>
</head>
<body>
    <div class="header">
        <div style="margin-bottom:16px"><svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 6C9 4.89543 9.89543 4 11 4H35C36.1046 4 37 4.89543 37 6V40C37 41.1046 36.1046 42 35 42H11C9.89543 42 9 41.1046 9 40V6Z" fill="#f8fafc" stroke="#2563eb" stroke-width="2"/><path d="M37 6V18L42 13V8C42 6.89543 41.1046 6 40 6H37Z" fill="#2563eb" stroke="#2563eb" stroke-width="2" stroke-linejoin="round"/><path d="M38.5 9.5V15.5M38.5 9.5H40C40.5523 9.5 41 9.94772 41 10.5V11.5C41 12.0523 40.5523 12.5 40 12.5H38.5M38.5 9.5V12.5" stroke="#ffffff" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/><rect x="15" y="14" width="14" height="1.5" rx="0.75" fill="#64748b" opacity="0.3"/><rect x="15" y="18" width="10" height="1.5" rx="0.75" fill="#64748b" opacity="0.3"/><rect x="15" y="22" width="12" height="1.5" rx="0.75" fill="#64748b" opacity="0.3"/></svg></div>
        <h1>PageStash Extension</h1>
        <p>Capture, organize, and retrieve web content with zero friction</p>
        <span class="version-badge">v\${versionInfo.version}</span>
    </div>
    <div class="card">
        <h2>Install from your browser's store</h2>
        <p>One-click install with automatic updates — recommended for most users.</p>
        <div class="store-grid">
            <a href="https://chromewebstore.google.com/detail/pagestash/pimbnkabbjeacahcclicmfdkhojnjmif" class="store-link" target="_blank" rel="noopener noreferrer"><span><strong>Chrome Web Store</strong><small>For Chrome, Edge &amp; Chromium</small></span></a>
            <a href="https://addons.mozilla.org/en-US/firefox/addon/pagestash/" class="store-link" target="_blank" rel="noopener noreferrer"><span><strong>Firefox Add-ons</strong><small>For Firefox</small></span></a>
        </div>
    </div>
    <div class="card">
        <h2>Manual Install (Advanced)</h2>
        <p>Download the ZIP and load it manually.</p>
        <a href="pagestash-extension-\${browserTarget}.zip" class="btn" download>Download ZIP</a>
        <a href="INSTALLATION_GUIDE.md" class="btn" target="_blank">Installation Guide</a>
        <p style="margin-top:12px;font-size:12px;color:#94a3b8"><strong>Build:</strong> \${new Date(versionInfo.buildDate).toLocaleDateString()}</p>
    </div>
    <div class="footer"><p>PageStash &mdash; Making web content capture effortless</p><p><a href="https://pagestash.app" style="color:#2563eb;text-decoration:none">pagestash.app</a></p></div>
</body>
</html>`;

fs.writeFileSync(path.join(downloadsDir, 'download.html'), downloadPageHtml);

// Success message
console.log('🎉 Downloadable extension created successfully!');
console.log('📁 Files created in:', downloadsDir);
console.log('');
console.log('📦 Available files:');
console.log('   • pagestash-extension.zip - For Firefox or Chrome');
console.log('   • pagestash-extension-unpacked/ - For Chrome (Load unpacked)');
console.log('   • INSTALLATION_GUIDE.md - Step-by-step instructions');
console.log('   • download.html - Beautiful download page');
console.log('   • version-info.json - Build information');
console.log('');
console.log('🌐 Open download.html in your browser to see the download page!');
console.log('📧 Share the ZIP file with beta testers for easy installation.');
