// Hook for clipboard operations with status feedback
import { useState } from 'react';

type ClipboardStatus = 'idle' | 'success' | 'error';

export function useClipboard() {
  const [status, setStatus] = useState<ClipboardStatus>('idle');

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 1500);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 1500);
    }
  };

  const paste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setStatus('success');
      setTimeout(() => setStatus('idle'), 1500);
      return text;
    } catch (error) {
      console.error('Failed to read from clipboard:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 1500);
      return '';
    }
  };

  return { copy, paste, status };
}

