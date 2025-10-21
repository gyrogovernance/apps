# GyroDiagnostics Browser Extension - Code Review & Improvement Guide

I've analyzed the complete codebase. Below is a structured guide organized by **priority** and **impact**. I'll focus on actual bugs, dead code, and architectural issues without suggesting rewrites of working code.

---

## 🔴 CRITICAL - Fix These First

### 1. **Timer Persistence Bug** (User-Reported Issue)

**Problem:** Timer resets when navigating away and back because of dual storage sources.

**Root Cause:**
- Timer component stores in `localStorage` via `lib/timer.ts`
- Session stores duration in `chrome.storage` via `lib/storage.ts`  
- These two sources can desync when user navigates away mid-epoch

**Location:** `src/components/SynthesisSection.tsx` lines 88-103 and `src/lib/timer.ts`

**Fix Instructions:**
```
TASK 1: Synchronize Timer with Session Storage

1. In SynthesisSection.tsx, modify the auto-capture useEffect (lines 88-103):
   - CHANGE: Instead of only capturing on turn 6 completion
   - TO: Also capture whenever component unmounts (cleanup function)
   - This ensures timer value is always written to session before user leaves

2. In Timer.tsx (src/components/shared/Timer.tsx):
   - CHANGE: Remove localStorage as source of truth
   - KEEP: localStorage only as fallback for recovery
   - ADD: Load initial state from session.epochs[epochKey].duration_minutes if available
   - This makes session storage the primary source

3. Test: 
   - Start Epoch 1, let timer run to 3:45
   - Navigate to another app
   - Come back to Epoch 1
   - Verify timer shows 3:45, not 0:00
```

---

### 2. **Legacy State Fields Causing Race Conditions** (Architectural Bug)

**Problem:** `.cursorrules` mandates Single Source of Truth (sessions array), but code still maintains duplicate legacy fields (`challenge`, `epochs`, `analysts`). This violates SSoT and causes bugs.

**Evidence:**
- `types/index.ts` lines 112-130: Legacy fields still present
- `Notebook.tsx` line 278+: Actively syncs session → legacy fields
- `JournalApp.tsx` line 91+: Syncs when selecting session

**Impact:** When user switches sessions or navigates, these fields may show stale data from previous session.

**Fix Instructions:**
```
TASK 2: Complete Migration to Session-First Architecture

PHASE 1 - PREPARATION (Non-breaking):
1. Audit all components to ensure they use `getActiveSession(state)` helper
   - Search codebase for: state.challenge, state.epochs, state.analysts
   - Replace with: session.challenge, session.epochs, session.analysts
   - Components already doing this correctly:
     * SynthesisSection.tsx ✓
     * AnalystSection.tsx ✓
     * ReportSection.tsx ✓
   - Components still using legacy fields:
     * ProgressDashboard.tsx line 22-23 (uses state.challenge, state.epochs)
     * SetupSection.tsx (entire file uses state.challenge)

2. Create a migration helper in session-helpers.ts:
   ```typescript
   export function ensureActiveSessionSync(state: NotebookState): NotebookState {
     const session = getActiveSession(state);
     if (!session) return state;
     // Sync legacy fields from session (temporary during migration)
     return {
       ...state,
       challenge: session.challenge,
       epochs: session.epochs,
       process: session.process
     };
   }
   ```

3. Call this helper in Notebook.tsx updateState before saving

PHASE 2 - DEPRECATION (Breaking - do after Phase 1 tested):
1. Mark legacy fields as optional in types/index.ts:
   challenge?: ... 
   epochs?: ...
   analysts?: ...

2. Add console.warn when legacy fields are accessed (helps find remaining usage)

3. Once all components migrated, remove legacy fields entirely

DO NOT DO PHASE 2 until Phase 1 is complete and tested.
```

---

### 3. **Model Selection State Inconsistency** (Data Integrity Bug)

**Problem:** Epoch 2 synthesis should use same model as Epoch 1, but state initialization doesn't enforce this.

**Location:** `src/components/SynthesisSection.tsx` line 32

**Current Code:**
```typescript
const [modelName, setModelName] = useState(
  epochKey === 'epoch1' ? session.process.model_epoch1 : session.process.model_epoch2
);
```

