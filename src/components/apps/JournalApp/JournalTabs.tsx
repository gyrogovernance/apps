import React from 'react';
import { Session } from '../../../types';
import { isSessionEmpty } from '../../../lib/validation';
import { getSessionProgress } from '../../../lib/session-utils';

interface JournalTabsProps {
  sessions: Session[];
  activeSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onCloseSession: (sessionId: string) => void;
  onNewSession: () => void;
}

const JournalTabs: React.FC<JournalTabsProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onCloseSession,
  onNewSession
}) => {
  // Show tabs for active/paused/analyzing sessions (even if empty)
  const tabSessions = sessions.filter(s =>
    s.status === 'active' || s.status === 'paused' || s.status === 'analyzing'
  );
  
  // Sort by last updated (most recent first) without mutating
  const sortedSessions = [...tabSessions].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const getSessionTitle = (session: Session) => {
    // Truncate long titles
    const title = session.challenge.title;
    return title.length > 20 ? title.substring(0, 20) + '...' : title;
  };

  const getSessionStatus = (session: Session) => {
    if (session.status === 'analyzing') return 'analyzing';
    if (session.epochs.epoch1.turns.length === 0 && session.epochs.epoch2.turns.length === 0) return 'empty';
    const progress = getSessionProgress(session);
    if (progress.current === progress.total) return 'complete';
    return 'in-progress';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analyzing': return 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300';
      case 'empty': return 'bg-gray-100 dark:bg-gray-700 text-gray-500';
      case 'in-progress': return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300';
      case 'complete': return 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-500';
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto scrollbar-thin">
        {/* New Session Tab */}
        <button
          onClick={onNewSession}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
          title="Start New Session"
        >
          <span>+</span>
          <span>New</span>
        </button>

        {/* Session Tabs */}
        {sortedSessions.map((session) => {
          const isActive = session.id === activeSessionId;
          const status = getSessionStatus(session);
          const isEmpty = status === 'empty';
          
          return (
            <div
              key={session.id}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors flex-shrink-0 cursor-pointer group ${
                isActive
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              onClick={() => onSelectSession(session.id)}
            >
              {/* Status indicator */}
              <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
              
              {/* Session title */}
              <span 
                className="truncate max-w-[120px]" 
                title={session.challenge.title}
              >
                {getSessionTitle(session)}
              </span>
              
              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseSession(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:bg-gray-300 dark:hover:bg-gray-600 rounded p-0.5 transition-all"
                title={isEmpty ? "Delete empty session" : "Close session"}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JournalTabs;
