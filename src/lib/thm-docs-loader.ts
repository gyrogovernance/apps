// Utility to load THM documentation files
// These files will be included as assets in the build

/**
 * Load THM Grammar documentation
 * Returns empty string if file not found (user will paste content later)
 */
export async function loadTHMGrammar(): Promise<string> {
  try {
    // Try to load from extension assets
    if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
      const url = chrome.runtime.getURL('lib/thm-docs/THM_Grammar.md');
      const response = await fetch(url);
      if (response.ok) {
        const text = await response.text();
        if (text.trim()) {
          return text;
        }
        console.warn('THM_Grammar.md loaded but is empty');
      } else {
        console.warn(`Failed to load THM_Grammar.md: ${response.status} ${response.statusText}`);
      }
    }
    
    // Fallback: try direct fetch (for dev server)
    try {
      const response = await fetch('/lib/thm-docs/THM_Grammar.md');
      if (response.ok) {
        const text = await response.text();
        if (text.trim()) {
          return text;
        }
      }
    } catch (e) {
      console.warn('Dev server fetch failed for THM_Grammar.md:', e);
    }
  } catch (error) {
    console.warn('Could not load THM_Grammar.md:', error);
  }
  
  return ''; // Return empty if not found
}

/**
 * Load THM documentation
 */
export async function loadTHM(): Promise<string> {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
      const url = chrome.runtime.getURL('lib/thm-docs/THM.md');
      const response = await fetch(url);
      if (response.ok) {
        const text = await response.text();
        if (text.trim()) {
          return text;
        }
        console.warn('THM.md loaded but is empty');
      } else {
        console.warn(`Failed to load THM.md: ${response.status} ${response.statusText}`);
      }
    }
    
    try {
      const response = await fetch('/lib/thm-docs/THM.md');
      if (response.ok) {
        const text = await response.text();
        if (text.trim()) {
          return text;
        }
      }
    } catch (e) {
      console.warn('Dev server fetch failed for THM.md:', e);
    }
  } catch (error) {
    console.warn('Could not load THM.md:', error);
  }
  
  return '';
}

/**
 * Load THM Terms documentation
 */
export async function loadTHMTerms(): Promise<string> {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
      const url = chrome.runtime.getURL('lib/thm-docs/THM_Terms.md');
      const response = await fetch(url);
      if (response.ok) {
        const text = await response.text();
        if (text.trim()) {
          return text;
        }
        console.warn('THM_Terms.md loaded but is empty');
      } else {
        console.warn(`Failed to load THM_Terms.md: ${response.status} ${response.statusText}`);
      }
    }
    
    try {
      const response = await fetch('/lib/thm-docs/THM_Terms.md');
      if (response.ok) {
        const text = await response.text();
        if (text.trim()) {
          return text;
        }
      }
    } catch (e) {
      console.warn('Dev server fetch failed for THM_Terms.md:', e);
    }
  } catch (error) {
    console.warn('Could not load THM_Terms.md:', error);
  }
  
  return '';
}

/**
 * Load all THM docs at once
 */
export async function loadAllTHMDocs(): Promise<{
  grammar: string;
  thm: string;
  terms: string;
}> {
  const [grammar, thm, terms] = await Promise.all([
    loadTHMGrammar(),
    loadTHM(),
    loadTHMTerms()
  ]);
  
  return { grammar, thm, terms };
}

