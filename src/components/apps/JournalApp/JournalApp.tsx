import React from 'react';
import { NotebookState } from '../../../types';
import { sessions as sessionsStorage } from '../../../lib/storage';
import { getNextSection } from '../../../lib/session-utils';
import JournalHome from './JournalHome';
import JournalTabs from './JournalTabs';
import SessionView from './SessionView';
import AnalysisView from './AnalysisView';
import ReportSection from '../../ReportSection';
import SetupSection from '../../SetupSection';
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
  const handleCloseSession = async (sessionId: string) => {
    try {
      const session = state.sessions.find(s => s.id === sessionId);
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
              currentSection: 'setup'
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
            currentSection: otherActiveSession ? state.ui.currentSection : 'setup'
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
    const session = state.sessions.find(s => s.id === sessionId);
    if (!session) return;

    // Use canonical getNextSection to determine target
    const targetSection = getNextSection(session);

    // Update state with selected session and navigate to appropriate section
    // Note: Legacy analyst fields maintained for backward compatibility
    onUpdate({
      activeSessionId: sessionId,
      challenge: session.challenge,
      process: session.process,
      epochs: session.epochs,
      analysts: {
        analyst1: session.analysts.epoch1.analyst1.data,
        analyst2: session.analysts.epoch2.analyst2.data
      },
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
    // Show JournalHome if no active session
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
    
    // Show Setup screen inside Journal when currentSection === 'setup'
    if (state.ui.currentSection === 'setup') {
      return (
        <SetupSection
          state={state}
          onUpdate={onUpdate}
          onNext={() => onNavigateToSection('epoch1')}
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

  // Handler to update duration when timer changes
  const handleDurationChange = async (minutes: number) => {
    if (!state.activeSessionId) return;
    
    try {
      const session = state.sessions.find(s => s.id === state.activeSessionId);
      if (!session) return;

      // Guard: only persist if minutes actually changed
      const current = session.epochs[timerEpochKey].duration_minutes;
      if (minutes === current) return;

      const newState = await sessionsStorage.update(state.activeSessionId, {
        epochs: {
          ...session.epochs,
          [timerEpochKey]: {
            ...session.epochs[timerEpochKey],
            duration_minutes: minutes
          }
        }
      });

      // Update parent state with partial to avoid clobbering UI
      onUpdate({ sessions: newState.sessions });
    } catch (error) {
      console.error('Failed to update duration:', error);
    }
  };

  // Handler for ProgressDashboard navigation - converts Section to the specific subset
  const handleProgressNavigation = (section: 'setup' | 'epoch1' | 'epoch2' | 'analyst1_epoch1' | 'analyst1_epoch2' | 'analyst2_epoch1' | 'analyst2_epoch2' | 'report') => {
    // Only allow navigation to non-setup sections since setup is handled differently
    if (section !== 'setup') {
      onNavigateToSection(section);
    }
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
          sessionId={state.activeSessionId!}
          epochKey={timerEpochKey}
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

