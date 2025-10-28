import React from 'react';
import { Session } from '../../../types';
import { sessions as sessionsStorage } from '../../../lib/storage';
import { getSessionProgress, formatSessionDuration } from '../../../lib/session-utils';
import { isSessionEmpty } from '../../../lib/validation';
import { useToast } from '../../shared/Toast';
import { useConfirm } from '../../shared/Modal';
import GlassCard from '../../shared/GlassCard';

interface JournalHomeProps {
  sessions: Session[];
  activeSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onUpdate: (updates: Partial<import('../../../types').NotebookState>) => void;
}

const JournalHome: React.FC<JournalHomeProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onUpdate
}) => {
  const [operationLoading, setOperationLoading] = React.useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
  const toast = useToast();
  const { confirm, ConfirmModal } = useConfirm();

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdown]);

  const handlePauseSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOperationLoading(sessionId);
    try {
      const newState = await sessionsStorage.update(sessionId, { status: 'paused' });
      onUpdate({ sessions: newState.sessions });
      toast.show('Session paused', 'success');
    } catch (error) {
      console.error('Error pausing session:', error);
      toast.show('Failed to pause session', 'error');
    } finally {
      setOperationLoading(null);
    }
  };

  const handleResumeSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOperationLoading(sessionId);
    try {
      const newState = await sessionsStorage.update(sessionId, { status: 'active' });
      onUpdate({ sessions: newState.sessions });
      toast.show('Session resumed', 'success');
    } catch (error) {
      console.error('Error resuming session:', error);
      toast.show('Failed to resume session', 'error');
    } finally {
      setOperationLoading(null);
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const confirmed = await confirm(
      'Delete Session?',
      'This will permanently delete this session and all its data. This action cannot be undone.',
      { destructive: true, confirmText: 'Delete' }
    );
    
    if (!confirmed) return;
    
    setOperationLoading(sessionId);
    try {
      const newState = await sessionsStorage.delete(sessionId);
      // Delete returns complete state with activeSessionId cleared if needed
      onUpdate(newState);
      toast.show('Session deleted', 'success');
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.show('Failed to delete session', 'error');
    } finally {
      setOperationLoading(null);
    }
  };

  const handleCloneSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOperationLoading(sessionId);
    try {
      const clonedSession = await sessionsStorage.clone(sessionId);
      // Reload sessions from storage
      const freshState = await sessionsStorage.getAll();
      onUpdate({ sessions: freshState });
      toast.show('Session cloned - ready to start', 'success');
    } catch (error) {
      console.error('Error cloning session:', error);
      toast.show('Failed to clone session', 'error');
    } finally {
      setOperationLoading(null);
    }
  };
  // Filter out empty sessions from display
  // Show ALL sessions (including empty ones) for proper visibility
  const activeSessions = sessions.filter(s => s.status === 'active' || s.status === 'paused');
  const recentSessions = sessions
    .filter(s => s.status !== 'active' && s.status !== 'paused')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);


  return (
    <div className="max-w-5xl mx-auto p-3 mt-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
          <span>📓</span>
          <span>Journal</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Manage your active synthesis sessions and review recent work
        </p>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🔄 Active Sessions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeSessions.map(session => {
              const progress = getSessionProgress(session);
              const progressPercent = (progress.current / progress.total) * 100;
              const isActive = session.id === activeSessionId;

              return (
                <GlassCard
                  key={session.id}
                  className={isActive ? 'border-blue-500' : ''}
                  borderGradient={isActive ? 'blue' : undefined}
                >
                  <button
                    onClick={() => onSelectSession(session.id)}
                    className="w-full p-3 text-left"
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-2">
                      <h3 
                        className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex-1 mr-2"
                        title={session.challenge.title}
                      >
                        {session.challenge.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatSessionDuration(session)}
                        </span>
                        {/* 3-dot menu button */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdown(openDropdown === session.id ? null : session.id);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Session options"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          
                          {/* Dropdown Menu */}
                          {openDropdown === session.id && (
                            <div className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                              <div className="py-1">
                                {session.status === 'active' ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePauseSession(session.id, e);
                                      setOpenDropdown(null);
                                    }}
                                    disabled={operationLoading === session.id}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                  >
                                    <span>⏸️</span>
                                    <span>Pause Session</span>
                                  </button>
                                ) : session.status === 'paused' ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleResumeSession(session.id, e);
                                      setOpenDropdown(null);
                                    }}
                                    disabled={operationLoading === session.id}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                  >
                                    <span>▶️</span>
                                    <span>Resume Session</span>
                                  </button>
                                ) : null}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCloneSession(session.id, e);
                                    setOpenDropdown(null);
                                  }}
                                  disabled={operationLoading === session.id}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                  <span>📋</span>
                                  <span>Clone Session</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSession(session.id, e);
                                    setOpenDropdown(null);
                                  }}
                                  disabled={operationLoading === session.id}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                  <span>🗑️</span>
                                  <span>Delete Session</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Pills */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                        {session.challenge.type}
                      </span>
                      {isSessionEmpty(session) && (
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                          Not started
                        </span>
                      )}
                      {session.status === 'paused' && (
                        <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                          ⏸️ Paused
                        </span>
                      )}
                      {isActive && (
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 text-xs rounded-full">
                          ▶️ Current
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 min-w-0">
                        {progress.current}/{progress.total}
                      </span>
                    </div>
                  </button>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            📜 Recent Sessions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentSessions.map(session => (
              <GlassCard
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                hover
                className="text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 
                    className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-1 mr-2"
                    title={session.challenge.title}
                  >
                    {session.challenge.title}
                  </h4>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(session.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                    {session.challenge.type}
                  </span>
                  {session.status === 'complete' && (
                    <span className="text-xs text-green-600 dark:text-green-400">
                      ✓ Complete
                    </span>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* No Sessions State */}
      {activeSessions.length === 0 && recentSessions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📓</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No sessions yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create a challenge to start evaluating your AI model
          </p>
          <button
            onClick={onNewSession}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <span>🎯</span>
            <span>Go to Challenges</span>
          </button>
        </div>
      )}

      {/* New Session Button */}
      {(activeSessions.length > 0 || recentSessions.length > 0) && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <button
            onClick={onNewSession}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>➕</span>
            <span>New Session</span>
          </button>
        </div>
      )}

      {ConfirmModal}
    </div>
  );
};

export default JournalHome;

