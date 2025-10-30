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
const installationGuide = `# 📦 PageStash Extension - Direct Installation

## 🎯 **What is this?**

This is the PageStash browser extension that you can install directly without going through the Chrome Web Store. Perfect for beta testing and early access!

## 🔧 **Installation Instructions**

### **For Chrome/Chromium browsers:**

1. **Download the extension**
   - Download \`pagestash-extension.zip\`
   - Extract it to a folder on your computer

2. **Enable Developer Mode**
   - Open Chrome and go to \`chrome://extensions/\`
   - Toggle "Developer mode" ON (top right corner)

3. **Load the extension**
   - Click "Load unpacked"
   - Select the extracted folder
   - The PageStash icon should appear in your toolbar!

### **For Firefox:**

1. **Download the extension**
   - Download \`pagestash-extension.zip\`
   - Keep it as a ZIP file (don't extract)

2. **Install temporarily**
   - Open Firefox and go to \`about:debugging\`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select the \`pagestash-extension.zip\` file

   *Note: Temporary add-ons are removed when Firefox restarts*

## 🎨 **Features**

- ✅ **Full Page Capture** - Scroll and stitch entire pages
- ✅ **Visible Area Capture** - Quick screenshots of current view
- ✅ **Cloud Sync** - Sign in to sync across devices
- ✅ **Beautiful UI** - Modern, clean interface
- ✅ **Fast & Reliable** - Optimized for performance

## 🔐 **Privacy & Security**

- Your data stays private and secure
- Optional cloud sync with your own account
- No tracking or analytics
- Open source and transparent

## 🆘 **Need Help?**

If you encounter any issues:

1. **Check browser compatibility** - Chrome 88+ or Firefox 78+
2. **Refresh the page** - Try reloading the page you want to capture
3. **Check permissions** - Make sure the extension has access to the current site
4. **Contact support** - Email us at support@pagestash.app

## 🚀 **What's Next?**

After installation:

1. **Try capturing** - Click the PageStash icon and capture a page
2. **Sign up** - Create an account for cloud sync
3. **Visit the web app** - Go to http://localhost:3000 to manage your clips
4. **Give feedback** - Help us improve PageStash!

---

**PageStash v1.0.0** - Capture • Organize • Retrieve

*This is a beta version for testing. The official Chrome Web Store version will be available soon!*
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
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            line-height: 1.6;
            color: #1f2937;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .logo {
            width: 64px;
            height: 64px;
            margin: 0 auto 20px;
        }
        .download-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 24px;
            margin: 20px 0;
        }
        .download-button {
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            margin-right: 12px;
            margin-bottom: 12px;
        }
        .download-button:hover {
            background: #1d4ed8;
        }
        .secondary-button {
            background: #6b7280;
        }
        .secondary-button:hover {
            background: #4b5563;
        }
        .feature-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 16px;
            margin: 24px 0;
        }
        .feature {
            background: white;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        .version-badge {
            display: inline-block;
            background: #dbeafe;
            color: #1d4ed8;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 14px;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">
            <svg width="64" height="64" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 6C9 4.89543 9.89543 4 11 4H35C36.1046 4 37 4.89543 37 6V40C37 41.1046 36.1046 42 35 42H11C9.89543 42 9 41.1046 9 40V6Z" fill="#f8fafc" stroke="#2563eb" stroke-width="2"/>
                <path d="M37 6V18L42 13V8C42 6.89543 41.1046 6 40 6H37Z" fill="#2563eb" stroke="#2563eb" stroke-width="2" stroke-linejoin="round"/>
                <path d="M38.5 9.5V15.5M38.5 9.5H40C40.5523 9.5 41 9.94772 41 10.5V11.5C41 12.0523 40.5523 12.5 40 12.5H38.5M38.5 9.5V12.5" stroke="#ffffff" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="15" y="14" width="14" height="1.5" rx="0.75" fill="#64748b" opacity="0.3"/>
                <rect x="15" y="18" width="10" height="1.5" rx="0.75" fill="#64748b" opacity="0.3"/>
                <rect x="15" y="22" width="12" height="1.5" rx="0.75" fill="#64748b" opacity="0.3"/>
            </svg>
        </div>
        <h1>PageStash Extension</h1>
        <p>Capture, organize, and retrieve web content with zero friction</p>
        <span class="version-badge">v${versionInfo.version} Beta</span>
    </div>

    <div class="download-card">
        <h2>🚀 Download Extension</h2>
        <p>Get early access to PageStash before it hits the Chrome Web Store!</p>
        
        <a href="pagestash-extension.zip" class="download-button" download>
            📦 Download ZIP (Chrome & Firefox)
        </a>
        
        <a href="INSTALLATION_GUIDE.md" class="download-button secondary-button" target="_blank">
            📖 Installation Guide
        </a>
        
        <p><strong>Build Date:</strong> ${new Date(versionInfo.buildDate).toLocaleDateString()}</p>
    </div>

    <div class="feature-list">
        <div class="feature">
            <h3>📸 Smart Capture</h3>
            <p>Full page scroll capture and visible area screenshots with perfect quality</p>
        </div>
        <div class="feature">
            <h3>☁️ Cloud Sync</h3>
            <p>Sign in to sync your captures across all devices and never lose them</p>
        </div>
        <div class="feature">
            <h3>🎨 Beautiful UI</h3>
            <p>Modern, clean interface with the new PageStash logo and smooth animations</p>
        </div>
        <div class="feature">
            <h3>⚡ Fast & Reliable</h3>
            <p>Optimized for performance with instant captures and responsive design</p>
        </div>
    </div>

    <div class="download-card">
        <h2>🔧 Installation Steps</h2>
        <ol>
            <li><strong>Download</strong> the ZIP file above</li>
            <li><strong>Extract</strong> to a folder (Chrome) or keep as ZIP (Firefox)</li>
            <li><strong>Open</strong> your browser's extension page</li>
            <li><strong>Enable</strong> Developer Mode</li>
            <li><strong>Load</strong> the extension</li>
        </ol>
        <p>See the full installation guide for detailed instructions!</p>
    </div>

    <div style="text-align: center; margin-top: 40px; color: #6b7280;">
        <p>PageStash - Making web content capture effortless</p>
        <p>This is a beta version for testing. Official store release coming soon!</p>
    </div>
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
