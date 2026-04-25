#!/usr/bin/env node

/**
 * Build script for Chrome Web Store submission
 * Prepares the extension for production deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Building PageStash Extension for Chrome Web Store...\n');

// Clean previous builds
console.log('🧹 Cleaning previous builds...');
try {
  execSync('npm run clean', { stdio: 'inherit' });
} catch (error) {
  console.log('No previous build to clean');
}

// Build the extension
console.log('📦 Building extension...');
execSync('npm run build', { stdio: 'inherit' });

// Verify required files exist.
// Note: the on-demand area-selection content script ships as `areaSelect.js`
// (injected via chrome.scripting on demand, not a permanent content_script),
// not `content.js`. Don't add it here — its absence used to fail the build.
const requiredFiles = [
  'dist/manifest.json',
  'dist/background.js',
  'dist/popup.html',
  'dist/popup.js',
  'dist/areaSelect.js',
];

console.log('✅ Verifying build files...');
for (const file of requiredFiles) {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing required file: ${file}`);
    process.exit(1);
  }
  console.log(`   ✓ ${file}`);
}

// Check manifest.json
console.log('📋 Validating manifest...');
const manifestPath = path.join(__dirname, '..', 'dist', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Validate required manifest fields
const requiredFields = ['name', 'version', 'description', 'permissions', 'action'];
for (const field of requiredFields) {
  if (!manifest[field]) {
    console.error(`❌ Missing required manifest field: ${field}`);
    process.exit(1);
  }
}

console.log(`   ✓ Name: ${manifest.name}`);
console.log(`   ✓ Version: ${manifest.version}`);
console.log(`   ✓ Description: ${manifest.description}`);
console.log(`   ✓ Permissions: ${manifest.permissions.join(', ')}`);

// Check icons
console.log('🎨 Checking icons...');
const iconSizes = ['16', '32', '48', '128'];
for (const size of iconSizes) {
  const iconPath = path.join(__dirname, '..', 'dist', 'icons', `icon-${size}.png`);
  if (!fs.existsSync(iconPath)) {
    console.warn(`⚠️  Missing icon: icon-${size}.png (will use placeholder)`);
  } else {
    console.log(`   ✓ icon-${size}.png`);
  }
}

// Create store-ready package info
console.log('📊 Package information:');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
console.log(`   Name: ${packageJson.name}`);
console.log(`   Version: ${packageJson.version}`);
console.log(`   Description: ${packageJson.description}`);

// Calculate package size
const distPath = path.join(__dirname, '..', 'dist');
const getDirectorySize = (dirPath) => {
  let totalSize = 0;
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      totalSize += getDirectorySize(filePath);
    } else {
      totalSize += stats.size;
    }
  }
  
  return totalSize;
};

const packageSize = getDirectorySize(distPath);
const packageSizeMB = (packageSize / (1024 * 1024)).toFixed(2);
console.log(`   Package size: ${packageSizeMB} MB`);

if (packageSize > 128 * 1024 * 1024) { // 128MB limit
  console.error('❌ Package size exceeds Chrome Web Store limit (128MB)');
  process.exit(1);
}

// Create submission checklist
console.log('\n📋 Chrome Web Store Submission Checklist:');
console.log('   ✅ Extension built successfully');
console.log('   ✅ Manifest.json validated');
console.log('   ✅ Required files present');
console.log('   ✅ Package size within limits');
console.log('   ⏳ TODO: Create store icons (16x16, 32x32, 48x48, 128x128)');
console.log('   ⏳ TODO: Create promotional images');
console.log('   ⏳ TODO: Write store description');
console.log('   ⏳ TODO: Set up privacy policy');
console.log('   ⏳ TODO: Test extension thoroughly');

console.log('\n🎉 Extension build complete!');
console.log('📁 Built files are in: apps/extension/dist/');
console.log('📋 Store assets are in: apps/extension/store-assets/');
console.log('\nNext steps:');
console.log('1. Create extension icons and promotional images');
console.log('2. Test the extension in Chrome');
console.log('3. Zip the dist/ folder for upload');
console.log('4. Submit to Chrome Web Store Developer Dashboard');

// Create a zip file for easy upload
console.log('\n📦 Creating zip file for store submission...');
try {
  const zipPath = path.join(__dirname, '..', 'pagestash-extension-v' + manifest.version + '.zip');
  execSync(`cd dist && zip -r "${zipPath}" .`, { stdio: 'inherit' });
  console.log(`✅ Created: ${path.basename(zipPath)}`);
} catch (error) {
  console.log('⚠️  Could not create zip file automatically. Please zip the dist/ folder manually.');
}
