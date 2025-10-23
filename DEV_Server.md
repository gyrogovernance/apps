# Development Testing Guide

This guide explains how to test the GyroGovernance extension in different environments.

## Testing Methods

### 1. Chrome Extension (Recommended)
Load the extension in Chrome for full functionality:
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `dist/` folder
4. The extension will appear in your extensions toolbar

### 2. Local Web Server (For file:// testing)
Use the built-in development server to avoid CORS issues:

```bash
# Build and serve
npm run dev-server

# Or just serve (if already built)
npm run serve
```

Then open: http://localhost:3000/sidepanel.html

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

## Troubleshooting

### Import Fails with CORS Error
- Use the local web server: `npm run dev-server`
- Or load as a Chrome extension

### Import Shows "0 insights"
- This was a bug that has been fixed
- The insights are now properly saved to storage
- Try importing again

### File Not Found Error
- Ensure `results.zip` exists in the `dist/` folder
- Rebuild the project: `npm run build`

## Development Workflow

1. Make changes to source code
2. Run `npm run build` to compile
3. Test with either:
   - Chrome extension (reload the extension)
   - Local server (`npm run serve`)
4. Repeat as needed
