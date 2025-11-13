import React, { useState, useEffect, useRef } from 'react';
import { Session } from '../../../types';
import { getSessionProgress } from '../../../lib/session-utils';
import { getStatusBadgeColor } from '../../../lib/ui-utils';

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  // Check scroll position to show/hide shadows
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    
    setShowLeftShadow(el.scrollLeft > 5);
    setShowRightShadow(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      // Check on resize too
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [sessions.length]);
  // Show tabs only for active/analyzing sessions (paused sessions go to home view)
  const tabSessions = sessions.filter(s =>
    s.status === 'active' || s.status === 'analyzing'
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


  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 relative">
      {/* Left scroll shadow */}
      {showLeftShadow && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 dark:from-gray-800/50 to-transparent pointer-events-none z-10" />
      )}
      
      {/* Right scroll shadow */}
      {showRightShadow && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 dark:from-gray-800/50 to-transparent pointer-events-none z-10" />
      )}
      
      <div ref={scrollRef} className="flex items-center gap-1 px-3 py-2 overflow-x-auto scrollbar-thin">
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
              <div className={`w-2 h-2 rounded-full ${getStatusBadgeColor(status)}`} />
              
              {/* Session title */}
              <span 
                className="max-w-[120px]" 
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
