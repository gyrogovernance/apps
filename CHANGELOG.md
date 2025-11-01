# Changelog

All notable changes to the AI-Empowered Governance Apps browser extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.4] - 2025-10-01

### Changed
- Started extensive tests
- Improved Prompts

---

## [1.0.3] - 2025-10-30

### Changed
- SmartTooltip: lighter background, rounded border, subtle margin (bottom/sides), and shadow for better readability in sidebar
- GadgetAccordion: SI gauge shows alignment category label (no numeric), medium size to prevent overlap; Results no longer collapses when completing Analysis
- Guided instructions (Rapid Test): clarified Step 1/Step 2 copy; moved benefits into guide and added metrics note after both steps
- Consolidated ring visuals: replaced inline metric rings with shared component in GadgetAccordion, ModelTracker, and Rapid Test QuickSummary
- Unified analyst aggregation: `calculations.aggregateAnalysts` now delegates to `score-aggregator.aggregateAnalystScores` (single source of truth)
- Centralized Gadget metadata in `src/lib/gadgets.ts`; updated Accordion/Selector/TaskView/Results to consume it
- Normalized SI gauge in `Insights/ModelTracker` to 0–100 with thresholds (≥80 green, ≥50 yellow)
- Fixed Settings export median bug (two-value median now averaged correctly)
- Reused detector export builders in Rapid Test (`ExportActions` uses `exportDetectorAsMarkdown/JSON`)
- Restored drafts in `AnalystEvaluationForm` via `useDrafts` when `sessionId`/`draftKey` present
- SI in gadget insights now returns `NaN` (not 0) when behavior N/A; aperture stays `A_STAR`
- Removed duplicate SI card in `GlossaryApp`
- Added small `stats.ts` (median, mostCommon) and refactored Insights views to use it
- Added `useScrollToTop` hook; replaced repeated effects in `InsightsApp`, `SettingsApp`, `JournalApp`, `ChallengesApp`, `WelcomeApp`
- Made `CopyableDetails` uncontrolled (internal open state) to respect user toggles

### Fixed
- `lib/gadgets.ts` now imports prompts from `./prompts` (was metric-definitions)
- `GadgetTaskView` uses `GADGETS[gadgetType]` (removed stale `GADGET_INFO` reference)
- Glossary AR categories corrected to spec: VALID (0.03–0.15 /min), SUPERFICIAL (>0.15 /min), SLOW (<0.03 /min)
- QI ring color thresholds unified (≥80 green, ≥60 yellow, ≥40 orange, else red)
- Removed unused imports in `SuiteReports`, `GadgetSelector`, `GadgetAccordion`
- Replaced hard-coded 'Unspecified' with `UNSPECIFIED_MODEL.value` across components
- Transcript parser method naming: `parseByTurnLabel` now reports `turn_labels` (clarity vs. `turn_markers`)

### Removed
- Deleted unused legacy `GadgetResults.tsx` (dual-analyst expectations no longer apply)

### Previous (2025-10-29)

### Major Refactoring: Rapid Test (Formerly Detector)

**Removed:**
- **Deception Risk Score (DRS)**: Eliminated entire DRS calculation and all UI references. Removed from calculations.ts, tests, and all components.
- **Transcript Storage**: Removed all transcript handling and storage. Enforced JSON-only workflow throughout.
- **Legacy "Detector" Terminology**: Renamed all references from "Detector" to "Rapid Test" with 🔬 icon.

**Renamed:**
- **Folder**: `DetectorApp/` → `RapidTestApp/`
- **Files**: `detector-export.ts` → `rapid-test-export.ts`
- **Component**: `TruthSpectrumGauge` → `StructuralIntegrityGauge` (repurposed to display SI instead of DRS)

**Updated Workflow:**
- **Rapid Test**: Now correctly documents single analyst evaluation via JSON workflow (no dual analysts, no transcript storage)
- **Journal App**: Correctly maintains dual analyst evaluation pattern

**Terminology Corrections:**
- Changed all "structural patterns" → "behavioral balance" across codebase
- Updated SI definition to emphasize behavioral balance measurement
- Removed em dashes throughout all files

