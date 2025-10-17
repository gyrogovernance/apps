# Changelog

All notable changes to the AI-Empowered Governance Apps browser extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
