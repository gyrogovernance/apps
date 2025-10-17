# Changelog

All notable changes to the AI-Empowered Governance Apps browser extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.1-Alpha] - 2025-10-17

### Added

**Welcome Page Visual Improvements**
- **Subtitle styling:** Made smaller (text-base) and bold (font-semibold) for better readability
- **Colored app cards:** Each app now has its own themed gradient background:
  - 📋 Challenges: Blue gradient (blue-50 to indigo-50)
  - 📓 Journal: Purple gradient (purple-50 to pink-50) 
  - 💡 Insights: Green gradient (green-50 to emerald-50)
  - ⚙️ Settings: Gray gradient (gray-50 to slate-50)
- Enhanced AppCard component to accept custom className for themed backgrounds
- Full dark mode support for all colored gradients
- **Fixed double title issue:** Removed redundant title from welcome page (extension title bar already shows it)
- **Consolidated redundant sections:** Moved "New Evaluation" and "Resume Session" buttons into the Quick Start Guide, removed duplicate "Quick Start" section
- **Better flow:** Now there's just the guide (with action buttons) and the "Getting Started" help section

**Quick Start Guide on Welcome Page**
- Added collapsible Quick Start Guide placed after app cards (less intrusive)
- **Entire block is clickable** to expand/collapse, not just the header
- Arrow indicator on right side (▶ when collapsed, ▼ when expanded)
- **Persistent state:** Guide remembers if you closed it (uses localStorage)
- Once closed, stays closed even when navigating away and back to Welcome page
- **Content organization:** Four apps overview first, then Smart Paste Detection guide below
- "Close Guide" pill button at bottom for explicit dismissal
- Instructions for enabling Chrome clipboard permissions for Smart Paste Detection
- Brief overview of all four apps (Challenges, Journal, Insights, Settings) in 2x2 grid
- Compact design with green/blue gradient styling
- Opens by default on first visit for better onboarding
- **Fixed description:** Insights are about governance solutions from AI, not model evaluation

**Enhanced Import with ZIP Support**
- Added support for importing ZIP archives containing multiple GyroDiagnostics data files
- Automatically searches ZIP files for any file ending with `data.json` (e.g., `analysis_data.json`, `evaluation_data.json`, `model_data.json`)
- Batch imports all valid files found in a ZIP archive with detailed feedback
- Shows number of files processed vs. found (e.g., "Imported 15 insights from 3/3 files")
- Maintains backward compatibility with single JSON file imports

### Improved

**Insight Detail Page - Content-First Redesign**
- **Governance challenge insights now displayed prominently at the top**, before metric cards
- Added dedicated "Insights on the Governance Challenge" section with green gradient styling
- **Markdown rendering** for analyst evaluations with proper formatting (headings, lists, emphasis, code blocks)
- Added **"Copy Insights Text" button** at bottom of insights section for easy clipboard access
- Analyst evaluations (the actual insights about the challenge) are now immediately visible and prominent
- Removed pathologies from insights section (they remain in Overview tab and metric cards)
- Removed generic metadata (participation/preparation/provision) that was incorrectly labeled as "insights"
- Fixed critical UX issue: the actual substantive insights about governance challenges are now the star
- Better visual hierarchy: 💡 Icon and clear heading makes insights section unmissable
- Metrics (QI, SI, AR) remain below as supporting quantitative data
- Custom markdown styling with green-themed code blocks and proper dark mode support

**Insights Library UX Overhaul**
- Redesigned with compact cards optimized for sidebar constraints
- Added synthesizer model filter for easier model comparison
- Reduced card size by ~70% while maintaining key information visibility
- Improved filter organization: search, model, challenge type stacked vertically
- Added scrollable list container for better space management
- Compact metric display: QI, SI, AR (abbreviated), and Pathology count
- Abbreviated alignment categories (V/S/L) to save space
- Streamlined action menu with smaller buttons
- Added interactive tooltips to all metric labels (QI, SI, AR, P) with canonical definitions
- Fixed tooltip positioning: now anchored to bottom of viewport to prevent clipping in scrollable lists

**Import UX**
- Updated button label to "Import GyroDiagnostics (JSON/ZIP)" for clarity
- Enhanced tooltip to mention both JSON and ZIP file support
- Better error reporting for ZIP files (shows which files failed and why)

**Smart Paste Detection**
- **Now enabled by default** for better out-of-box experience
- Users can easily disable in Settings if they prefer manual workflow

**README Restructuring for Better User Experience**
- **Quick Start section moved to top** with clear 2-minute setup guide
- **Chrome installation prominently featured** with step-by-step instructions
- **Development section moved to bottom** as it's less relevant for common users
- **Better flow**: Install → Use → Learn more → Contribute
- **Clear time estimates**: "30 seconds" for installation, "90 seconds" for first evaluation

