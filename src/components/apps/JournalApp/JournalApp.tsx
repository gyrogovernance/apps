import React from 'react';
import { NotebookState, JournalView } from '../../../types';
import { storage } from '../../../lib/storage';
import JournalHome from './JournalHome';
import SessionView from './SessionView';
import AnalysisView from './AnalysisView';
import ReportSection from '../../ReportSection';

interface JournalAppProps {
  state: NotebookState;
  onUpdate: (updates: Partial<NotebookState> | ((prev: NotebookState) => Partial<NotebookState>)) => void;
  onNavigateToChallenges: () => void;
  onNavigateToSection: (section: 'epoch1' | 'epoch2' | 'analyst1' | 'analyst2' | 'report') => void;
}

const JournalApp: React.FC<JournalAppProps> = ({ 
  state, 
  onUpdate,
  onNavigateToChallenges,
  onNavigateToSection
}) => {
  const currentView = state.ui.journalView || 'home';

  const handleSelectSession = (sessionId: string) => {
    // Load the session and determine where to navigate
    const session = state.sessions.find(s => s.id === sessionId);
    if (!session) return;

    // Update activeSessionId
    onUpdate({ activeSessionId: sessionId });

    // Determine which section to navigate to based on session progress
    const epoch1Done = session.epochs.epoch1.completed;
    const epoch2Done = session.epochs.epoch2.completed;
    const analyst1Done = session.analysts.analyst1.status === 'complete';
    const analyst2Done = session.analysts.analyst2.status === 'complete';

    let targetSection: 'epoch1' | 'epoch2' | 'analyst1' | 'analyst2' | 'report' = 'epoch1';
    if (!epoch1Done) targetSection = 'epoch1';
    else if (!epoch2Done) targetSection = 'epoch2';
    else if (!analyst1Done) targetSection = 'analyst1';
    else if (!analyst2Done) targetSection = 'analyst2';
    else targetSection = 'report';

    // Also sync session data to legacy state fields for existing components
    onUpdate({
      challenge: session.challenge,
      process: session.process,
      epochs: session.epochs,
      analysts: {
        analyst1: session.analysts.analyst1.data,
        analyst2: session.analysts.analyst2.data
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

  // Show JournalHome if no active session or on setup section
  if (currentView === 'home' || !state.activeSessionId || state.ui.currentSection === 'setup') {
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
          state={state}
          onUpdate={onUpdate}
          epochKey="epoch1"
          onNext={() => onNavigateToSection('epoch2')}
          onBack={handleNewSession}
        />
      );
    
    case 'epoch2':
      return (
        <SessionView
          state={state}
          onUpdate={onUpdate}
          epochKey="epoch2"
          onNext={() => onNavigateToSection('analyst1')}
          onBack={() => onNavigateToSection('epoch1')}
        />
      );
    
    case 'analyst1':
      return (
        <AnalysisView
          state={state}
          onUpdate={onUpdate}
          analystKey="analyst1"
          onNext={() => onNavigateToSection('analyst2')}
          onBack={() => onNavigateToSection('epoch2')}
        />
      );
    
    case 'analyst2':
      return (
        <AnalysisView
          state={state}
          onUpdate={onUpdate}
          analystKey="analyst2"
          onNext={() => onNavigateToSection('report')}
          onBack={() => onNavigateToSection('analyst1')}
        />
      );
    
    case 'report':
      return (
        <ReportSection
          state={state}
          onUpdate={onUpdate}
          onBack={() => onNavigateToSection('analyst2')}
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

export default JournalApp;

