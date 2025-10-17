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

  // Determine if we should show back button (always show except when on welcome/home)
  const showBackButton = state.ui.currentApp !== 'welcome';
  
  // Get current page title - just the app name
  const getPageTitle = () => {
    switch (state.ui.currentApp) {
      case 'challenges': return 'Challenges';
      case 'journal': return 'Journal';
      case 'insights': return 'Insights';
      case 'settings': return 'Settings';
      default: return 'GyroGovernance';
    }
  };

  return (
    <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between px-3 py-2">
        {/* Left: Back button + Page title */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {showBackButton && (
            <button 
              onClick={onNavigateHome}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex-shrink-0 p-1 -ml-1"
              title="Back to Home"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right: Quick navigation - compact */}
        <div className="flex items-center gap-0.5">
          <button 
            onClick={() => onNavigateToApp('challenges')}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-lg"
            title="Challenges"
          >
            📋
          </button>
          <button 
            onClick={() => onNavigateToApp('journal')}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-lg"
            title="Journal"
          >
            📓
          </button>
          <button 
            onClick={() => onNavigateToApp('insights')}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-lg"
            title="Insights"
          >
            💡
          </button>
        </div>
      </div>
    </div>
  );
};

