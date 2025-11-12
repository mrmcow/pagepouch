# Store Assets for PageStash Extension

This directory contains all assets required for Chrome Web Store and Firefox Add-ons submission.

## Directory Structure

```
store-assets/
├── screenshots/        # Required screenshots (1280x800px)
├── promo/             # Promotional images (Chrome only)
└── README.md          # This file
```

## Required Assets

### Screenshots (Both Stores)
Place 5-8 screenshots here at 1280x800px:

- [ ] `01-extension-popup.png` - Extension popup in action
- [ ] `02-dashboard-view.png` - Dashboard with organized clips  
- [ ] `03-search-results.png` - Search functionality
- [ ] `04-clip-detail.png` - Individual clip detail view
- [ ] `05-folder-organization.png` - Folder/tag organization
- [ ] `06-knowledge-graph.png` (Optional) - Knowledge graph feature
- [ ] `07-mobile-responsive.png` (Optional) - Mobile view
- [ ] `08-settings-profile.png` (Optional) - Settings page

**Requirements:**
- Size: 1280x800px (or 640x400px)
- Format: PNG or JPEG
- Max size: 5MB each
- High quality, professional appearance

### Promotional Images (Chrome Only)
Place promotional tiles here:

- [ ] `small-tile-440x280.png` (Required) - Appears in search results
- [ ] `large-tile-920x680.png` (Recommended) - Featured placements
- [ ] `marquee-1400x560.png` (Optional) - Homepage features

**Requirements:**
- Exact dimensions as specified
- Format: PNG or JPEG
- Professional quality
- Consistent branding

## Creation Guide

See detailed instructions in:
- `docs/EXTENSION_ASSETS_CREATION_GUIDE.md` - Complete guide
- `docs/EXTENSION_STORE_SUBMISSION_GUIDE.md` - Submission process

## Tools

### Recommended for Screenshots:
- macOS: Cmd+Shift+4 (built-in)
- Windows: Snipping Tool (built-in)
- Browser: DevTools for responsive views

### Recommended for Design:
- Canva: https://canva.com (easiest, free tier)
- Figma: https://figma.com (professional, free tier)
- Photopea: https://photopea.com (Photoshop alternative, free)

## Next Steps

1. Create all required screenshots (Priority 1)
2. Create at least the small promotional tile for Chrome (Priority 2)
3. Review quality and consistency
4. Run packaging script: `./scripts/package-for-stores.sh`
5. Follow submission guide to upload to stores

## Status

- [ ] All screenshots created and saved
- [ ] Chrome promotional images created
- [ ] Assets reviewed for quality
- [ ] Ready for submission

---

For complete submission instructions, see: `docs/EXTENSION_SUBMISSION_SUMMARY.md`

