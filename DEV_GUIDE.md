# Development Guide

## Web Preview Mode

### What is it?
The extension can run as a **standalone webpage** for rapid UI testing without needing to reload the browser extension. This uses a mock Chrome API that simulates extension storage using `localStorage`.

### Why?
- **Faster iteration**: No extension reload needed
- **Better debugging**: Full browser DevTools access
- **Visual testing**: Easier to test UI changes
- **Cross-platform**: Test on any browser, not just Chrome

### How it works

#### 1. Chrome API Mock (`src/lib/chrome-mock.ts`)
```typescript
// Detects if we're in extension context
const isExtension = typeof chrome !== 'undefined' && chrome.storage;

// If in web context, uses localStorage
export const chromeAPI = {
  storage: {
    local: {
      get: async (keys) => JSON.parse(localStorage.getItem('chrome_storage') || '{}'),
      set: async (items) => localStorage.setItem('chrome_storage', JSON.stringify(items)),
      remove: async (keys) => { /* removes from localStorage */ },
      clear: async () => localStorage.removeItem('chrome_storage')
    },
    onChanged: {
      addListener: (callback) => {
        // Listens to 'storage' events for cross-tab sync
      }
    }
  },
  runtime: {
    lastError: undefined
  },
  permissions: {
    request: async () => true // Auto-grants in mock
  }
};
```

#### 2. Storage Layer (`src/lib/storage.ts`)
```typescript
import { chromeAPI } from './chrome-mock';

// All storage operations use chromeAPI instead of chrome directly
export const storage = {
  get: async () => {
    const result = await chromeAPI.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] || INITIAL_STATE;
  },
  // ... other methods
};
```

#### 3. Single Entry Point (`index.html`)
The root `index.html` file serves as the **only** web preview entry point:
```html
<!DOCTYPE html>
<html>
<head>
  <title>AI-Empowered Governance Apps - Browser Preview</title>
  <style>/* Minimal styling + loading spinner */</style>
</head>
<body>
  <div id="root"><!-- Loading indicator --></div>
  <script src="dist/sidepanel.js"></script>
</body>
</html>
```

**Note:** The same build serves both extension (`public/sidepanel.html`) and web preview (`index.html`). No separate dev/production HTML files needed.

### Usage

#### Development workflow:
```bash
# 1. Build the extension
npm run build

# 2. Serve locally and open in browser
python -m http.server 8080
# Then navigate to: http://localhost:8080/index.html

# 3. Make changes to src/
# 4. Rebuild (npm run build) and refresh browser
```

**Note:** Use a local server instead of `file://` URLs to avoid CORS issues with localStorage and proper module loading.

#### HTML Entry Points:

The project has **two HTML files** for different contexts:

| File | Purpose | Context | Bundle |
|------|---------|---------|--------|
| `index.html` | Web preview | Browser testing | `dist/sidepanel.js` |
| `public/sidepanel.html` | Extension UI | Chrome extension | `dist/sidepanel.js` (copied to `dist/`) |

**Same JavaScript bundle, different entry points.** The extension loads `dist/sidepanel.html`, while web preview loads root `index.html`.

#### Building for production:
```bash
# Extension (dist/ folder)
npm run build

# The same build works for both extension and web!
```

### Key Differences: Extension vs Web

| Feature | Extension Mode | Web Mode |
|---------|---------------|----------|
| Storage | `chrome.storage.local` | `localStorage` |
| Cross-tab sync | `chrome.storage.onChanged` | `window.storage` event |
| Permissions | Real Chrome permissions | Auto-granted |
| Element Picker | `chrome.scripting` API | ⚠️ Not available |
| File Access | Extension sandbox | Normal web context |

### Limitations in Web Mode

1. **Element Picker won't work** (requires `chrome.scripting` API)
2. **Clipboard read** may require manual permission
3. **No side panel** (obviously - it's a standalone page)
4. **localStorage limits** (~5-10MB vs unlimited extension storage)

### Storage Structure

Both modes use the same data structure:
```typescript
{
  "gyrogovernance_notebook_v1": {
    sessions: Session[],
    activeSessionId: string,
    ui: { currentApp: 'welcome' | 'challenges' | ... },
    // ... rest of NotebookState
  }
}
```

Web mode stores this in:
```
localStorage['chrome_storage'] = JSON.stringify({ gyrogovernance_notebook_v1: {...} })
```

### Debugging Tips

**Clear all data:**
```javascript
// In browser console (web mode)
localStorage.clear();
location.reload();
```

**Inspect storage:**
```javascript
// Extension
chrome.storage.local.get(console.log);

// Web mode
console.log(JSON.parse(localStorage.getItem('chrome_storage')));
```

**Test cross-tab sync:**
1. Open `index.html` in two tabs
2. Create a session in tab 1
3. Tab 2 should auto-update (via storage event listener)

### Architecture Decision

We chose **conditional runtime detection** instead of separate builds:
- ✅ Single codebase
- ✅ No build configuration duplication  
- ✅ Easy to maintain
- ✅ Same bundle works everywhere

The `chromeAPI` object abstracts the difference, so components never need to know which context they're in.

---

## Quick Reference

**Start web preview:**
```bash
npm run build && open index.html
```

**Toggle dark mode:**  
Extension respects system preferences automatically.

**Reset all data:**
- Extension: Use Settings → Clear All Data
- Web: `localStorage.clear()` in console

**Check which mode:**
```javascript
console.log(typeof chrome !== 'undefined' && chrome.storage ? 'Extension' : 'Web');
```