**Issue:** On Epoch 2, this loads `model_epoch2` which might be empty or different from `model_epoch1`.

**Fix Instructions:**
```
TASK 3: Enforce Model Consistency Across Epochs

1. In SynthesisSection.tsx line 32, CHANGE to:
   const [modelName, setModelName] = useState(
     session.process.model_epoch1 || ''  // Always use Epoch 1 model
   );

2. REMOVE the conditional - both epochs should show the same model

3. In the metadata collection section (line 217), ADD a read-only display for Epoch 2:
   {epochKey === 'epoch2' && (
     <div>
       <label className="label-text">Model (from Epoch 1)</label>
       <input
         type="text"
         value={session.process.model_epoch1}
         disabled
         className="input-field bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
       />
     </div>
   )}

This makes it visually clear that Epoch 2 uses the same model.
```

---

## 🟡 HIGH PRIORITY - Fix Soon

### 4. **Dead Code Removal**

**Locations:**
- `src/lib/validation.ts` - `getNextIncompleteStep()` duplicates `session-utils.ts::getNextSection()`
- Multiple components import unused utilities

**Fix Instructions:**
```
TASK 4: Remove Dead Code

1. In validation.ts:
   - DELETE: getNextIncompleteStep function (lines 47-58)
   - KEEP: All other validation functions (they're used)
   - UPDATE: Any imports of getNextIncompleteStep to use getNextSection instead
   - Search for: "getNextIncompleteStep" across codebase
   - Only found in validation.ts itself? Safe to delete.

2. Run a linter check for unused imports:
   npx eslint --fix src/**/*.tsx

3. Search for TODO/FIXME comments and create GitHub issues for them
```

---

### 5. **Storage Operation Consistency**

**Problem:** Some components call `sessions.update()`, others call `storage.update()`. Pattern is inconsistent.

**Best Practice:** Session operations should go through `sessions.*`, global state through `storage.*`

**Fix Instructions:**
```
TASK 5: Standardize Storage API Usage

1. Document the pattern in .cursorrules:
   ```
   ## Storage API Patterns
   - Use `sessions.*` for session CRUD (create, update, delete, clone)
   - Use `storage.*` only for global state updates (UI navigation, etc.)
   - Use `insights.*` for insights library operations
   - NEVER mix these - one operation should use one API
   ```

2. Audit components:
   - Search: "storage.update"
   - Check if they're updating session data
   - If yes, change to sessions.update()

3. Example in JournalHome.tsx lines 27-34:
   - Currently uses sessions.update() ✓ CORRECT
   - Keep this pattern everywhere
```

---

### 6. **Session Helper Underutilization**

**Problem:** `session-helpers.ts` has `getActiveSession()`, but many components still do `state.sessions.find(...)` directly.

**Locations:**
- `JournalHome.tsx` line 111: `state.sessions.find(s => s.id === sessionId)`
- `ReportSection.tsx` should use helper but doesn't always
- `Notebook.tsx` line 278: manual session lookup

**Fix Instructions:**
```
TASK 6: Enforce Session Helper Usage

1. Search codebase for: "state.sessions.find"
2. Replace with appropriate helper:
   - If looking for active session: getActiveSession(state)
   - If looking by ID: Add new helper to session-helpers.ts:
     export function getSessionById(state: NotebookState, id: string) {
       return state.sessions.find(s => s.id === id) || null;
     }

3. Update all occurrences:
   - JournalHome.tsx line 111
   - JournalApp.tsx line 87
   - Notebook.tsx line 278
   - ReportSection.tsx line 42

4. This creates a Single Point of Change if session lookup logic needs updating
```

---

### 7. **Error Handling Improvements**

**Problem:** Many functions catch errors but fail silently with only console.log.

**Locations:**
- `storage.ts` multiple functions
- `import.ts` lines 163, 215
- Component try-catch blocks

