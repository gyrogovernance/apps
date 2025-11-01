// Reusable component for collapsible details with copy button
import React, { useState } from 'react';
import { useClipboard } from '../../hooks/useClipboard';

interface CopyableDetailsProps {
  title: string;
  content: string;
  onCopy?: () => void;
  rows?: number;
  className?: string;
  defaultOpen?: boolean;
}

export const CopyableDetails: React.FC<CopyableDetailsProps> = ({ 
  title, 
  content, 
  onCopy,
  rows = 8,
  className = '',
  defaultOpen = true
}) => {
  const { copy, status } = useClipboard();
  const [open, setOpen] = useState<boolean>(!!defaultOpen);

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
    <div className={`${className}`}>
      <details className="group" open={open} onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}>
        <summary className="relative cursor-pointer flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors list-none pr-12 [&::-webkit-details-marker]:hidden [&::marker]:hidden">
          <span className="text-gray-500 dark:text-gray-400 group-open:rotate-90 transition-transform">▶</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{title}</span>
          {/* Copy button positioned absolutely to appear in header but outside summary for accessibility */}
          <button
            onClick={handleCopy}
            className="absolute top-1/2 -translate-y-1/2 right-3 px-2 py-1 text-xs bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded transition-colors shrink-0 flex items-center justify-center"
            title="Copy to clipboard"
          >
            {status === 'success' ? '✓' : status === 'error' ? '✕' : <span className="text-gray-500 dark:text-gray-400 font-medium">COPY</span>}
          </button>
        </summary>
        <div className="mt-2">
          <textarea
            readOnly
            value={content}
            rows={rows}
            className="w-full p-2 font-mono text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </details>
    </div>
  );
};
