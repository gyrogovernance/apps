# Chrome Web Store Submission Preparation - v1.1.0

## ✅ Completed

1. **Version Numbers Updated**
   - `package.json`: 1.1.0
   - `public/manifest.json`: 1.1.0
   - CHANGELOG.md: Updated with complete 1.1.0 entry

2. **Old Files Cleaned**
   - Deleted: `chrome-store-submission-v1.0.zip` (no longer needed)

3. **Descriptions Created**
   - `CHROME_STORE_DESCRIPTION.md`: Complete store listing description
   - `YOUTUBE_DESCRIPTION.md`: Video description template

4. **Git Release Created**
   - Tag: v1.1.0
   - GitHub Release: https://github.com/gyrogovernance/apps/releases/tag/v1.1.0

## 📦 Next Steps for Chrome Store Submission

### 1. Build Production Package
```bash
npm run build
```
This creates the `dist/` folder with all production files.

### 2. Create ZIP for Submission
```bash
npm run release
```
This runs the build and creates a release package.

Or manually:
- Zip the contents of the `dist/` folder (not the folder itself)
- Name it: `ai-inspector-v1.1.0.zip`

### 3. Required Assets for Store Listing

**Icons** (already in `assets/icons/`):
- ✅ 16x16: `ai_inspector_icon.png`
- ✅ 48x48: `ai_inspector_icon.png`
- ✅ 128x128: `ai_inspector_icon.png`

**Screenshots** (in `assets/`):
- ✅ Small tile (440x280): `ai_inspector_tile_s_440x280.jpg`
- ✅ Promotional image (1400x560): `ai_inspector_promo_1400x560.jpg`
- ✅ Screenshots (1280x800): `ai_inspector_screenshots_1280x800.jpg`, `ai_inspector_screenshots_2_1280x800.jpg`

### 4. Store Listing Information

**Short Description** (132 characters max):
```
Mitigating Jailbreaks, Deceptive Alignment, and X-Risk through quality assessment of AI outputs. Works with any AI. No API keys.
```

**Category**: Productivity

**Language**: English (United States)

**Privacy Policy**: Required - check if you have one or need to create

### 5. Permissions Justification

The extension requests:
- `storage`: For local-first data storage (sessions, insights)
- `clipboardWrite`: For copying prompts to clipboard
- `clipboardRead`: For pasting AI responses (optional, user-initiated)
- `sidePanel`: For the extension interface

All permissions are clearly explained in the description and are necessary for core functionality.

### 6. Testing Checklist

Before submission, verify:
- [ ] Extension loads without errors
- [ ] All 6 gadgets work correctly
- [ ] Full evaluation workflow completes
- [ ] Import/Export functions work
- [ ] Dark mode toggles correctly
- [ ] No console errors in production build
- [ ] Manifest version matches package.json (1.1.0)

## 📝 Store Listing Copy

The full description is in `CHROME_STORE_DESCRIPTION.md`. Key highlights:

- **What it does**: 20+ metrics, 3 quality indices, works with any AI
- **New in 1.1.0**: Complete Gadgets App with 6 specialized tools
- **Perfect for**: Communities, researchers, policy makers, NGOs, citizens
- **How it works**: Clipboard-based workflow, no API keys needed
- **Scientific rigor**: Based on GyroDiagnostics mathematical framework

## 🔗 Links

- **GitHub Release**: https://github.com/gyrogovernance/apps/releases/tag/v1.1.0
- **Repository**: https://github.com/gyrogovernance/apps
- **Documentation**: https://github.com/gyrogovernance/apps#readme

