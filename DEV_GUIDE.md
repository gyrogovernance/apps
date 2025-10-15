# Development Guide

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Chrome browser (for testing)
- Basic understanding of React and TypeScript

### Initial Setup

```bash
# Install dependencies
npm install

# Start development build (with watch)
npm run dev
```

### Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `dist/` folder from this project
5. The extension icon should appear in your toolbar

## Development Workflow

### Making Changes

1. Edit source files in `src/`
2. Webpack will automatically rebuild (if `npm run dev` is running)
3. Click the refresh icon on the extension card in `chrome://extensions/`
4. Reopen the extension popup to see changes

### Project Structure

```
src/
├── components/          # React components
│   ├── Notebook.tsx    # Main app shell
│   ├── SetupSection.tsx
│   ├── SynthesisSection.tsx
│   ├── AnalystSection.tsx
│   ├── ReportSection.tsx
│   ├── ProgressDashboard.tsx
│   └── ElementPicker.tsx
├── lib/                # Core utilities
│   ├── calculations.ts # Quality metrics
│   ├── parsing.ts      # Input parsing
│   ├── prompts.ts      # Prompt templates
│   ├── storage.ts      # Chrome storage wrapper
│   └── export.ts       # Export utilities
├── types/              # TypeScript definitions
│   └── index.ts
├── styles/             # Tailwind CSS
│   └── main.css
├── popup.tsx           # React entry point
├── background.ts       # Service worker
└── content.ts          # Content script
```

## Key Concepts

### State Management

All state is managed through `NotebookState` interface and persisted to `chrome.storage.local`:

```typescript
const [state, setState] = useState<NotebookState>(INITIAL_STATE);

// Update state
const updateState = (updates: Partial<NotebookState>) => {
  const newState = { ...state, ...updates };
  setState(newState);
  storage.set(newState);
};
```

### Navigation Flow

1. **Setup** → Define challenge
2. **Epoch 1** → First synthesis (6 turns)
3. **Epoch 2** → Second synthesis (6 turns)
4. **Analyst 1** → First evaluation
5. **Analyst 2** → Second evaluation
6. **Report** → View insights & export

### Calculation Engine

Three main metrics calculated in `src/lib/calculations.ts`:

1. **Quality Index**: Weighted average of structure, behavior, specialization
2. **Alignment Rate**: Quality per minute (with VALID/SLOW/SUPERFICIAL categories)
3. **Superintelligence Index**: K4 graph topology analysis of behavior scores

### Element Picker

Content script injected into web pages to allow users to click on AI responses:

1. User clicks "Pick from Page" button
2. Content script injected into active tab
3. Mouseover highlights elements
4. Click captures element text
5. Text sent back to popup via message passing

## Testing

### Manual Testing Checklist

- [ ] Create new challenge
- [ ] Complete Epoch 1 (6 turns via paste)
- [ ] Complete Epoch 2 (6 turns via element picker)
- [ ] Complete Analyst 1 evaluation
- [ ] Complete Analyst 2 evaluation
- [ ] View generated report
- [ ] Download JSON
- [ ] Download Markdown
- [ ] Test GitHub share link
- [ ] Reset and start new process
- [ ] Reload extension (state persists)

### Type Checking

```bash
npm run type-check
```

## Common Issues

### Extension Not Loading

- Make sure you built the project (`npm run build` or `npm run dev`)
- Check that `dist/` folder exists and contains files
- Look for errors in `chrome://extensions/` page

### Changes Not Appearing

- Refresh the extension in `chrome://extensions/`
- Close and reopen the extension popup
- Check the console for errors (F12 in popup)

### Storage Issues

- Open extension popup
- Click "Reset" to clear all data
- Or manually clear via: `chrome://extensions/` → Extension details → "Remove extension data"

### Element Picker Not Working

- Make sure you're on a regular web page (not chrome:// URLs)
- Check browser console for errors (F12)
- Ensure `activeTab` and `scripting` permissions are granted

## Production Build

```bash
# Build optimized version
npm run build

# The dist/ folder is ready for Chrome Web Store submission
```

## Architecture Notes

### Manifest V3

Uses service workers instead of background pages. Key differences:

- Background script must be a service worker
- No DOM access in background
- Content scripts for page interaction
- Message passing for communication

### No Host Permissions

Extension operates entirely standalone:

- No API calls
- No web scraping
- User manually copies/pastes from AI chats
- Element picker is opt-in per page

### Cross-Browser Compatibility

Currently Chrome-focused, but designed for portability:

- Uses `chrome.*` APIs (Firefox supports via polyfill)
- No Chrome-specific features
- Can be adapted for Firefox with minimal changes

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for knowledge base contributions.

For code contributions, open an issue first to discuss the change.

## Questions?

Open an issue: https://github.com/gyrogovernance/apps/issues

