// Session helper functions - Single Source of Truth pattern
// All components should use these instead of accessing state.challenge, state.epochs, etc. directly

import { NotebookState, Session } from '../types';

/**
 * Get the active session from state (Single Source of Truth)
 * Returns null if no active session
 */
export function getActiveSession(state: NotebookState): Session | null {
  if (!state.activeSessionId) return null;
  return state.sessions.find(s => s.id === state.activeSessionId) || null;
}

/**
 * Get active session or throw error (use when session MUST exist)
 */
export function requireActiveSession(state: NotebookState): Session {
  const session = getActiveSession(state);
  if (!session) {
    throw new Error('No active session - this component requires an active session');
  }
  return session;
}

/**
 * Update active session data (helper for building state updates)
 * Returns partial state object to merge
 */
export function updateActiveSession(
  state: NotebookState,
  updates: Partial<Session>
): Partial<NotebookState> {
  const session = requireActiveSession(state);
  
  const updatedSessions = state.sessions.map(s =>
    s.id === session.id 
      ? { ...s, ...updates, updatedAt: new Date().toISOString() } 
      : s
  );
  
  return { sessions: updatedSessions };
}

/**
 * Check if there's an active session
 */
export function hasActiveSession(state: NotebookState): boolean {
  return !!getActiveSession(state);
}

/**
 * Get session by ID or null
 */
export function getSessionById(state: NotebookState, sessionId: string): Session | null {
  return state.sessions.find(s => s.id === sessionId) || null;
}

