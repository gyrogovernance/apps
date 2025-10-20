// Keyboard shortcuts hook for accessibility and power users

import { useEffect } from 'react';

interface Shortcuts {
  [key: string]: () => void;
}

/**
 * Register keyboard shortcuts
 * @param shortcuts Map of key combinations to handlers (e.g., 'mod+n': () => {...})
 * @param enabled Whether shortcuts are active (default true)
 * 
 * Supported modifiers:
 * - 'mod' = Cmd on Mac, Ctrl on Windows/Linux
 * - 'shift' = Shift key
 * - 'alt' = Alt/Option key
 * 
 * Examples:
 * - 'mod+n': Cmd/Ctrl + N
 * - 'mod+shift+k': Cmd/Ctrl + Shift + K
 * - 'escape': Escape key
 */
export function useKeyboardShortcuts(shortcuts: Shortcuts, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect platform for correct modifier key
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;
      
      // Build shortcut key string
      const parts: string[] = [];
      if (modKey) parts.push('mod');
      if (e.shiftKey) parts.push('shift');
      if (e.altKey) parts.push('alt');
      
      // Guard against undefined key
      if (!e.key) return;
      const key = e.key.toLowerCase();
      parts.push(key);
      
      const shortcutKey = parts.join('+');
      
      // Execute handler if found
      const handler = shortcuts[shortcutKey];
      if (handler) {
        e.preventDefault();
        handler();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

