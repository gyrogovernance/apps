// Reusable component to display completed turns summary
import React from 'react';
import { Turn } from '../../types';
import { estimateTokens, formatTokenCount } from '../../lib/text-utils';

interface TurnsSummaryProps {
  turns: Turn[];
  className?: string;
}

export const TurnsSummary: React.FC<TurnsSummaryProps> = ({ turns, className = '' }) => {
  if (turns.length === 0) return null;

  return (
    <div className={`border-t border-gray-200 dark:border-gray-700 pt-4 ${className}`}>
      <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Completed Turns:</h3>
      <div className="space-y-2">
        {turns.map((turn) => {
          const estimatedTokens = estimateTokens(turn.word_count);
          return (
            <div key={turn.number} className="flex items-center gap-2 text-sm">
              <span className="success-badge">Turn {turn.number}</span>
              <span className="text-gray-600 dark:text-gray-400">
                {turn.word_count} words
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                ~{formatTokenCount(estimatedTokens)} tokens
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {new Date(turn.captured_at).toLocaleTimeString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