**Documentation Updates:**
- `GyroGovernance_Apps_General_Specs.md`: Added Key Concepts, FAQ, Challenge sections; fixed Rapid Test workflow
- `README.md`: Added Key Concepts, FAQ sections; corrected Rapid Test description
- `USER_FLOW_AND_USABILITY.md`: Updated Detector → Rapid Test; corrected workflow patterns

**Code Quality:**
- All imports updated to new RapidTestApp folder structure
- Removed ~50+ instances of DRS references
- Updated ~25+ files with terminology corrections

---

## [1.0.3] - 2025-10-28

### Spec Compliance & Calculation Fixes
- **SI Implementation**: Added optional weights parameter for spec-compliant weighted Hodge projection; fixed division-by-zero with epsilon protection
- **SI Aggregation**: Fixed report generation to compute medians for SI, aperture, and deviation across epochs (was using epoch 1 only)
- **Pathology Aggregation**: Unified pathology detection across all 4 analyst evaluations (was using epoch 1 only)
- **DRS Formula**: Rewrote with normalized components (0-100 scale) to properly reach all categories (LOW/MODERATE/HIGH)
- **Constants**: Centralized `A_STAR = 0.02070` constant to prevent drift between code and UI
- **Confidence Metric**: Removed non-spec metric from calculations and UI (was always HIGH due to logic bug)

### Testing
- Added Jest test suite with 19 tests covering SI, DRS, QI, AR, and aggregation logic
- Tests validate edge cases: balanced/unbalanced inputs, NaN handling, weighted calculations, factor breakdowns
- Created `docs/TESTING.md` documentation for test framework

### UI Polish
- **QuickSummaryCard**: SI ring now scales to /100 (full range), updated color thresholds
- **TechnicalDetails**: Added deviation interpretation to aperture display
- **GadgetResults**: Fixed to use proper `calculateDeceptionRiskScore()` instead of QI proxy
- **Export**: Added note for single analyst evaluations in markdown export
- **GadgetAccordion**: Fixed aperture display to show calculated value from SI instead of hardcoded target; removed hardcoded messages and intermediate calculation displays

---

## [1.0.2] - 2025-10-27

### Changed

**🎨 Gadgets App - Single-Page Accordion Flow**
- **Major UX Improvement**: Replaced 4-page wizard with single-page accordion interface
- **Eliminated Unnecessary Step**: Removed transcript collection bottleneck - users paste AI output directly into analyst prompts
- **Progressive Disclosure**: Steps unlock as user completes each phase
- **Improved Efficiency**: 
  - ~40% fewer clicks (15 → 9 clicks total)
  - All context visible on one page
  - Can jump back to any completed step for editing
- **Updated Components**:
  - `GadgetAccordion.tsx` - New accordion-based workflow
  - Simplified `GadgetsApp.tsx` routing (selector → accordion)
  - Updated analyst prompts to include `[PASTE THE AI OUTPUT FROM STEP 1 HERE]` placeholder
- **Benefits**:
  - No page transitions = faster workflow
  - Clear progress indication with expandable steps
  - Better user control - can edit any completed step
  - Reduced cognitive load with visible context

---

## [1.0.1] - 2025-10-27

### Added
- CoreMetricsRings component (QI/SI/AR rings, two-line labels, tooltips) in `src/components/shared/CoreMetricsRings.tsx`
- Prompt update: analyst `insights` must include "## Actionable Recommendations" (3–5 items) in `src/lib/prompts.ts`

**🤖 Gadgets App - Unified AI Assessment Tools**
- Consolidated quick AI assessment tools into single workspace
- Replaces standalone Detector App with integrated Gadgets workflow
- Added 5 specialized gadgets for policy professionals:
  - **🔍 Detector** - Rapid deception analysis (existing functionality)
  - **📊 Policy Auditing** - Extract claims & evidence from documents
  - **📋 Policy Reporting** - Generate executive synthesis with attribution
  - **🦠 AI Infections Sanitization** - Normalize Unicode and remove hidden patterns
  - **💊 Pathologies Immunity Boost** - Enhance content across 12 metrics
- Unified workflow for all gadgets: Task → Analyst 1 → Analyst 2 → Results
- All gadgets use same 12-metric GyroDiagnostics evaluation framework

