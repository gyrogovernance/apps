import { useEffect, useState } from 'react';
import { chromeAPI } from '../lib/chrome-mock';

export interface Settings {
  clipboardMonitoring: boolean;
  autoSaveDrafts: boolean;
  darkMode: 'auto' | 'light' | 'dark';
  defaultPlatform: string;
  showKeyboardShortcuts: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  clipboardMonitoring: false,
  autoSaveDrafts: true,
  darkMode: 'auto',
  defaultPlatform: 'custom',
  showKeyboardShortcuts: true
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await chromeAPI.storage.local.get('app_settings');
        setSettings(result.app_settings || DEFAULT_SETTINGS);
      } catch (error) {
        console.error('Failed to load settings:', error);
        setSettings(DEFAULT_SETTINGS);
      }
    };
    
    load();

    const onChange = (changes: any, area: string) => {
      if (area === 'local' && changes['app_settings']) {
        setSettings(changes['app_settings'].newValue || DEFAULT_SETTINGS);
      }
    };

    chromeAPI.storage.onChanged.addListener(onChange);
    return () => chromeAPI.storage.onChanged.removeListener(onChange);
  }, []);

  return settings;
}

