#!/bin/bash

# Package extensions for Chrome Web Store and Firefox Add-ons submission
# Usage: ./scripts/package-for-stores.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}📦 Packaging PageStash Extensions for Store Submission${NC}\n"

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
EXTENSION_DIR="$(dirname "$SCRIPT_DIR")"
DIST_DIR="$EXTENSION_DIR/dist"
FIREFOX_DIST_DIR="$EXTENSION_DIR/dist-firefox"
OUTPUT_DIR="$EXTENSION_DIR/store-packages"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Get version from manifest
CHROME_VERSION=$(grep -o '"version": *"[^"]*"' "$DIST_DIR/manifest.json" | cut -d'"' -f4)
FIREFOX_VERSION=$(grep -o '"version": *"[^"]*"' "$FIREFOX_DIST_DIR/manifest.json" | cut -d'"' -f4)

echo -e "${YELLOW}📋 Version Information:${NC}"
echo "  Chrome:  v$CHROME_VERSION"
echo "  Firefox: v$FIREFOX_VERSION"
echo ""

# Package Chrome extension
echo -e "${YELLOW}🌐 Packaging Chrome extension...${NC}"
cd "$DIST_DIR"
CHROME_ZIP="$OUTPUT_DIR/pagestash-chrome-v${CHROME_VERSION}.zip"

# Remove old zip if exists
rm -f "$CHROME_ZIP"

# Create zip
zip -r "$CHROME_ZIP" . -x "*.DS_Store" -x "__MACOSX/*"

if [ -f "$CHROME_ZIP" ]; then
    CHROME_SIZE=$(du -h "$CHROME_ZIP" | cut -f1)
    echo -e "${GREEN}✓ Chrome package created: $CHROME_ZIP ($CHROME_SIZE)${NC}"
else
    echo -e "${RED}✗ Failed to create Chrome package${NC}"
    exit 1
fi

# Package Firefox extension
echo -e "${YELLOW}🦊 Packaging Firefox extension...${NC}"
cd "$FIREFOX_DIST_DIR"
FIREFOX_ZIP="$OUTPUT_DIR/pagestash-firefox-v${FIREFOX_VERSION}.zip"

# Remove old zip if exists
rm -f "$FIREFOX_ZIP"

# Create zip
zip -r "$FIREFOX_ZIP" . -x "*.DS_Store" -x "__MACOSX/*"

if [ -f "$FIREFOX_ZIP" ]; then
    FIREFOX_SIZE=$(du -h "$FIREFOX_ZIP" | cut -f1)
    echo -e "${GREEN}✓ Firefox package created: $FIREFOX_ZIP ($FIREFOX_SIZE)${NC}"
else
    echo -e "${RED}✗ Failed to create Firefox package${NC}"
    exit 1
fi

# Summary
echo ""
echo -e "${GREEN}✅ Packaging Complete!${NC}"
echo ""
echo -e "${YELLOW}📦 Packages created:${NC}"
echo "  Chrome:  $CHROME_ZIP ($CHROME_SIZE)"
echo "  Firefox: $FIREFOX_ZIP ($FIREFOX_SIZE)"
echo ""
echo -e "${YELLOW}📍 Output directory:${NC}"
echo "  $OUTPUT_DIR"
echo ""
echo -e "${YELLOW}🚀 Next steps:${NC}"
echo "  1. Test packages locally"
echo "  2. Create screenshots (see docs/EXTENSION_STORE_SUBMISSION_GUIDE.md)"
echo "  3. Submit to Chrome Web Store"
echo "  4. Submit to Firefox Add-ons"
echo ""
echo -e "${GREEN}Good luck with your submission! 🎉${NC}"

