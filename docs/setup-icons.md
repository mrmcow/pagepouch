# Icon Setup Instructions

## 📁 **Copy Your Icon Files**

Please copy your icon files to the following locations:

### Extension Icons
```bash
# Copy your PNG files to the extension icons directory
cp page-pouch-icon-16\ \(1\).png apps/extension/icons/icon-16.png
cp page-pouch-icon-32\ \(1\).png apps/extension/icons/icon-32.png
cp page-pouch-icon-48\ \(1\).png apps/extension/icons/icon-48.png
cp page-pouch-icon-128\ \(1\).png apps/extension/icons/icon-128.png
```

### Web App Assets
```bash
# Copy to web app public directory
mkdir -p apps/web/public/icons
cp page-pouch-icon-16\ \(1\).png apps/web/public/icons/icon-16.png
cp page-pouch-icon-32\ \(1\).png apps/web/public/icons/icon-32.png
cp page-pouch-icon-48\ \(1\).png apps/web/public/icons/icon-48.png
cp page-pouch-icon-128\ \(1\).png apps/web/public/icons/icon-128.png
cp page-pouch-icon.svg apps/web/public/icons/logo.svg
```

### Favicon
```bash
# Use the 32px version as favicon
cp page-pouch-icon-32\ \(1\).png apps/web/public/favicon.ico
```

## 🔧 **After copying, run:**
```bash
npm run dev
```

The icons will be automatically integrated into the project!
