// Hook for auto-saving and loading drafts
import { useState, useEffect } from 'react';
import { useToast } from '../components/shared/Toast';
import { formatErrorForUser } from '../lib/error-utils';
import { drafts } from '../lib/storage';

// Global map to track last success toast timestamp per draft key
const lastSuccessToast = new Map<string, number>();
const SUCCESS_TOAST_THROTTLE_MS = 12000; // 12 seconds

interface UseDraftsOptions {
  sessionId: string;
  key: string;
  enabled: boolean;
  debounceMs?: number;
}

export function useDrafts({ sessionId, key, enabled, debounceMs = 1000 }: UseDraftsOptions) {
  const [value, setValue] = useState('');
  const toast = useToast();

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
      drafts.save(sessionId, key, value)
        .then(() => {
          // Throttle success toasts to avoid spam (show at most once every 12s per draft)
          const draftKey = `${sessionId}_${key}`;
          const now = Date.now();
          const lastToast = lastSuccessToast.get(draftKey) || 0;

          if (now - lastToast >= SUCCESS_TOAST_THROTTLE_MS) {
            toast.show('Draft saved', 'info');
            lastSuccessToast.set(draftKey, now);
          }
        })
        .catch((error) => {
          // Show user-friendly error immediately (always)
          toast.show(formatErrorForUser(error), 'error');
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

