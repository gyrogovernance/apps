# Changelog

All notable changes to the AI-Empowered Governance Apps browser extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1-Prototype] - 2025-10-16

### Added
- Multi-app architecture: Welcome screen with app cards for Challenges, Journal, Insights, Settings
- **Challenges App**: TypeSelector, GyroDiagnostics Suite view (5 challenges), SDG Gallery (17 UN goals), Custom Builder, Prompt Workshop with quality analysis
- **Journal App**: Full router with JournalHome, SessionView, AnalysisView; active/recent sessions; progress tracking; pause/resume/delete controls
- **Insights App**: Library with filtering (type, QI, alignment), Detail view with tabs, Export (JSON/MD)
- **Session management**: Multi-session support with storage utilities, full session lifecycle tracking
- **Gyro Suite flow**: Creates 5 sessions, auto-advances between challenges, suite progress indicator
- Progressive disclosure for long prompts (Turn 1 synthesis)
- Example JSON template in Analyst section with best practices
- Raw transcript persistence in GovernanceInsight for full auditability
- SI calculation details disclosure (K=4 aperture, deviation explanation)
- N/A metric handling annotations (excluded from QI, zero-filled in SI)
- Alignment Rate displays correctly (/min not %)
- Session status tracking (active/paused/complete)
- Session sync: SynthesisSection and AnalystSection persist to sessions storage

### Changed
- Refactored from linear workflow to flexible app-based navigation
- Tailwind color classes use safe mapping (no dynamic strings)
- ReportSection updates state.results for progress tracking
- Sessions created via storage.sessions.create() with proper state management
- Report completion marks session as 'complete' status
- JournalApp now routes all synthesis/analyst views internally
- Transcript tab shows raw synthesis turns (epoch1 + epoch2) + analyst evaluations

### Fixed
- Dynamic Tailwind class purging in GyroSuiteView (colorMap)
- AR unit display (was showing %, now shows /min per spec)
- Progress dashboard shows report completion
- Session lifecycle properly wired end-to-end
- TypeScript type safety for Gyro Suite multi-challenge flow
- Active session deletion edge case (clears activeSessionId properly)
- Session list staleness (auto-refresh every 30s + after operations)
- Atomic session updates (returns updated session, handles not-found errors)

### Improved
- **Architecture**: Replaced 30s polling with chrome.storage.onChanged listener (cross-tab sync)
- **Architecture**: Atomic session operations (`sessions.update/delete` return full state)
- **Architecture**: Single source of truth (reload from storage after mutations)
- **Architecture**: Operation-level loading states (pause/resume/delete buttons show spinner)
- Extracted shared UI utilities (`ui-utils.ts`): score colors, alignment badges, challenge color map
- Extracted session utilities (`session-utils.ts`): progress calculation, duration formatting, next section logic
- Toast notification system replaces alerts (success/error/info with auto-dismiss)
- Loading states for async operations (session creation, suite start)
- Code organization: reduced duplication across components
- Removed redundant `onRefresh` prop pattern

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

### Changed
- Migrated to functional state updates to resolve race conditions
- Enhanced prompt generation with dynamic challenge integration
- Improved UI/UX with dark mode support and better user feedback

### Fixed
- Challenge content propagation from setup to synthesis prompts
- State race conditions between navigation and data updates
- Double turn markers in transcript parsing and validation
- GyroDiagnostics compliance with canonical challenge texts and scoring
- Element Picker message flow consistency

### Technical Details
- Chrome Extension (Manifest V3) + React + TypeScript
- Tailwind CSS with dark mode support
- Webpack 5 build system with Chrome Storage API
- GyroDiagnostics integration with canonical prompts and 120-point scoring

### Known Issues
- Bundle size warnings (400KB+ due to React dependencies)
- Performance optimization opportunities for large transcript handling

---

## Development Notes

This changelog tracks the initial prototype development phase completed on October 16th, 2025. This is the first version of the AI-Empowered Governance Apps browser extension, focused on establishing core functionality, user experience, and technical architecture. The extension serves as a prototype demonstrating the three-step protocol (Participation → Preparation → Provision) with GyroDiagnostics integration. While functional, this version requires further testing and refinement before full production deployment.
