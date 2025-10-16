import React from 'react';
import { Session } from '../../../types';
import { sessions as sessionsStorage } from '../../../lib/storage';
import { getSessionProgress, formatSessionDuration } from '../../../lib/session-utils';
import { useToast } from '../../shared/Toast';
import { useConfirm } from '../../shared/Modal';

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
  const toast = useToast();
  const { confirm, ConfirmModal } = useConfirm();

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
  const activeSessions = sessions.filter(s => s.status === 'active' || s.status === 'paused');
  const recentSessions = sessions
    .filter(s => s.status !== 'active' && s.status !== 'paused')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);


  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
          <span>📓</span>
          <span>Journal</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your active synthesis sessions and review recent work
        </p>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🔄 Active Sessions
          </h2>
          <div className="space-y-4">
            {activeSessions.map(session => {
              const progress = getSessionProgress(session);
              const progressPercent = (progress.current / progress.total) * 100;
              const isActive = session.id === activeSessionId;

              return (
                <div
                  key={session.id}
                  className={`relative rounded-lg border-2 transition-all ${
                    isActive
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  <button
                    onClick={() => onSelectSession(session.id)}
                    className="w-full p-5 text-left"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 pr-20">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          {session.challenge.title}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                            {session.challenge.type}
                          </span>
                          {session.status === 'paused' && (
                            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                              ⏸️ Paused
                            </span>
                          )}
                          {isActive && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 text-xs rounded-full">
                              ▶️ Current
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatSessionDuration(session)}
                      </div>
                    </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Progress: {progress.label}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {progress.current}/{progress.total} stages
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                    {/* Models Used */}
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {session.process.model_epoch1 && (
                        <span>Epoch 1: {session.process.model_epoch1}</span>
                      )}
                      {session.process.model_epoch2 && (
                        <span className="ml-3">Epoch 2: {session.process.model_epoch2}</span>
                      )}
                    </div>
                  </button>

                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex gap-1">
                    {session.status === 'active' ? (
                      <button
                        onClick={(e) => handlePauseSession(session.id, e)}
                        disabled={operationLoading === session.id}
                        className="p-1.5 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Pause session"
                      >
                        {operationLoading === session.id ? '⏳' : '⏸️'}
                      </button>
                    ) : session.status === 'paused' ? (
                      <button
                        onClick={(e) => handleResumeSession(session.id, e)}
                        disabled={operationLoading === session.id}
                        className="p-1.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Resume session"
                      >
                        {operationLoading === session.id ? '⏳' : '▶️'}
                      </button>
                    ) : null}
                    <button
                      onClick={(e) => handleCloneSession(session.id, e)}
                      disabled={operationLoading === session.id}
                      className="p-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Clone session (reuse challenge)"
                    >
                      {operationLoading === session.id ? '⏳' : '📋'}
                    </button>
                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      disabled={operationLoading === session.id}
                      className="p-1.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete session"
                    >
                      {operationLoading === session.id ? '⏳' : '🗑️'}
                    </button>
                  </div>
                </div>
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
          <div className="space-y-2">
            {recentSessions.map(session => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {session.challenge.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                        {session.challenge.type}
                      </span>
                      {session.status === 'complete' && (
                        <span className="text-xs text-green-600 dark:text-green-400">
                          ✓ Complete
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(session.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeSessions.length === 0 && recentSessions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📓</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No sessions yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start a new evaluation from the Challenges app
          </p>
          <button
            onClick={onNewSession}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Go to Challenges
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

