# Development Testing Guide

This guide explains how to test the GyroGovernance extension in different environments.

## Testing Methods

### 1. Chrome Extension (Recommended)
Load the extension in Chrome for full functionality:
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `dist/` folder
4. The extension will appear in your extensions toolbar

### 2. Local Web Server with Hot Reload (Recommended for Development)
Use webpack-dev-server for instant hot reload during development:

```bash
# Start dev server with hot reload
npm run dev-server
```

The server will automatically open http://localhost:3000/sidepanel.html with hot module replacement enabled.

For static file serving (without hot reload):
```bash
# Build and serve static files
npm run serve-static

# Or just serve (if already built)
npm run serve
```

### 3. Direct File Loading (Limited)
You can open `dist/sidepanel.html` directly in your browser, but:
- Import functionality may not work due to CORS restrictions
- Some features may be limited
- Use the local web server instead for better testing

## Import Functionality

The "Import Official Results" feature works in:
- ✅ Chrome Extension mode
- ✅ Local web server (http://localhost:3000)
- ❌ Direct file:// loading (CORS restrictions)

### Asset Locations (Unified)

We use a single, consistent assets layout in both dev and prod:

- Source of truth: `assets/`
  - `assets/icons/*`
  - `assets/media/*`
  - `assets/fonts/*`
  - `assets/files/results.zip`

- Dev server: serves assets at `/assets/...`
- Production build: copies subfolders into `dist/assets/...`

Manifest and code now reference `assets/...` paths, so both dev and prod resolve identically.

## Troubleshooting

### Import Fails with CORS Error
- Use the local web server: `npm run dev-server`
- Or load as a Chrome extension

### Import Shows "0 insights"
- This was a bug that has been fixed
- The insights are now properly saved to storage
- Try importing again

### File Not Found Error
- Ensure `assets/files/results.zip` exists in the repository
- Rebuild the project: `npm run build`

## Development Workflow

### Hot Reload Development (Recommended)

For the fastest development experience with automatic hot reload:

```bash
npm run dev-server
```

This will:
- ✅ Start webpack-dev-server with Hot Module Replacement (HMR)
- ✅ Automatically rebuild and refresh when you save files
- ✅ Open your browser to http://localhost:3000/sidepanel.html
- ✅ Preserve React component state during updates when possible

**No manual rebuilds needed!** Just save your files and see changes instantly.

### Manual Build Workflow

If you prefer manual control or need to test the production build:

1. Make changes to source code
2. Run `npm run build` to compile
3. Test with either:
   - Chrome extension (reload the extension)
   - Local server (`npm run serve-static`)
4. Repeat as needed

## Running Tests

We use Jest for unit tests (e.g., core calculations for QI, SI, AR).

Commands:

```bash
# Run all tests once
npm run test

# Watch mode (reruns on file changes)
npm run test:watch

# Coverage report
npm run test:coverage
```

Notes:
- Test suite location: `src/lib/calculations.test.ts`
- Tested areas include Superintelligence Index (SI), Quality Index (QI), Alignment Rate (AR), and aggregation helpers
- If tests fail to run, ensure dependencies are installed: `npm install`

## Notes on Public Folder

- `public/` is not a standalone build; it's a source for the HTML template and `manifest.json` only.
- We removed `public/fonts` and `public/icons`. Do not store assets in `public/`.
- Dev server serves `/assets` directly from the root `assets/` directory.