**New Components**
- `GadgetsApp.tsx` - Main router for gadget workflows
- `GadgetSelector.tsx` - Visual selector with category organization (Analysis/Treatment)
- `GadgetTaskView.tsx` - Task prompt display and AI output collection
- `GadgetAnalyst.tsx` - Reuses existing AnalystEvaluationForm for evaluation
- `GadgetResults.tsx` - Results display using Detector result components
- `generateInsightFromGadget()` - Insight generation helper in report-generator.ts

**Task Prompt Templates**
- Added 4 battle-tested task prompts to `prompts.ts`:
  - `POLICY_AUDIT_TASK` - Claims & Evidence Graph template
  - `POLICY_REPORT_TASK` - Executive synthesis with attribution
  - `SANITIZE_TASK` - Unicode/whitespace normalization instructions
  - `IMMUNITY_BOOST_TASK` - 12-metric quality enhancement guidance

**Type Definitions**
- Added `GadgetType` - 5 gadget identifiers
- Added `GadgetView` - Navigation states (selector → task → analyst1/2 → results)
- Updated `AppScreen` to include `'gadgets'`
- Added gadget UI state fields to `NotebookState`

### Changed

**Navigation Updates**
- WelcomeApp: "Detector" card replaced with "Gadgets" card (🤖 icon)
- PersistentHeader: Updated to navigate to `'gadgets'` instead of `'detector'`
- Notebook routing: Now routes `'gadgets'` app instead of `'detector'`
- Quick Start Guide: Updated references from Detector to Gadgets

**Integration**
- Detector now accessible as one gadget type within Gadgets App
- All Detector components reused for new gadgets
- Maintains backward compatibility with existing functionality

### Technical Details

- Reused existing infrastructure (90% code reuse)
- Modular architecture following established patterns
- Draft persistence with namespaced keys
- All gadgets generate GovernanceInsights compatible with Insights library
- Export functionality works for all gadget types
- Platform-agnostic design (no API keys required)

### Fixed

- Build errors related to AppScreen type changes
- Detector component prop mismatches in GadgetResults
- aggregateAnalysts function call signature
- GovernanceInsight schema compatibility for gadgets
- Navigation state management for gadget workflows

---

## [1.0] - 2025-10-23

### Added

**🔍 AI Lie Detector - New App**
- Complete structural deception analysis tool for AI conversation transcripts
- **Truth Spectrum Gauge**: Visual half-circle SVG showing deception risk level (0-100)
- **Dual Analyst Evaluation**: Uses 2 different AI models for robust assessment
- **Risk Score (DRS)**: Mathematical topology-based scoring system
- **Pathology Detection**: Identifies specific failure modes (sycophantic_agreement, deceptive_coherence, etc.)
- **Transcript Parsing**: Multiple strategies for real-world AI conversation formats
- **Export Options**: Markdown reports and JSON data export
- **Insight-First Architecture**: Saves completed analyses as GovernanceInsights

**Core Components**
- `DetectorApp.tsx` - Main router component with view management
- `DetectorInput.tsx` - Transcript collection with parsing and validation
- `DetectorAnalyst.tsx` - Wrapper around AnalystEvaluationForm for dual evaluation
- `DetectorResults.tsx` - Results display with Truth Spectrum and detailed metrics
- `TruthSpectrumGauge.tsx` - Half-circle SVG gauge visualization
- `DetectorGuide.tsx` - Educational component explaining methodology

**Supporting Components**
- `QuickSummaryCard.tsx` - Executive summary with key metrics
- `PathologyReport.tsx` - Detected pathologies with explanations
- `TechnicalDetails.tsx` - Collapsible technical information
- `ExportActions.tsx` - Save as insight and export options

**Utilities & Infrastructure**
- `detector-export.ts` - Markdown and JSON export utilities
- `transcript-parser.ts` - Multi-strategy transcript parsing with confidence scoring
- `score-aggregator.ts` - Centralized analyst score aggregation and quality metrics
- `calculateDeceptionRiskScore()` - Core DRS calculation in `calculations.ts`
- `generateRapidTestAnalystPrompt()` - Specialized prompt for deception analysis

**Navigation Integration**
- Added Detector card to WelcomeApp with 🔍 icon
- Added Detector navigation button to PersistentHeader
- Integrated DetectorApp into main Notebook router
- Updated type definitions for DetectorView and DetectorMode

