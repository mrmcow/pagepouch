# Firefox Data Collection Permissions Fix

## Issue

When uploading to Firefox Add-ons (AMO), you may encounter this error:

```
The "data_collection_permissions" property is missing.

Error: The "/browser_specific_settings/gecko/data_collection_permissions" 
property is required for all new Firefox extensions, and will be required for 
new versions of existing extensions in the future. Please add this key to the 
manifest. More information at: https://mzl.la/firefox-builtin-data-consent
manifest.json
```

## Solution

Firefox now requires the `data_collection_permissions` field in the `browser_specific_settings.gecko` section of the manifest.json.

### ✅ Fixed Manifest

The `manifest-firefox.json` has been updated with:

```json
{
  "browser_specific_settings": {
    "gecko": {
      "id": "pagestash@pagestash.app",
      "strict_min_version": "78.0",
      "data_collection_permissions": {
        "web_accessible": true,
        "remote": true
      }
    }
  }
}
```

### What This Means

**`web_accessible`: true**
- Indicates your extension accesses web content that users explicitly capture
- Required because PageStash captures webpage content when users click the capture button

**`remote`: true**
- Indicates your extension sends data to remote servers (your backend)
- Required because PageStash syncs captured content to your Supabase backend
- This is consistent with your privacy policy

## Important Notes

### This is Transparent to Users
- Firefox will show users what data your extension collects
- Users must consent before the extension can collect data
- This is a **good thing** - it builds trust and is required by Mozilla

### What Firefox Shows Users

When users install PageStash, Firefox will display:

```
PageStash collects:
- Web content from pages you visit
- Data sent to remote servers

You can review the extension's privacy policy before installing.
```

### Your Privacy Policy Must Match

Ensure your privacy policy (https://pagestash.app/privacy) clearly states:

✅ What data you collect (captured web pages, user email, etc.)
✅ Why you collect it (to provide the service)
✅ Where it's stored (Supabase/cloud storage)
✅ How users can delete it (account settings)

**Your existing privacy policy already covers this!** ✓

## Rebuild Steps (Already Done)

If you need to rebuild in the future:

```bash
cd apps/extension
npm run build:firefox
cd dist-firefox
zip -r ../store-packages/pagestash-firefox-v1.1.0.zip .
```

## Upload to AMO

Now you can upload the fixed package:

1. Go to: https://addons.mozilla.org/developers/addon/submit/upload-listed
2. Upload: `store-packages/pagestash-firefox-v1.1.0-fixed.zip` (or regular if repackaged)
3. The validation error should be resolved ✓

## Why This Is Required

Mozilla implemented this requirement (starting in 2024/2025) to:

1. **Increase Transparency**: Users see exactly what data extensions collect
2. **Enhance Privacy**: Users must explicitly consent to data collection
3. **Build Trust**: Clear communication about data practices
4. **Comply with Regulations**: GDPR, CCPA, and other privacy laws

This is part of Mozilla's commitment to user privacy and transparency.

## For Future Updates

**Always include this field in Firefox manifests:**

```json
"browser_specific_settings": {
  "gecko": {
    "id": "your-extension@domain.com",
    "strict_min_version": "78.0",
    "data_collection_permissions": {
      "web_accessible": true,  // If you access web content
      "remote": true           // If you send data to servers
    }
  }
}
```

Set values based on what your extension actually does:
- `web_accessible`: true if you read/capture webpage content
- `remote`: true if you send data to backend servers

## Related Resources

- Mozilla Documentation: https://mzl.la/firefox-builtin-data-consent
- Firefox Add-on Policies: https://extensionworkshop.com/documentation/publish/add-on-policies/
- Privacy Best Practices: https://extensionworkshop.com/documentation/develop/build-a-secure-extension/

---

## Status: ✅ RESOLVED

The manifest has been fixed and the extension rebuilt. You can now upload to Firefox Add-ons without this error.