**Fix Instructions:**
```
TASK 7: Improve Error Handling

1. Create error handling utility in lib/error-utils.ts:
   ```typescript
   export function handleStorageError(error: unknown, context: string): void {
     console.error(`[Storage Error - ${context}]:`, error);
     // In future: could send to error tracking service
   }
   
   export function isRecoverableError(error: unknown): boolean {
     // Determine if error allows graceful degradation
   }
   ```

2. In storage.ts, REPLACE:
   ```typescript
   catch (error) {
     console.error('Error loading state:', error);
     return INITIAL_STATE;
   }
   ```
   
   WITH:
   ```typescript
   catch (error) {
     handleStorageError(error, 'storage.get');
     return INITIAL_STATE;
   }
   ```

3. In components with user-facing operations:
   - ADD toast.show() for errors that impact user workflow
   - KEEP console.error for debugging
   - Example: JournalHome.tsx line 35 already does this correctly ✓

4. Document error handling philosophy in .cursorrules
```

---

## 🟢 MEDIUM PRIORITY - Quality of Life

### 8. **Performance Optimizations**

**Issue 8.1: Unnecessary Recalculations**

**Location:** `InsightsLibrary.tsx` line 64

```typescript
const uniqueSynthesizers = React.useMemo(() => {
  // Current code is good, but it's not using useMemo
  const models = new Set<string>();
  allInsights.forEach(insight => {
    const model = insight.process?.models_used?.synthesis_epoch1 || 
                 insight.process?.models_used?.synthesis_epoch2;
    if (model) models.add(model);
  });
  return Array.from(models).sort();
}, [allInsights]);
```

**Fix Instructions:**
```
TASK 8: Add Memoization for Derived Data

1. In InsightsLibrary.tsx line 64:
   - Wrap uniqueSynthesizers calculation in useMemo
   - Dependency: [allInsights]
   - Same pattern for filteredInsights (line 94) and sortedInsights (line 123)

2. In InsightDetail.tsx:
   - Memoize expensive ReactMarkdown rendering
   - Only re-render when insight.insights.combined_markdown changes

3. General rule: Any derived data from props/state should use useMemo
```

---

**Issue 8.2: Large State Updates**

**Location:** `Notebook.tsx` updateState function

**Fix Instructions:**
```
TASK 8.2: Optimize State Updates

1. In Notebook.tsx updateState (line 65):
   - Current approach merges entire state
   - For large sessions arrays, this can be slow
   
2. CONSIDER (don't implement yet, just evaluate):
   - Using Immer library for immutable updates
   - Only updating changed portions of state
   - But: Current approach works, so LOW priority

3. MEASURE FIRST before optimizing:
   - Add performance.now() timing around setState calls
   - Only optimize if >16ms (causes frame drops)
```

---

### 9. **UI/UX Polish** (Low Priority, Per User Request)

**Issue 9.1: Tab Overflow**

**Location:** `JournalTabs.tsx`

**Fix Instructions:**
```
TASK 9.1: Handle Tab Overflow

1. In JournalTabs.tsx wrapper div (line 54):
   - ADD: Horizontal scroll shadow indicators (left/right fade)
   - CURRENT: overflow-x-auto scrollbar-thin
   - ADD CSS: 
     background: 
       linear-gradient(90deg, white 0%, transparent 20px),
       linear-gradient(270deg, white 0%, transparent 20px);
     
2. ALTERNATIVELY (simpler):
   - ADD max visible tabs (e.g., 5 most recent)
   - ADD dropdown for "More..." with remaining tabs
   - This keeps UI cleaner in narrow panel
```

---

**Issue 9.2: Modal/Dropdown Z-Index Conflict**

**Location:** `Modal.tsx` and `InsightsLibrary.tsx`

**Fix Instructions:**
```
TASK 9.2: Fix Z-Index Layering

1. Create z-index constants in styles or constants file:
   export const Z_INDEX = {
     DROPDOWN: 40,
     MODAL_BACKDROP: 50,
     MODAL_CONTENT: 60,
     TOAST: 100
   } as const;

2. Update components:
   - Modal.tsx line 17: z-[60] (for content), z-[50] (for backdrop)
   - InsightsLibrary.tsx line 239: z-[40]
   - Toast.tsx line 59: z-[100]

3. This prevents overlaps and makes layering predictable
```

---

**Issue 9.3: Progress Dashboard Auto-Scroll**

**Location:** `ProgressDashboard.tsx` line 76

