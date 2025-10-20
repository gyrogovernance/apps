import React, { useState, useEffect } from 'react';
import { NotebookState, Section, AppScreen, ChallengeType, Platform, INITIAL_STATE } from '../types';
import { storage, sessions } from '../lib/storage';
import { chromeAPI } from '../lib/chrome-mock';
import { useToast } from './shared/Toast';
import { useConfirm } from './shared/Modal';
import { PersistentHeader } from './shared/PersistentHeader';
import WelcomeApp from './apps/WelcomeApp';
import ChallengesApp from './apps/ChallengesApp/ChallengesApp';
import InsightsApp from './apps/InsightsApp/InsightsApp';
import JournalApp from './apps/JournalApp/JournalApp';
import { SettingsApp } from './apps/SettingsApp';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

const Notebook: React.FC = () => {
  const [state, setState] = useState<NotebookState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const toast = useToast();
  const { confirm, ConfirmModal } = useConfirm();

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'mod+n': () => navigateToApp('challenges'),
    'mod+j': () => navigateToApp('journal'),
    'mod+i': () => navigateToApp('insights'),
    'mod+h': () => navigateToApp('welcome'),
    'escape': () => navigateToApp('welcome')
  });

  // Load state on mount and listen for storage changes
  useEffect(() => {
    console.log('Notebook: Loading initial state...');
    const loadState = async () => {
      try {
        const loadedState = await storage.get();
        console.log('Notebook: State loaded:', loadedState);
        setState(loadedState);
      } catch (error) {
        console.error('Notebook: Error loading state:', error);
        setState(INITIAL_STATE);
      } finally {
        setLoading(false);
      }
    };
    
    loadState();

    // Listen for storage changes (cross-tab sync)
    const handleStorageChange = (changes: any, areaName: string) => {
      if (areaName === 'local' && changes['notebook_state']) {
        const newState = changes['notebook_state'].newValue;
        if (newState) {
          console.log('Storage updated externally, syncing state...');
          setState(newState);
        }
      }
    };

    chromeAPI.storage.onChanged.addListener(handleStorageChange);
    
    return () => {
      chromeAPI.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // Save state on changes - using functional setState to avoid race conditions
  const updateState = (updates: Partial<NotebookState> | ((prev: NotebookState) => Partial<NotebookState>)) => {
    setState(prev => {
      const u = typeof updates === 'function' ? updates(prev) : updates;

      const newState: NotebookState = {
        ...prev,
        ...u,
        challenge: u.challenge ? { ...prev.challenge, ...u.challenge } : prev.challenge,
        process: u.process ? { ...prev.process, ...u.process } : prev.process,
        epochs: u.epochs ? { ...prev.epochs, ...u.epochs } : prev.epochs,
        analysts: u.analysts ? { ...prev.analysts, ...u.analysts } : prev.analysts,
        ui: u.ui ? { ...prev.ui, ...u.ui } : prev.ui,
        sessions: u.sessions !== undefined ? u.sessions : prev.sessions,
        activeSessionId: u.activeSessionId !== undefined ? u.activeSessionId : prev.activeSessionId,
      };

      // Persist atomically with the merged state
      storage.set(newState);
      return newState;
    });
  };

  const navigateToApp = (app: AppScreen) => {
    updateState(prev => ({
      ui: { 
        ...prev.ui, 
        currentApp: app,
        // Reset sub-views when changing apps to prevent stuck states
        insightsView: app === 'insights' ? 'library' : prev.ui.insightsView,
        challengesView: app === 'challenges' ? 'select-type' : prev.ui.challengesView,
        journalView: app === 'journal' ? 'home' : prev.ui.journalView
      }
    }));
  };

  const navigateToSection = (section: Section) => {
    updateState(prev => ({
      ui: { ...prev.ui, currentSection: section }
    }));
  };

  const handleQuickStart = () => {
    // Navigate to challenges app to start a new evaluation
    navigateToApp('challenges');
  };

  const handleResume = () => {
    // Navigate to journal app to resume the active session
    navigateToApp('journal');
  };

  const handleStartSession = async (challenge: {
    title: string;
    description: string;
    type: ChallengeType;
    domain: string[];
  }, platform: Platform) => {
    setOperationLoading(true);
    try {
      // Create new session in storage (updates storage)
      const newSession = await sessions.create(challenge, platform);
      
      // Reload entire state from storage (single source of truth)
      const freshState = await storage.get();
      
      // Update with fresh state + UI navigation
      updateState({
        ...freshState,
        ui: {
          ...freshState.ui,
          currentApp: 'journal',
          currentSection: 'setup'
        }
      });
      
      toast.show('Session created successfully', 'success');
    } catch (error) {
      console.error('Error creating session:', error);
      toast.show('Failed to create session', 'error');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleStartGyroSuite = async (platform: Platform) => {
    setOperationLoading(true);
    try {
      // Create 5 sessions for Gyro Suite
      const suiteTypes = ['formal', 'normative', 'procedural', 'strategic', 'epistemic'] as const;
      const suiteTitles: Record<typeof suiteTypes[number], string> = {
        formal: 'GyroDiagnostics - Formal (Physics & Math)',
        normative: 'GyroDiagnostics - Normative (Policy & Ethics)',
        procedural: 'GyroDiagnostics - Procedural (Code & Debugging)',
        strategic: 'GyroDiagnostics - Strategic (Finance & Strategy)',
        epistemic: 'GyroDiagnostics - Epistemic (Knowledge & Communication)'
      };

      const sessionIds: string[] = [];
      
      for (const type of suiteTypes) {
        const challenge = {
          title: suiteTitles[type],
          description: `Complete ${type} challenge as part of GyroDiagnostics Evaluation Suite`,
          type: type as ChallengeType,
          domain: ['GyroDiagnostics', type]
        };
        const session = await sessions.create(challenge, platform);
        sessionIds.push(session.id);
      }

      // Reload entire state from storage (single source of truth)
      const freshState = await storage.get();
      
      // Start with first challenge (Formal)
      const firstSession = freshState.sessions.find(s => s.id === sessionIds[0]);
      if (!firstSession) throw new Error('Failed to load first session');

      updateState({
        ...freshState,
        // Set suite tracking
        activeSessionId: sessionIds[0],
        gyroSuiteSessionIds: sessionIds,
        gyroSuiteCurrentIndex: 0,
        // Sync first session to legacy fields
        challenge: firstSession.challenge,
        process: firstSession.process,
        epochs: firstSession.epochs,
        analysts: {
          analyst1: null,
          analyst2: null
        },
        results: null,
        ui: {
          ...freshState.ui,
          currentApp: 'journal',
          currentSection: 'setup'
        }
      });
      
      toast.show('GyroDiagnostics Suite created - 5 challenges ready', 'success');
    } catch (error) {
      console.error('Error starting Gyro Suite:', error);
      toast.show('Failed to start Gyro Suite', 'error');
    } finally {
      setOperationLoading(false);
    }
  };

  const resetNotebook = async () => {
    const confirmed = await confirm(
      'Reset All Data?',
      'This will delete all sessions, insights, and progress. This action cannot be undone.',
      { destructive: true, confirmText: 'Reset Everything' }
    );
    
    if (confirmed) {
      await storage.clear();
      await chromeAPI.storage.local.clear(); // Clear insights too
      setState(INITIAL_STATE);
      toast.show('All data cleared', 'info');
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400 text-sm">
          Loading AI-Empowered Governance Apps...
        </div>
      </div>
    );
  }

  // Operation loading overlay
  if (operationLoading) {
    return (
      <div className="h-full w-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">⏳</div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">
            Creating session...
          </div>
        </div>
      </div>
    );
  }

  // Render different apps based on currentApp
  if (state.ui.currentApp === 'welcome') {
    return (
      <div className="h-full w-full max-w-full bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <WelcomeApp 
            state={state}
            onNavigate={navigateToApp}
            onQuickStart={handleQuickStart}
            onResume={handleResume}
          />
        </div>
        {ConfirmModal}
      </div>
    );
  }

  // For other apps, use PersistentHeader
  return (
    <div className="h-full w-full max-w-full bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      {/* Persistent Header with breadcrumb and quick nav */}
      <PersistentHeader 
        state={state}
        onNavigateToApp={navigateToApp}
        onNavigateHome={() => navigateToApp('welcome')}
      />


      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {state.ui.currentApp === 'challenges' && (
          <ChallengesApp 
            state={state}
            onUpdate={updateState}
            onStartSession={handleStartSession}
            onStartGyroSuite={handleStartGyroSuite}
          />
        )}

        {state.ui.currentApp === 'journal' && (
          <JournalApp
            state={state}
            onUpdate={updateState}
            onNavigateToChallenges={() => navigateToApp('challenges')}
            onNavigateToSection={navigateToSection}
          />
        )}

        {state.ui.currentApp === 'insights' && (
          <InsightsApp 
            state={state}
            onUpdate={updateState}
          />
        )}

        {state.ui.currentApp === 'settings' && (
          <SettingsApp />
        )}
      </div>
      {ConfirmModal}
    </div>
  );
};

export default Notebook;

