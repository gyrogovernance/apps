// Global constants for the application
// Centralizes magic numbers and repeated values

/**
 * Z-index layering system
 * Ensures predictable element stacking order
 */
export const Z_INDEX = {
  BASE: 1,
  DROPDOWN: 40,
  MODAL_BACKDROP: 50,
  MODAL_CONTENT: 60,
  TOAST: 100
} as const;

/**
 * UI Constants
 */
export const UI_CONSTANTS = {
  MAX_VISIBLE_TABS: 8,
  TOAST_DURATION_MS: 2000,
  AUTO_SAVE_DEBOUNCE_MS: 1000,
  SCROLL_CHECK_THRESHOLD_PX: 5
} as const;

/**
 * Session Constants
 */
export const SESSION_CONSTANTS = {
  TURNS_PER_EPOCH: 6,
  TOTAL_EPOCHS: 2,
  ANALYSTS_PER_EPOCH: 2
} as const;

