// Centralized error handling utilities
// Provides consistent error logging and recovery patterns

/**
 * Handle storage-related errors with context
 * @param error - The error that occurred
 * @param context - Where the error occurred (e.g., 'storage.get', 'sessions.create')
 */
export function handleStorageError(error: unknown, context: string): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[Storage Error - ${context}]:`, message);
  // Future: Could integrate with error tracking service (Sentry, etc.)
}

/**
 * Determine if an error is recoverable (allows graceful degradation)
 * @param error - The error to check
 * @returns true if the app can continue despite the error
 */
export function isRecoverableError(error: unknown): boolean {
  if (error instanceof Error) {
    // QuotaExceededError - storage full but app can still work in-memory
    if (error.name === 'QuotaExceededError') return true;
    
    // Network errors during export/import
    if (error.message.includes('fetch') || error.message.includes('network')) return true;
  }
  
  return false;
}

/**
 * Format error for user display
 * Converts technical errors into user-friendly messages
 */
export function formatErrorForUser(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === 'QuotaExceededError') {
      return 'Storage limit reached. Please export your data and clear old sessions.';
    }
    if (error.message.includes('JSON')) {
      return 'Invalid data format. Please check your input.';
    }
    return error.message;
  }
  return 'An unexpected error occurred';
}

