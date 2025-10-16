# Changelog

All notable changes to the AI-Empowered Governance Apps browser extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1-Prototype] - 2025-10-16

### Fixed - GyroDiagnostics Spec Compliance

**Core Calculations & Data Integrity:**
- **SI calculation**: Fixed K₄ normal equations to use `L = B×B^T` instead of incorrect `B^T×B`; removed misleading fallback (was returning 50 with deviation 1.00×, now returns `null`)
- **Alignment Rate**: Now uses `median(QI_per_epoch) / median(duration_per_epoch)` with normalized QI (0-1 scale) per spec
- **Behavior N/A handling**: N/A values preserved in storage (not coerced to 0); SI strictly requires all 6 metrics numeric or returns `null`
- **Specialization defaults**: Empty specialization contributes 0 to QI (removed fabricated 7.0 default)
- **Target Aperture A***: Updated to 0.020701 everywhere for consistency with reference implementation

**Data Model & Per-Epoch Structure:**
- **Session analysts**: Restructured to per-epoch storage (`session.analysts.epoch1/epoch2.analyst1/analyst2`) for 4 total evaluations
- **AnalystSection**: Added `epochKey` prop; generates prompts from single epoch transcript only (not both epochs)
- **Validation**: Updated to check all 4 per-epoch analyst slots before allowing report generation
- **Session utilities**: Progress tracking and next-step logic updated for per-epoch analyst completion
- **Storage**: Session creation/cloning initializes all 4 analyst slots correctly

**Reporting & Aggregation:**
- **ReportSection**: Computes per-epoch QI, aggregates via medians, calculates per-epoch SI with median display
- **Report generator**: Aligned with ReportSection for consistent median-based calculations
- **Export markdown**: NaN/null SI values display as "N/A" instead of raw "NaN"

**UI & Metric Definitions:**
- **Metric definitions**: Updated all UI text to match spec (removed "zero-filled" language, corrected AR formula to show medians, fixed specialization description)
- **Error messages**: Changed "check console for errors" to specific explanation: "SI requires all 6 behavior metrics to be numeric (no N/A values)"
- **Null safety**: Added comprehensive null checks (`value == null || isNaN(value)`) before calling `.toFixed()` to prevent crashes
- **InsightsLibrary**: Fixed three-dot menu overlapping with date

**Critical User Flow:**
- **Evaluation flow order**: Corrected to logical sequence: Setup → Epoch 1 → Analyst 1 (E1) → Analyst 2 (E1) → Epoch 2 → Analyst 1 (E2) → Analyst 2 (E2) → Report
  - Previously: Both epochs completed before any analyst evaluations (illogical)
  - Now: Analysts evaluate immediately after each epoch (maintains context)
  - Files: `validation.ts`, `session-utils.ts`, `ProgressDashboard.tsx`

**Critical Bug Fixes:**
- **GyroDiagnostics Suite routing**: Starting the suite now navigates to first session (was stuck on JournalHome)
- **Session selection**: JournalApp properly shows SessionView when activeSessionId is set
- **ElementPicker crash**: Fixed `chrome.runtime.onMessage` access in web mode
- **ReportSection data access**: Reads from active session via `getActiveSession()` (not legacy `state.analysts`)
- **Insights app navigation**: Always resets to library view when entering Insights app (prevents "Loading insight..." stuck state)
- **Single Source of Truth**: Removed legacy field mirroring; sessions array is the only data source
- **Active session deletion**: Properly clears activeSessionId to prevent navigation errors

### Added

**Multi-App Architecture:**
- **Welcome screen**: App cards for Challenges, Journal, Insights, Settings with navigation
- **Challenges App**: Type selector, GyroDiagnostics Suite (5 challenges), SDG Gallery (17 UN goals), Custom Builder, Prompt Workshop
- **Journal App**: Session management (create/pause/resume/delete/clone), progress tracking, multi-session support
- **Insights App**: Library with filtering (type, QI, alignment), detail view with tabs (Overview, Structure, Behavior, Specialization, Transcript), export (JSON/Markdown)
- **Settings App**: Clipboard monitoring toggle, auto-save preferences, keyboard shortcuts, data management

**Session Management:**
- Multi-session support with atomic storage operations
- Session lifecycle tracking (active/paused/complete)
- Session cloning with automatic activation
- Gyro Suite flow: Creates 5 sessions, auto-advances between challenges

