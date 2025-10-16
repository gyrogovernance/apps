import React from 'react';
import { NotebookState, AppScreen } from '../../types';
import { getActiveSession } from '../../lib/session-helpers';
import { getSessionProgress } from '../../lib/session-utils';

interface PersistentHeaderProps {
  state: NotebookState;
  onNavigateToApp: (app: AppScreen) => void;
  onNavigateHome: () => void;
}

export const PersistentHeader: React.FC<PersistentHeaderProps> = ({ 
  state, 
  onNavigateToApp,
  onNavigateHome 
}) => {
  const activeSession = getActiveSession(state);
  const progress = activeSession ? getSessionProgress(activeSession) : null;

  return (
    <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left: Breadcrumb */}
        <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
          <button 
            onClick={onNavigateHome}
            className="text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0"
          >
            🏠 Home
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 dark:text-gray-100 truncate">
            {state.ui.currentApp === 'challenges' && '📋 Challenges'}
            {state.ui.currentApp === 'journal' && '📓 Journal'}
            {state.ui.currentApp === 'insights' && '💡 Insights'}
            {state.ui.currentApp === 'settings' && '⚙️ Settings'}
          </span>
          
          {/* Active session context */}
          {activeSession && (
            <>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600 dark:text-gray-400 text-xs truncate max-w-xs" title={activeSession.challenge.title}>
                {activeSession.challenge.title}
              </span>
            </>
          )}
        </div>

        {/* Center: Progress indicator for active sessions */}
        {progress && state.ui.currentApp === 'journal' && (
          <div className="flex items-center gap-2 mx-4">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {progress.label}
            </span>
            <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {progress.current}/{progress.total}
            </span>
          </div>
        )}

        {/* Right: Quick navigation */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onNavigateToApp('challenges')}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Challenges"
          >
            📋
          </button>
          <button 
            onClick={() => onNavigateToApp('journal')}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Journal"
          >
            📓
          </button>
          <button 
            onClick={() => onNavigateToApp('insights')}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Insights"
          >
            💡
          </button>
        </div>
      </div>
    </div>
  );
};