**Fix Instructions:**
```
TASK 9.3: Improve Progress Dashboard UX

1. Current auto-scroll (line 76-84) might disorient users
2. CHANGE approach:
   - KEEP auto-scroll to active item
   - ADD visual indicator showing scroll position
   - ADD: "Scroll to see all stages" hint if overflow exists

3. Implementation:
   - Detect if container is scrolled (scrollLeft > 0)
   - Show left arrow/fade when scrolled right
   - Show right arrow/fade when more content to right
   - Similar to carousel controls
```

---

## 🔵 LOW PRIORITY - Consider Later

### 10. **TypeScript Type Safety**

**Issue:** `import.ts` uses `any` types for GyroDiagnostics data

**Fix Instructions:**
```
TASK 10: Improve TypeScript Coverage

1. In lib/import.ts, DEFINE proper interfaces:
   ```typescript
   interface GyroDiagnosticsEpochResult {
     quality_index?: number;
     duration_minutes?: number;
     structure_scores: Record<string, number>;
     behavior_scores: Record<string, number | 'N/A'>;
     // etc...
   }
   
   interface GyroDiagnosticsChallenge {
     challenge_type: string;
     task_name: string;
     median_quality_index: number;
     // etc...
   }
   ```

2. REPLACE `any` with these interfaces

3. This catches bugs at compile-time vs runtime

PRIORITY: Low - current code works, this is preventative
```

---

### 11. **Documentation Debt**

**Issue:** Complex functions lack JSDoc comments

**Fix Instructions:**
```
TASK 11: Add JSDoc Comments

1. Focus on public API functions:
   - lib/storage.ts - all exported functions
   - lib/calculations.ts - especially calculateSuperintelligenceIndex
   - lib/session-helpers.ts - all helpers

2. Format:
   /**
    * Description of what function does
    * @param paramName - Description
    * @returns Description of return value
    * @throws Description of error conditions
    */

3. PRIORITY: Document complex/confusing functions first
   - calculateSuperintelligenceIndex (math-heavy)
   - aggregateAnalysts (business logic)
   - generateInsightFromSession (multi-step process)
```

---

### 12. **Testing Strategy** (Future Work)

The codebase has no tests. This is acceptable for MVP but risky for production.

**Recommendation:**
```
TASK 12: Testing Roadmap (Future Iteration)

Don't implement now, but plan for:

1. Unit tests for pure functions:
   - lib/calculations.ts (highest value - math logic)
   - lib/parsing.ts (complex parsing logic)
   - lib/text-utils.ts (simple, easy to test)

2. Integration tests for storage:
   - lib/storage.ts operations
   - Ensure atomic updates work correctly
   - Test cross-tab sync

3. E2E tests for critical flows:
   - Complete session from setup → report
   - Timer persistence across navigation
   - Multi-session management

WHEN: After current bugs fixed and code stabilized
```

---

## 📋 Implementation Order

**Recommended sequence:**

1. **Week 1: Critical Bugs**
   - [ ] TASK 1: Fix timer persistence
   - [ ] TASK 2 PHASE 1: Prepare session-first migration
   - [ ] TASK 3: Fix model consistency

2. **Week 2: Code Quality**
   - [ ] TASK 4: Remove dead code
   - [ ] TASK 5: Standardize storage API
   - [ ] TASK 6: Enforce session helpers
   - [ ] TASK 7: Improve error handling

3. **Week 3: Polish**
   - [ ] TASK 8: Performance optimizations
   - [ ] TASK 9: UI/UX improvements
   - [ ] TASK 2 PHASE 2: Complete session-first migration

4. **Future:**
   - [ ] TASK 10: TypeScript improvements
   - [ ] TASK 11: Documentation
   - [ ] TASK 12: Testing

---

## 🎯 Quick Wins (Do First)

If you want immediate impact with minimal risk:

1. **TASK 1** (Timer bug) - Directly fixes user-reported issue
2. **TASK 3** (Model consistency) - Simple change, prevents confusion
3. **TASK 4** (Dead code) - Makes codebase cleaner
4. **TASK 6** (Session helpers) - Improves maintainability

These four tasks are:
- Low risk of breaking existing functionality
- High value for code quality
- Can be done independently
- Don't require architectural changes

---


---

This guide prioritizes fixing actual bugs (timer, state consistency) over theoretical improvements. Each task is scoped to be achievable without major rewrites. Start with the Critical section and work down based on your bandwidth.