**UI Components & Features:**
- **Persistent header**: Breadcrumb navigation, session context, quick app switcher
- **Toast system**: Replaces browser alerts with styled, auto-dismissing notifications
- **Modal system**: useConfirm hook for confirmation dialogs
- **Keyboard shortcuts**: Cmd/Ctrl+N/J/I/H for app navigation, Escape for home
- **Smart tooltips**: Hover definitions for GyroDiagnostics terms (QI, SI, AR, etc.)
- **JourneyMap**: Visual progress indicator with stage icons
- **ProgressDashboard**: Icons, time estimates, gradient bar, clickable navigation

**Utilities & Developer Experience:**
- **Session helpers**: `getActiveSession()`, `requireActiveSession()` utilities
- **UI utilities**: Color helpers, alignment badges, challenge icons
- **Report generator**: Pure business logic extracted from components
- **Validation utilities**: Session completeness checks, next step detection
- **Clipboard assistant**: Smart AI response/JSON detection (opt-in via settings)
- **Auto-save drafts**: Prevents data loss for in-progress turns and analyst responses
- **Web preview mode**: Chrome API mock (`chrome-mock.ts`) enables standalone webpage testing (uses localStorage)
- **Token estimation**: Live word/token counters throughout app (1.3× word count heuristic)
- **Metric definitions**: Canonical reference (`metric-definitions.ts`) for all GyroDiagnostics metrics with formulas and explanations

**UX Enhancements:**
- Progressive disclosure for long prompts (collapsible details)
- Example JSON template in analyst section
- Raw transcript persistence for auditability
- SI calculation details (K₄ aperture, deviation explanation)
- Comprehensive metric tooltips in InsightDetail (expandable "Learn more" for every metric)

### Changed

- Refactored from linear workflow to flexible app-based navigation
- Replaced 30s polling with `chrome.storage.onChanged` listener for real-time cross-tab sync
- Atomic session operations (`sessions.update/delete` return full state)
- Single source of truth: All components read from active session, no legacy state fields
- JournalApp routes all synthesis/analyst views internally
- Tailwind color classes use safe mapping (no dynamic string interpolation)
- Report completion marks session as 'complete' and saves to insights library

### Documentation

- **DEV_GUIDE.md**: Web preview mode, chrome-mock architecture, debugging tips, development workflow
- **DEMO_CONTENT.md**: Quick testing reference with single-sentence responses, analyst JSON examples, model names
- **TEST_RESULTS.md**: Full spec compliance verification with test scenarios and results

### Tested - Full End-to-End Validation

Verified complete workflow using browser automation with demo challenge **"AI Healthcare Ethics Test"** (Custom, Normative, SDG 3):

**Synthesis:**
- Epoch 1: Claude 3.5 Sonnet (12 min, 6 turns)
- Epoch 2: GPT-4o (10 min, 6 turns)

**Analyst Evaluations (Per-Epoch):**
- Analyst 1 - Epoch 1: Llama 3.1 405B ✅
- Analyst 2 - Epoch 1: Gemini 1.5 Pro ✅
- Analyst 1 - Epoch 2: Llama 3.1 405B ✅
- Analyst 2 - Epoch 2: Gemini 1.5 Pro ✅

**Results (Spec-Compliant):**
- Quality Index: 81.9% ✅
- Superintelligence Index: N/A (Comparison metric = "N/A", SI blocked correctly) ✅
- Alignment Rate: 0.0683/min (VALID category) ✅
- Target Aperture A*: 0.020701 ✅
- All 4 analyst evaluations aggregated correctly ✅
- Behavior "N/A" preserved in storage ✅
- No silent defaults or fallback values ✅

**User Flow:**
- Challenge creation → Session start → Epoch 1 (6 turns) → Analyst 1 Epoch 1 → Analyst 2 Epoch 1 → Epoch 2 (6 turns) → Analyst 1 Epoch 2 → Analyst 2 Epoch 2 → Report generation → Insights library save ✅
- Progressive disclosure, toast notifications, keyboard shortcuts, cross-tab sync all verified ✅

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

This changelog tracks the prototype development completed on October 16, 2025. Version 0.1.1 represents a fully spec-compliant implementation of the GyroDiagnostics evaluation methodology with a flexible multi-app architecture. The extension is ready for user testing and production deployment.
