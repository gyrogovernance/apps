# Manual Timer Feature

## Overview

Added a manual timer feature to help users track epoch duration during synthesis sessions. This aligns with the clipboard-based, platform-agnostic philosophy of the extension.

## Implementation

### 1. Timer Utility (`src/lib/timer.ts`)

Core timer utilities providing:
- **Time formatting**: Converts seconds to `MM:SS` or `HH:MM:SS` format
- **Conversion helpers**: Between seconds and minutes
- **Persistence**: Saves/loads timer state to localStorage per session+epoch
- **State management**: Tracks running state, elapsed time, and start time

### 2. Timer Component (`src/components/shared/Timer.tsx`)

Reusable React component with:
- **Start/Pause button**: Toggle timer running state
- **Reset button**: Clear timer back to 00:00
- **Real-time display**: Shows elapsed time in large, readable format
- **Duration sync**: Automatically updates parent component's duration field
- **Persistence**: Timer state survives page refreshes
- **Smart recovery**: If timer was running when page closed, it stops but preserves elapsed time

### 3. Integration (`src/components/apps/JournalApp/JournalApp.tsx`)

Integrated at the JournalApp level for persistence:
- Positioned **below the tabs, above the content** (persistent across all turns)
- Only shows when user is in epoch1 or epoch2 sections
- Automatically syncs to the session's `duration_minutes` field in storage
- Persists per session and epoch (independent timers for Epoch 1 and Epoch 2)
- Doesn't remount when user moves through turns in SynthesisSection

### 4. SynthesisSection Integration

The duration field in SynthesisSection:
- Auto-syncs with timer updates via `useEffect`
- Allows manual override if user wants to adjust
- Shows helpful hint: "Auto-filled from timer above, but you can manually adjust if needed"

## User Flow

1. User navigates to an epoch (e.g., Epoch 1)
2. Timer appears below the session tabs, above the content
3. User clicks **▶ Start** to begin timing
4. User works through all 6 turns (timer persists across turns!)
5. User clicks **⏸ Pause** when done
6. Timer automatically fills the duration field in the metadata form (in minutes, rounded)
7. User can **↺ Reset** if they want to restart timing
8. User can manually adjust the duration field if needed before completing the epoch

## Technical Details

- **State persistence**: Uses localStorage with keys like `timer_{sessionId}_{epochKey}`
- **Auto-sync**: `onDurationChange` callback keeps parent component in sync
- **Format**: Displays as MM:SS for < 1 hour, HH:MM:SS for >= 1 hour
- **Rounding**: Converts seconds to minutes using `Math.round()`

## Design Rationale

- **Manual control**: Aligns with clipboard-based workflow where user controls the process
- **Non-intrusive**: Timer doesn't auto-start; user decides when to begin timing
- **Forgiving**: Persists state across refreshes, handles page closures gracefully
- **Visual clarity**: Large display with clear controls matches the extension's UI style
- **Persistent positioning**: Placed at JournalApp level (not SynthesisSection) so it doesn't remount when user moves through turns - critical for accurate timing!
- **Flexible**: Auto-fills the duration but allows manual override for edge cases

## Future Enhancements (Optional)

- Add lap/split times to track individual turn durations
- Add sound/notification when timer reaches certain milestones
- Export timer logs for analysis
- Add "Timer History" view to see past timing patterns