**📖 Glossary App - New Modal**
- Complete quick reference for all GyroDiagnostics measures and metrics
- **Modal Interface**: Opens as glass card with heavy backdrop blur (`backdrop-blur-md`), closes in same page
- **Comprehensive Coverage**: Core metrics, structure/behavior/specialization metrics, pathologies, challenge types
- **Educational Content**: Methodology explanation and technical details
- **Dual Mode Support**: Full light/dark mode compatibility
- **Quick Access**: Available from WelcomeApp card and PersistentHeader button
- **Keyboard Shortcut**: `Cmd/Ctrl+G` to toggle glossary modal
- **Fixed Layout**: Proper vertical scaling (85vh height) with scrollable content and fixed header/footer
- **UX Improvements**: Compact design with reduced padding, smaller title, close button properly positioned, removed unnecessary footer
- **Layout Refinements**: Fixed outer margins (removed GlassCard default padding with `p-0` override), reduced inner padding, added compact promotional card at end of list with smaller text and buttons
- **Bug Fix**: Fixed Glossary modal not opening from Welcome screen by adding modal rendering to both Welcome and other app sections
- **Contrast Improvements**: Updated all entry blocks to use high-contrast backgrounds (white/90 in light mode, black/90 in dark mode) for better readability

### Technical Details

**Risk Score Calculation**
- Based on Superintelligence Index deviation from optimal (100)
- Pathology count penalty (+10 per detected pathology)
- Aperture severity assessment (non-associative residual > 0.02070)
- Deceptive coherence pattern detection (Literacy >> Groundedness gap)
- Hysteresis applied to prevent borderline flapping

**Transcript Parsing Strategies**
- Turn markers: `{Turn N}` or `Turn N:` patterns
- Speaker labels: `User:` and `Assistant:` alternating
- Paragraph-based: Intelligent chunking for 3-6 turns
- Confidence scoring: HIGH/MEDIUM/LOW based on parsing success

**Draft-Based Persistence**
- Uses `state.drafts` for temporary storage during workflow
- Crash recovery with automatic draft loading
- Clean separation from Journal sessions (Insight-first approach)
- Atomic state updates to prevent UI/storage desynchronization

### User Experience

**Workflow**
1. Paste AI conversation transcript (3-6 turns recommended)
2. Select challenge type and detection mode
3. Evaluate with 2 different AI models using specialized prompts
4. View Truth Spectrum Gauge and detailed analysis
5. Save as insight or export Markdown/JSON reports

**Educational Features**
- Clear disclaimers about what the tool measures
- Methodology explanation using GyroDiagnostics framework
- Visual guidance through the analysis process
- Comprehensive export options for sharing results

---

## [0.2.4-Alpha] - 2025-10-22

### Added

**Code Optimization & Refactoring**
- Consolidated duplicate badge styling logic into `ui-utils.ts` with `getStatusBadgeColor()`
- Extracted suite detection logic to `lib/suite-detection.ts` (removed 225 lines of duplication)
- Added `React.memo` and `useCallback` optimizations to Timer component
- Enhanced storage error handling with `withStorageErrorHandling()` helper
- Removed debug console.log statements from production code

### Added

**Visual Design System - Glassmorphism**
- Implemented unified glassmorphism design language across entire application
- Created reusable `GlassCard` component with variants (`neutral`, `glassBlue`, `glassPurple`, `glassGreen`)
- Border gradient system (`blue`, `purple`, `green`, `pink`) for visual hierarchy
- Density options (`default`, `dense`) for different content types
- Automatic dark mode adaptation with optimized contrast and accessibility

**Component Updates**
- Welcome screen with glass effects on app icons, Quick Start Guide, and footer
- All Challenges screens (TypeSelector, GyroSuite, SDG Gallery, Custom Builder, Prompt Workshop)
- All Journal screens (JournalHome with session cards)
- All Insights screens (Library, Detail, Model Tracker, Suite Reports)
- Settings panels with consistent glass styling

### Changed

