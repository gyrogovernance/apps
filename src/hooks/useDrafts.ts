// Hook for auto-saving and loading drafts
import { useState, useEffect } from 'react';
import { drafts } from '../lib/storage';

interface UseDraftsOptions {
  sessionId: string;
  key: string;
  enabled: boolean;
  debounceMs?: number;
}

export function useDrafts({ sessionId, key, enabled, debounceMs = 1000 }: UseDraftsOptions) {
  const [value, setValue] = useState('');

  // Load draft on mount
  useEffect(() => {
    if (!enabled || !sessionId) return;

    drafts.load(sessionId, key)
      .then(draft => {
        if (draft) setValue(draft);
      })
      .catch(() => {
        // Silently ignore errors
      });
  }, [sessionId, key, enabled]);

  // Auto-save draft when value changes
  useEffect(() => {
    if (!enabled || !sessionId || !value) return;

    const timeout = setTimeout(() => {
      drafts.save(sessionId, key, value).catch(() => {
        // Silently ignore errors
      });
    }, debounceMs);

    return () => clearTimeout(timeout);
  }, [sessionId, key, value, enabled, debounceMs]);

  // Clear draft
  const clear = async () => {
    if (!sessionId) return;
    await drafts.clear(sessionId, key);
  };

  return { value, setValue, clear };
}

