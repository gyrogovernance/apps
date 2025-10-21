// Reusable component for collapsible details with copy button
import React from 'react';
import { useClipboard } from '../../hooks/useClipboard';

interface CopyableDetailsProps {
  title: string;
  content: string;
  onCopy?: () => void;
  rows?: number;
  className?: string;
}

export const CopyableDetails: React.FC<CopyableDetailsProps> = ({ 
  title, 
  content, 
  onCopy,
  rows = 8,
  className = ''
}) => {
  const { copy, status } = useClipboard();

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onCopy) {
      onCopy();
    } else {
      copy(content);
    }
  };

  return (
    <details className={`group ${className}`}>
      <summary className="cursor-pointer flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 dark:text-gray-400 group-open:rotate-90 transition-transform">▶</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{title}</span>
        </div>
        <button
          onClick={handleCopy}
          className="px-3 py-1 text-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded transition-colors"
          title="Copy to clipboard"
        >
          {status === 'success' ? '✅ Copied' : status === 'error' ? '❌ Failed' : '📋 Copy'}
        </button>
      </summary>
      <div className="mt-2 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded">
        <textarea
          readOnly
          value={content}
          rows={rows}
          className="w-full p-2 font-mono text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </details>
  );
};

