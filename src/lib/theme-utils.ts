/**
 * Theme utilities for managing dark/light mode
 */

export type ThemeMode = 'auto' | 'light' | 'dark';

/**
 * Apply theme to the document based on the selected mode
 */
export function applyTheme(mode: ThemeMode): void {
  const html = document.documentElement;
  
  // Remove existing theme classes
  html.classList.remove('dark', 'light');
  
  if (mode === 'dark') {
    html.classList.add('dark');
  } else if (mode === 'light') {
    html.classList.add('light');
  } else {
    // Auto mode - follow system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      html.classList.add('dark');
    } else {
      html.classList.add('light');
    }
  }
}

/**
 * Get the effective theme (resolved from auto mode)
 */
export function getEffectiveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'dark') return 'dark';
  if (mode === 'light') return 'light';
  
  // Auto mode - check system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Initialize theme on app load
 */
export function initializeTheme(): void {
  // Import chromeAPI dynamically to avoid circular dependencies
  import('./chrome-mock').then(({ chromeAPI }) => {
    // Load saved theme setting
    chromeAPI.storage.local.get('app_settings').then((result: any) => {
      const settings = result.app_settings;
      const themeMode = settings?.darkMode || 'auto';
      applyTheme(themeMode);
    });
    
    // Listen for system theme changes when in auto mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      chromeAPI.storage.local.get('app_settings').then((result: any) => {
        const settings = result.app_settings;
        const themeMode = settings?.darkMode || 'auto';
        if (themeMode === 'auto') {
          applyTheme('auto');
        }
      });
    });
  });
}
