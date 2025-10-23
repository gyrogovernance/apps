// Mock Chrome Extension APIs for web development/preview
// This allows the app to run in a regular browser without the extension context

const IS_EXTENSION = typeof chrome !== 'undefined' && 
                     chrome.storage !== undefined && 
                     chrome.storage.local !== undefined &&
                     typeof chrome.storage.local.get === 'function';

// Mock chrome.storage.local using localStorage
const mockStorage = {
  async get(keys?: string | string[] | null): Promise<any> {
    if (!keys) {
      // Get all items
      const all: any = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          all[key] = value ? JSON.parse(value) : null;
        }
      }
      return all;
    }

    if (typeof keys === 'string') {
      const value = localStorage.getItem(keys);
      return { [keys]: value ? JSON.parse(value) : undefined };
    }

    if (Array.isArray(keys)) {
      const result: any = {};
      keys.forEach(key => {
        const value = localStorage.getItem(key);
        result[key] = value ? JSON.parse(value) : undefined;
      });
      return result;
    }

    return {};
  },

  async set(items: { [key: string]: any }): Promise<void> {
    Object.entries(items).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
    
    // Trigger change listeners
    const changes: any = {};
    Object.keys(items).forEach(key => {
      changes[key] = { newValue: items[key], oldValue: undefined };
    });
    mockChangeListeners.forEach(listener => {
      listener(changes, 'local');
    });
  },

  async remove(keys: string | string[]): Promise<void> {
    const keyArray = typeof keys === 'string' ? [keys] : keys;
    keyArray.forEach(key => localStorage.removeItem(key));
  },

  async clear(): Promise<void> {
    localStorage.clear();
  }
};

// Mock change listeners
const mockChangeListeners: Array<(changes: any, areaName: string) => void> = [];

const mockOnChanged = {
  addListener(callback: (changes: any, areaName: string) => void) {
    mockChangeListeners.push(callback);
  },
  removeListener(callback: (changes: any, areaName: string) => void) {
    const index = mockChangeListeners.indexOf(callback);
    if (index > -1) {
      mockChangeListeners.splice(index, 1);
    }
  }
};

// Export unified chrome API (real or mocked)
export const chromeAPI = IS_EXTENSION
  ? {
      storage: {
        local: {
          get: chrome.storage.local.get.bind(chrome.storage.local),
          set: chrome.storage.local.set.bind(chrome.storage.local),
          remove: chrome.storage.local.remove.bind(chrome.storage.local),
          clear: chrome.storage.local.clear.bind(chrome.storage.local)
        },
        onChanged: chrome.storage.onChanged
      },
      runtime: chrome.runtime,
      permissions: chrome.permissions,
      isExtension: true
    }
  : {
      storage: {
        local: mockStorage,
        onChanged: mockOnChanged
      },
      runtime: {
        lastError: undefined,
        onMessage: undefined as any // Not supported in web mode
      },
      permissions: {
        request: async () => true // Auto-grant in mock
      } as any,
      isExtension: false
    };

// Helper to check if we're in extension context
export const isExtensionContext = (): boolean => IS_EXTENSION;

// Log mode on startup (removed for production)