**Fixed Installation Inconsistency - No More npm Required for Users**
- **Added pre-built release option**: Users can now download ready-to-install extension from GitHub releases
- **Two installation paths**: Option A (download ZIP) for users, Option B (build from source) for developers
- **Release automation**: Added `npm run release` script to create distributable packages
- **Version alignment**: Updated package.json version to match CHANGELOG (v0.2.1)
- **Chrome Web Store ready**: Extension can now be distributed without requiring npm knowledge
- **Better user experience**: Eliminates the technical barrier for non-developers

---

## [0.2-Alpha] - 2025-10-16

> **GyroGovernance Apps enter Alpha Release** 

### Highlights

**Multi-App Architecture**
- Transformed from linear workflow to modular app-based navigation
- Four main apps: Challenges, Journal, Insights, Settings
- Multi-session support with browser-style tabs
- Real-time cross-tab synchronization

**GyroDiagnostics Spec Compliance**
- Fixed SI calculation (K₄ normal equations now use correct `L = B×B^T` matrix)
- Corrected Alignment Rate formula (median-based per spec)
- Per-epoch analyst structure (4 evaluations total: 2 per epoch)
- Proper N/A handling (no silent defaults or zero-filling)
- Target Aperture A* standardized to 0.020701

**User Experience**
- Browser-style session tabs with status indicators
- Smart session management (auto-cleanup, pause/resume, clone)
- iOS-style persistent header with navigation
- Toast notifications and confirmation modals
- Keyboard shortcuts for quick navigation
- Progressive disclosure for complex content

### Added

**Challenges App**
- GyroDiagnostics Suite (5 canonical challenges with auto-progression)
- SDG Gallery (17 UN Sustainable Development Goals)
- Custom Challenge Builder
- Prompt Workshop for advanced users

**Journal App**
- Multi-session workspace with tabs
- Session lifecycle management (active/paused/complete)
- Progress tracking with visual dashboard
- Auto-save drafts to prevent data loss
- Session cloning for variations

**Insights App**
- Library with filtering (type, quality, alignment)
- Detailed view with tabbed navigation
- Export to JSON and Markdown
- Comprehensive metric explanations

**Settings App**
- Clipboard monitoring toggle
- Auto-save preferences
- Keyboard shortcuts reference
- Data management tools

**Developer Experience**
- Web preview mode (standalone testing without Chrome APIs)
- Comprehensive documentation (DEV_GUIDE, DEMO_CONTENT, TEST_RESULTS)
- Modular utility libraries
- Type-safe session helpers
- Token estimation throughout UI

### Fixed

**Critical Workflow Issues**
- Corrected evaluation flow: Analysts now evaluate after each epoch (not at the end)
- Fixed GyroDiagnostics Suite navigation (no longer stuck on home)
- Eliminated tab bar disappearing when closing active sessions
- Prevented "zombie" sessions that couldn't be managed or deleted

**Calculation Accuracy**
- SI calculation now returns `null` instead of misleading fallback values
- Empty specialization correctly contributes 0 to QI
- Behavior N/A values preserved in storage
- All metric aggregations use median per spec

**UI Polish**
- Fixed responsive layout issues (progress dashboard wrapping, spacing)
- Improved Element Picker button sizing and states
- Resolved three-dot menu overlap in Insights Library
- Added comprehensive null safety to prevent crashes

### Changed

- Refactored to single source of truth (sessions array, no legacy state fields)
- Replaced polling with `chrome.storage.onChanged` for real-time sync
- Atomic storage operations return full state for consistency
- Report completion automatically saves to Insights Library
- Tailwind color classes use safe mapping

### Tested

End-to-end validation completed with demo challenge "AI Healthcare Ethics Test":
- ✅ Two-epoch synthesis workflow (Claude 3.5 Sonnet, GPT-4o)
- ✅ Four analyst evaluations (Llama 3.1 405B, Gemini 1.5 Pro)
- ✅ Spec-compliant calculations (QI: 81.9%, AR: 0.0683/min, SI: N/A handled correctly)
- ✅ Multi-session management, keyboard shortcuts, cross-tab sync

---

## [0.1.0-Prototype] - 2025-10-16

### Added
- Chrome extension with Manifest V3 and side panel interface
- Three-step protocol: Participation → Preparation → Provision
- Challenge setup with type selection and UN SDGs domain integration
- AI synthesis with two-epoch process (6 turns each) and Element Picker
- Dual analyst evaluation with JSON validation and GyroDiagnostics scoring
- Quality calculations (Quality Index, Alignment Rate, Superintelligence Index)
- Export functionality (JSON, Markdown, GitHub contribution URLs)
- Chrome storage integration with persistent state management

### Technical Details
- Chrome Extension (Manifest V3) + React 18 + TypeScript
- Tailwind CSS with dark mode support
- Webpack 5 build system
- GyroDiagnostics integration with canonical prompts and 120-point scoring

### Known Issues
- Bundle size warnings (400KB+ due to React dependencies)
- Performance optimization opportunities for large transcript handling

---

## Development Notes

Version 0.2-Alpha represents the official Alpha Release of GyroGovernance. This release features a complete rewrite with multi-app architecture, full GyroDiagnostics spec compliance, and enterprise-grade session management. The extension is ready for alpha testing and community feedback.
