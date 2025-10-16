import React, { useEffect, useState } from 'react';
import { 
  detectClipboardContent, 
  looksLikeAIResponse, 
  looksLikeAnalystJSON,
  extractJSONFromFence,
  countWords
} from '../../lib/clipboard-assistant';

interface ClipboardMonitorProps {
  enabled: boolean;
  currentContext: 'synthesis' | 'analyst' | 'none';
  onSuggestPaste: (content: string) => void;
}

export const ClipboardMonitor: React.FC<ClipboardMonitorProps> = ({ 
  enabled, 
  currentContext,
  onSuggestPaste 
}) => {
  const [suggestion, setSuggestion] = useState<{ content: string; type: 'turn' | 'analyst'; wordCount?: number } | null>(null);

  useEffect(() => {
    if (!enabled || currentContext === 'none') return;

    const interval = setInterval(async () => {
      const content = await detectClipboardContent();
      if (!content) return;

      // Don't suggest the same content twice
      if (suggestion && suggestion.content === content) return;

      // Check based on context
      if (currentContext === 'analyst' && looksLikeAnalystJSON(content)) {
        const extracted = extractJSONFromFence(content);
        setSuggestion({ content: extracted, type: 'analyst' });
      } else if (currentContext === 'synthesis' && looksLikeAIResponse(content)) {
        const wordCount = countWords(content);
        setSuggestion({ content, type: 'turn', wordCount });
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [enabled, currentContext, suggestion]);

  if (!suggestion) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-2xl max-w-sm animate-slide-in">
      <div className="flex items-start gap-3">
        <span className="text-2xl">📋</span>
        <div className="flex-1">
          <p className="font-semibold mb-1">
            {suggestion.type === 'turn' ? 'AI Response Detected' : 'Analyst JSON Detected'}
          </p>
          <p className="text-sm text-blue-100 mb-1">
            {suggestion.type === 'turn' 
              ? `${suggestion.wordCount} words (~${Math.round((suggestion.wordCount || 0) * 1.3)} tokens)`
              : 'Valid JSON structure found'}
          </p>
          <p className="text-sm text-blue-100 mb-3">
            Paste as {suggestion.type === 'turn' ? 'next turn' : 'analyst response'}?
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                onSuggestPaste(suggestion.content);
                setSuggestion(null);
              }}
              className="px-3 py-1.5 bg-white text-blue-600 rounded font-medium text-sm hover:bg-blue-50 transition-colors"
            >
              ✓ Yes, Paste
            </button>
            <button 
              onClick={() => setSuggestion(null)}
              className="px-3 py-1.5 bg-blue-700 text-white rounded font-medium text-sm hover:bg-blue-800 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

