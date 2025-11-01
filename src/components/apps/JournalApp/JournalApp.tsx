import React, { useRef, useCallback, useEffect } from 'react';
import { useScrollToTop } from '../../../hooks/useScrollToTop';
import { NotebookState } from '../../../types';
import { sessions as sessionsStorage } from '../../../lib/storage';
import { getNextSection } from '../../../lib/session-utils';
import { getActiveSession, getSessionById } from '../../../lib/session-helpers';
import JournalHome from './JournalHome';
import JournalTabs from './JournalTabs';
import SessionView from './SessionView';
import AnalysisView from './AnalysisView';
import ReportSection from '../../ReportSection';
import { Timer } from '../../shared/Timer';
import ProgressDashboard from '../../ProgressDashboard';

interface JournalAppProps {
  state: NotebookState;
  onUpdate: (updates: Partial<NotebookState> | ((prev: NotebookState) => Partial<NotebookState>)) => void;
  onNavigateToChallenges: () => void;
  onNavigateToSection: (section: 'epoch1' | 'epoch2' | 'analyst1_epoch1' | 'analyst1_epoch2' | 'analyst2_epoch1' | 'analyst2_epoch2' | 'report') => void;
}

const JournalApp: React.FC<JournalAppProps> = ({ 
  state, 
  onUpdate,
  onNavigateToChallenges,
  onNavigateToSection
}) => {
  // Scroll to top whenever the current section or active session changes
  useScrollToTop([state.ui.currentSection, state.activeSessionId]);
  const handleCloseSession = async (sessionId: string) => {
    try {
      const session = getSessionById(state, sessionId);
      if (!session) return;

      const isClosingActiveSession = sessionId === state.activeSessionId;

      // If session is empty, delete it directly
      if (session.epochs.epoch1.turns.length === 0 && session.epochs.epoch2.turns.length === 0) {
        const newState = await sessionsStorage.delete(sessionId);
        
        // If we're closing the active session, navigate to home but keep tabs visible
        if (isClosingActiveSession) {
        onUpdate({
          ...newState,
          activeSessionId: undefined,
          ui: {
            ...state.ui,
            currentSection: 'epoch1',
            journalView: 'home'
          }
        });
        } else {
          onUpdate(newState);
        }
        return;
      }

      // For non-empty sessions, pause them instead of deleting
      const newState = await sessionsStorage.update(sessionId, { status: 'paused' });
      
      // If we're closing the active session, navigate to home
      if (isClosingActiveSession) {
        // Find another active/paused session to switch to, or go to home
        const otherActiveSession = state.sessions.find(s => 
          s.id !== sessionId && 
          (s.status === 'active' || s.status === 'paused' || s.status === 'analyzing')
        );

        onUpdate({
          sessions: newState.sessions,
          activeSessionId: otherActiveSession?.id,
          ui: {
            ...state.ui,
            currentSection: otherActiveSession ? state.ui.currentSection : 'epoch1',
            journalView: otherActiveSession ? 'session' : 'home'
          }
        });
      } else {
        onUpdate({ sessions: newState.sessions });
      }
    } catch (error) {
      console.error('Error closing session:', error);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    // Load the session and determine where to navigate
    const session = getSessionById(state, sessionId);
    if (!session) return;

    // Use canonical getNextSection to determine target
    const targetSection = getNextSection(session);

    // Update state with selected session and navigate to appropriate section
    onUpdate({
      activeSessionId: sessionId,
      ui: {
        ...state.ui,
        currentSection: targetSection
      }
    });
  };

  const handleNewSession = () => {
    onNavigateToChallenges();
  };

  const renderContent = () => {
    // NEW: Force Home when journalView says so (regardless of activeSessionId)
    if (state.ui.journalView === 'home') {
      return (
        <JournalHome
          sessions={state.sessions}
          activeSessionId={state.activeSessionId}
          onSelectSession={(sessionId) => {
            const session = getSessionById(state, sessionId);
            if (!session) return;
            const targetSection = getNextSection(session);
            onUpdate({
              activeSessionId: sessionId,
              ui: { 
                ...state.ui, 
                currentSection: targetSection, 
                journalView: 'session' 
              }
            });
          }}
          onNewSession={handleNewSession}
          onUpdate={onUpdate}
        />
      );
    }

    // Show JournalHome if no active session (fallback)
    if (!state.activeSessionId) {
      return (
        <JournalHome
          sessions={state.sessions}
          activeSessionId={state.activeSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          onUpdate={onUpdate}
        />
      );
    }
    
    // Route to appropriate subview based on currentSection
    switch (state.ui.currentSection) {
      case 'epoch1':
        return (
          <SessionView
            key={`${state.activeSessionId}-epoch1`}
            state={state}
            onUpdate={onUpdate}
            epochKey="epoch1"
            onNext={() => onNavigateToSection('analyst1_epoch1')}
            onBack={handleNewSession}
            onBackToList={() => onUpdate({ ui: { ...state.ui, journalView: 'home' } })}
          />
        );
      
      case 'analyst1_epoch1':
        return (
          <AnalysisView
            key={`${state.activeSessionId}-analyst1-epoch1`}
            state={state}
            onUpdate={onUpdate}
            analystKey="analyst1"
            epochKey="epoch1"
            onNext={() => onNavigateToSection('analyst2_epoch1')}
            onBack={() => onNavigateToSection('epoch1')}
          />
        );
      
      case 'analyst2_epoch1':
        return (
          <AnalysisView
            key={`${state.activeSessionId}-analyst2-epoch1`}
            state={state}
            onUpdate={onUpdate}
            analystKey="analyst2"
            epochKey="epoch1"
            onNext={() => onNavigateToSection('epoch2')}
            onBack={() => onNavigateToSection('analyst1_epoch1')}
          />
        );
      
      case 'epoch2':
        return (
          <SessionView
            key={`${state.activeSessionId}-epoch2`}
            state={state}
            onUpdate={onUpdate}
            epochKey="epoch2"
            onNext={() => onNavigateToSection('analyst1_epoch2')}
            onBack={() => onNavigateToSection('analyst2_epoch1')}
            onBackToList={() => onUpdate({ ui: { ...state.ui, journalView: 'home' } })}
          />
        );
    
    case 'analyst1_epoch2':
      return (
        <AnalysisView
          key={`${state.activeSessionId}-analyst1-epoch2`}
          state={state}
          onUpdate={onUpdate}
          analystKey="analyst1"
          epochKey="epoch2"
          onNext={() => onNavigateToSection('analyst2_epoch2')}
          onBack={() => onNavigateToSection('epoch2')}
        />
      );
    
    case 'analyst2_epoch2':
      return (
        <AnalysisView
          key={`${state.activeSessionId}-analyst2-epoch2`}
          state={state}
          onUpdate={onUpdate}
          analystKey="analyst2"
          epochKey="epoch2"
          onNext={() => onNavigateToSection('report')}
          onBack={() => onNavigateToSection('analyst1_epoch2')}
        />
      );
    
    case 'report':
      return (
        <ReportSection
          state={state}
          onUpdate={onUpdate}
          onBack={() => onNavigateToSection('analyst2_epoch2')}
          onNavigateToSection={onNavigateToSection}
        />
      );
    
      default:
        return (
          <JournalHome
            sessions={state.sessions}
            activeSessionId={state.activeSessionId}
            onSelectSession={handleSelectSession}
            onNewSession={handleNewSession}
            onUpdate={onUpdate}
          />
        );
    }
  };

  // Determine if we should show the timer (only for epoch sections)
  const currentSection = state.ui.currentSection;
  const showTimer = state.activeSessionId && (currentSection === 'epoch1' || currentSection === 'epoch2');
  const timerEpochKey = currentSection === 'epoch1' ? 'epoch1' : 'epoch2';

  // Track last persisted value to reduce storage writes (gate to 30s increments)
  const lastPersistedRef = useRef<number>(-1);

  // Handler to update duration when timer changes (memoized to prevent Timer re-renders)
  const handleDurationChange = useCallback(async (minutes: number) => {
    if (!state.activeSessionId) return;
    
    try {
      // Always fetch the latest session to avoid overwriting newer turns
      const fresh = await sessionsStorage.getById(state.activeSessionId);
      if (!fresh) return;

      // Guard: only persist if minutes actually changed
      const current = fresh.epochs[timerEpochKey].duration_minutes;
      if (minutes === current) return;

      // Gate to 30-second increments to reduce storage writes
      // Round to nearest 0.5 minute (30 seconds)
      const rounded = Math.floor(minutes * 2) / 2;
      if (rounded === lastPersistedRef.current) return;
      
      lastPersistedRef.current = rounded;

      const newState = await sessionsStorage.update(state.activeSessionId, {
        epochs: {
          ...fresh.epochs,
          [timerEpochKey]: {
            ...fresh.epochs[timerEpochKey],
            duration_minutes: minutes
          }
        }
      });

      // Update parent state with partial to avoid clobbering UI
      onUpdate({ sessions: newState.sessions });
    } catch (error) {
      console.error('Failed to update duration:', error);
    }
  }, [state.activeSessionId, timerEpochKey, onUpdate]);

  // Handler for ProgressDashboard navigation - converts Section to the specific subset
  const handleProgressNavigation = (section: 'epoch1' | 'epoch2' | 'analyst1_epoch1' | 'analyst1_epoch2' | 'analyst2_epoch1' | 'analyst2_epoch2' | 'report') => {
    onNavigateToSection(section);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tab Bar - always show in Journal */}
      <JournalTabs
        sessions={state.sessions}
        activeSessionId={state.activeSessionId}
        onSelectSession={handleSelectSession}
        onCloseSession={handleCloseSession}
        onNewSession={handleNewSession}
      />
      
      {/* Progress Dashboard - show below tabs when there's an active session */}
      {state.activeSessionId && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <ProgressDashboard state={state} onNavigate={handleProgressNavigation} />
        </div>
      )}
      
      {/* Timer - show below progress during epoch sections */}
      {showTimer && (
        <Timer 
          key={`${state.activeSessionId}-${timerEpochKey}`}
          sessionId={state.activeSessionId!}
          epochKey={timerEpochKey}
          initialDuration={(() => {
            const session = getActiveSession(state);
            return session?.epochs[timerEpochKey].duration_minutes || 0;
          })()}
          onDurationChange={handleDurationChange}
        />
      )}
      
      {/* Content */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default JournalApp;