**Insights Library UX Refinement**
- Restructured with single outer glass container wrapping filters and list
- Fixed scroll behavior: title and filters stay fixed, only list scrolls
- Inner insight cards use solid backgrounds (`bg-white/60`, `bg-gray-800/90`) like Quick Start Guide blocks
- Proper contrast in both light and dark modes for better accessibility
- Eliminated z-index conflicts and shadow clipping issues

**Visual Consistency**
- Unified design language across all screens
- Consistent hover effects and transitions
- Strategic use of border gradients for content type indication
- Smooth glass morphism aesthetic with proper shadow layering
- Mobile-responsive glass effects

### Technical Details

- `GlassCard` component with TypeScript interfaces and prop validation
- Proper `overflow-hidden` containers to prevent scroll issues
- Fixed z-index layering using constants
- Build optimization with no compilation errors
- Bundle size: 856 KiB (stable)

---

## [0.2.3-Alpha] - 2025-10-21

### Added

**Documentation**
- Comprehensive [GyroGovernance Apps General Specifications](docs/GyroGovernance_Apps_General_Specs.md) document
- High-level architecture overview and user journey mapping
- Technical specifications and integration points documentation
- Future roadmap and development guidelines

**Welcome Screen Improvements**
- Official GyroDiagnostics results import functionality with direct link to [GitHub repository](https://github.com/gyrogovernance/diagnostics)
- One-click import of pre-evaluated insights from frontier models (GPT-4o, Claude Sonnet 4.5, Grok-4)
- Loading state with spinner during import process
- Automatic navigation to Insights app after successful import

### Changed

**Build Configuration**
- Updated webpack config to include `results.zip` in build output for Chrome extension access

### Removed

**Welcome Screen Cleanup**
- Smart Paste Detection section (feature no longer used)
- Outdated clipboard permission instructions

**New Shared Components & Hooks**
- `useClipboard` hook for centralized clipboard operations with status feedback
- `useDrafts` hook for auto-save/load draft logic with configurable debounce
- `CopyableDetails` component for collapsible details with integrated copy button
- `TurnsSummary` component for standardized turn display with word counts and timestamps
- `ModelSelect` component for consistent model selector UI
- Error utilities library (`error-utils.ts`) for centralized error handling
- Constants library (`constants.ts`) for z-index layering and UI constants
- JSDoc comments for complex functions (`calculateSuperintelligenceIndex`, `aggregateAnalysts`, `generateInsightFromSession`, session helpers)
- Storage API Patterns documentation in `.cursorrules`

**UI/UX Enhancements**
- Tab overflow scroll indicators with gradient shadows in JournalTabs
- Progress Dashboard scroll hint when auto-scrolling to Epoch 2
- Read-only model display for Epoch 2 showing "Model (from Epoch 1)"
- Timer initialization from session storage

### Fixed

**Critical Bugs (USER-REPORTED)**
- Timer persistence: Values now sync to session storage on unmount
- Turn flicker: Epoch writes now fetch fresh session before merging
- Suite transition stale state: Timer resets properly on session switch

**Data & Calculations**
- GyroDiagnostics Suite now starts at Formal instead of Epistemic (atomic `sessions.createMany()`)
- Analyst model selection no longer resets unexpectedly
- Analyst scores now editable after completion
- Epoch 2 enforces same model as Epoch 1
- SI calculation N/A issue resolved (all 6 metrics now required)
- Pathology frequency divisor corrected from `/12` to `/4`
- Alignment Rate now uses precise calculation (`secondsToMinutesPrecise()`)
- Alignment badge fallback for invalid categories
- TypeScript type safety improvements in import.ts

**Architecture**
- Migrated to `getActiveSession()` helper throughout (removes legacy state field access)
- Eliminated ~150 lines of duplicate calculation logic (unified via `generateInsightFromSession()`)
- Replaced manual `state.sessions.find()` with session helpers (6 instances)
- Consistent z-index layering using constants

### Changed

**BREAKING - Schema 3.0 Migration**
- Removed legacy top-level fields (`challenge`, `process`, `epochs`, `analysts`, `results`)
- Sessions array is now Single Source of Truth
- Session completion via `Session.completedInsightId` instead of global `state.results`
- INITIAL_STATE reduced from 50+ lines to 12 lines

**Code Refactoring**
- SynthesisSection: 520→380 lines (-27%)
- AnalystSection: 610→380 lines (-38%)
- Simplified suite transitions (only updates `activeSessionId`)
- Timer component: Added `initialDuration` prop and reset effect
- Unified error handling via `handleStorageError()`
- Prompts changed from "up to six turns" to "exactly six turns"

**Performance**
- Timer storage writes: 60→2 writes/min (-97%)
- InsightsLibrary filtering with `useMemo()`
- ReactMarkdown rendering memoized in InsightDetail
- Removed ~100 lines of legacy state sync code

**UI Improvements**
- Challenge ordering now matches spec (Formal, Normative, Procedural, Strategic, Epistemic)
- Setup step removed from Journal App
- Session cards redesigned (3x more compact, 3-dot menu, grid layout)
- Toast positioning moved to bottom-left
- Dark mode fixes for copy buttons
- **Multi-View Insights Architecture**: Three-tab Insights App (Library, Suite Reports, Model Tracker)
- Retroactive suite detection for existing insights
- Suite export functionality with aggregate metrics
- Visual enhancements: sparkline charts, excellence badges (⭐), progress rings

### Removed

**Dead Code (~545 lines total)**
- SetupSection.tsx (~200 lines)
- 3 unused validation.ts functions (~45 lines)
- Duplicate clipboard logic (~150 lines, now uses `useClipboard`)
- Duplicate draft logic (~100 lines, now uses `useDrafts`)
- Duplicate model selector UI (~50 lines, now uses `ModelSelect`)
- Debug console.log statements

### Technical Details

- `sessions.createMany(items, activeIndex)`: Atomic batch session creation
- Single Source of Truth enforcement via session helpers
- All storage operations now atomic (return complete updated state)

---

## [0.2.2-Alpha] - 2025-10-20

### Fixed

**Critical Journal Flow Issues**
- **Fixed "Save Turn 1" navigation stall**: Turns now save and automatically advance to the next turn without UI freezing
- **Corrected step order**: Journal now follows proper sequence → Epoch 1 → Analyst 1 (E1) → Analyst 2 (E1) → Epoch 2 → Analyst 1 (E2) → Analyst 2 (E2) → Report (was incorrectly routing to analysts after both epochs)
- **Fixed state updates**: Session updates now use partial state (`{ sessions }` only) to prevent UI routing clobber during turn saves
- **Fixed button labels**: Analyst sections now show correct next step ("Continue to Epoch 2" for Analyst 2 in Epoch 1, "Continue to Report" for Analyst 2 in Epoch 2)

**Timer & Duration Improvements**
- **Precise timing capture**: Timer now records duration with 2-decimal precision (e.g., 15.75 minutes) instead of rounding, critical for accurate Alignment Rate calculations
- **Reduced storage spam**: Timer only persists when minute value changes (not every second)
- **Auto-stop on completion**: Timer automatically stops and captures duration when 6th turn is saved
- **Human-readable format**: Duration displayed and editable in `mm:ss` format (e.g., "15:45") with automatic conversion to decimal minutes for calculations
- **User control restored**: Duration field is now editable with format validation, allowing manual corrections

**UX Polish**
- **Setup screen in Journal**: Fixed rendering to show SetupSection when `currentSection === 'setup'` inside Journal tabs
- **Cleaner completion screen**: Removed redundant instructions after all 6 turns complete (instructions only show during turn collection)
- **Back button restored**: Users can navigate back at any stage to review pasted turns (removed blocking behavior)
- **Dark mode text**: Fixed duration display to properly switch colors between light/dark modes

**Data Integrity**
- **Safe schema migration**: Version mismatches now only clear `notebook_state`, preserving `insights_library` and other stored data
- **Fixed Export mapping**: GyroDiagnostics JSON export now uses correct field paths (`process.durations`, `quality.pathologies.detected`, `insights.combined_markdown`)
- **Clipboard monitoring default**: Aligned default value to `true` across all components (matches UI copy "Enabled by Default")

**Code Quality**
- **Removed unused imports**: Cleaned up Notebook.tsx (removed SetupSection, SynthesisSection, AnalystSection, ReportSection, ProgressDashboard)
- **Canonical navigation**: Journal now uses `getNextSection()` helper for consistent routing logic

**Button & UI Improvements**
- **Simplified navigation buttons**: All "Continue to..." buttons now simply say "Continue →" for cleaner UI
- **Fixed button positioning**: Copy/paste buttons moved to bottom of textareas with proper spacing (no text overlap)
- **Enhanced button visibility**: Added borders and shadows to copy/paste buttons to prevent blending with field backgrounds
- **Stable button behavior**: Fixed buttons moving when clicked by adding fixed width and preventing layout shifts
- **Removed duplicate status messages**: Eliminated redundant green modals, keeping only button text feedback

**Analyst Section Enhancements**
- **Automatic progression**: "Validate & Continue" button now automatically proceeds after successful validation (no double-clicking)
- **Model field reset**: Analyst 2 model field now starts empty, encouraging different model selection
- **Flexible copy options for Analyst 2**: Added three copy buttons (Transcript, Full Analyst Prompt, Short Analyst Prompt) for different workflow preferences
- **Hidden full prompt for Analyst 2**: Cleaner UI by hiding verbose prompt display, replaced with copy options
- **Better error messaging**: Clear helper text shows exactly what's missing when validation button is disabled

**Clipboard & Paste Improvements**
- **Removed clipboard monitoring**: Eliminated automatic clipboard detection and modal popups for cleaner manual workflow
- **Enhanced paste buttons**: Added paste functionality to all text input areas with consistent styling
- **Dark mode JSON example**: Fixed "Show Example JSON" box to properly display in dark mode
- **Improved button organization**: All copy/paste buttons positioned at bottom of fields with proper spacing

**State Management & Phantom Data Fixes**
- **Fixed phantom JSON data**: Resolved issue where Analyst 2 would show previous analyst's data due to React state reuse
- **Component remounting**: Added unique keys to AnalysisView components to force fresh state on navigation
- **Reset effect**: Added state clearing when switching between analyst steps to prevent data carryover
- **Draft loading safety**: Enhanced draft loading with better validation to prevent cross-contamination
- **Complete state isolation**: Each analyst step now maintains completely independent state

**Report Section Dark Mode & UI Enhancements**
- **Complete dark mode support**: Fixed all text color issues in ReportSection for proper dark theme display
- **Enhanced Quality Validation block**: Redesigned with color-coded gradient cards (blue, purple, emerald themes)
- **Improved visual hierarchy**: Larger text, better spacing, and professional gradient backgrounds
- **Responsive detailed scores**: Structure and Behavior score cards now stack on mobile, side-by-side on desktop
- **Better information design**: Added visual indicators, score badges, and improved technical details popup
- **Enhanced mobile experience**: Full responsive design with proper breakpoints and touch-friendly spacing

**Collapsible UI Improvements**
- **Consistent collapsible design**: Applied unified collapsible style across SynthesisSection and AnalystSection
- **Visual feedback**: Added copy success/error indicators (✅/❌) for all copy buttons
- **Better organization**: Arrow indicators on left, copy buttons on right for intuitive interaction
- **Explanatory text**: Added helpful descriptions for Analyst 2 copy options (Transcript, Full Prompt, Short Prompt)
- **Dark mode compatibility**: All collapsible content properly styled for both light and dark themes

### Changed
- **Version updated**: Manifest and About screen now show v0.2.1 (was incorrectly v0.1.0/v0.1.1)
- **Button text simplified**: All navigation buttons now use consistent "Continue →" format
- **Analyst 2 workflow**: Streamlined with copy options instead of full prompt display
- **Report section design**: Upgraded from basic cards to professional gradient-based design with better visual hierarchy

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
- Improved clipboard button sizing and states
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
- ✅ Four analyst evaluations (Lllama 3.1 405B, Gemini 1.5 Pro)
- ✅ Spec-compliant calculations (QI: 81.9%, AR: 0.0683/min, SI: N/A handled correctly)
- ✅ Multi-session management, keyboard shortcuts, cross-tab sync

---

## [0.1.0-Prototype] - 2025-10-16

### Added
- Chrome extension with Manifest V3 and side panel interface
- Three-step protocol: Participation → Preparation → Provision
- Challenge setup with type selection and UN SDGs domain integration
- AI synthesis with two-epoch process (6 turns each) and clipboard
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
