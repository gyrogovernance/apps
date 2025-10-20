// Manual timer utilities for epoch timing

export interface TimerState {
  isRunning: boolean;
  elapsedSeconds: number;
  startTime: number | null;
}

export const INITIAL_TIMER_STATE: TimerState = {
  isRunning: false,
  elapsedSeconds: 0,
  startTime: null
};

/**
 * Format seconds into MM:SS or HH:MM:SS
 */
export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Convert seconds to minutes (rounded to nearest integer)
 */
export function secondsToMinutes(seconds: number): number {
  return Math.round(seconds / 60);
}

/**
 * Convert seconds to precise decimal minutes (for calculations)
 */
export function secondsToMinutesPrecise(seconds: number): number {
  return Number((seconds / 60).toFixed(2));
}

/**
 * Convert minutes to seconds
 */
export function minutesToSeconds(minutes: number): number {
  return minutes * 60;
}

/**
 * Storage key for timer persistence
 */
export function getTimerStorageKey(sessionId: string, epochKey: string): string {
  return `timer_${sessionId}_${epochKey}`;
}

/**
 * Save timer state to localStorage
 */
export function saveTimerState(sessionId: string, epochKey: string, state: TimerState): void {
  try {
    const key = getTimerStorageKey(sessionId, epochKey);
    localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save timer state:', error);
  }
}

/**
 * Load timer state from localStorage
 */
export function loadTimerState(sessionId: string, epochKey: string): TimerState | null {
  try {
    const key = getTimerStorageKey(sessionId, epochKey);
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    
    const state = JSON.parse(stored) as TimerState;
    
    // If timer was running when page closed, stop it but keep elapsed time
    if (state.isRunning) {
      return {
        ...state,
        isRunning: false,
        startTime: null
      };
    }
    
    return state;
  } catch (error) {
    console.warn('Failed to load timer state:', error);
    return null;
  }
}

/**
 * Clear timer state from localStorage
 */
export function clearTimerState(sessionId: string, epochKey: string): void {
  try {
    const key = getTimerStorageKey(sessionId, epochKey);
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to clear timer state:', error);
  }
}

