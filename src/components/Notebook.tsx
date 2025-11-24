import React, { useState, useEffect, lazy, Suspense, useCallback, useRef } from 'react';
import { NotebookState, Section, AppScreen, ChallengeType, Platform, INITIAL_STATE } from '../types';
import { storage, sessions } from '../lib/storage';
import { formatErrorForUser } from '../lib/error-utils';
import { chromeAPI } from '../lib/chrome-mock';
import { getSessionById } from '../lib/session-helpers';
import { useToast } from './shared/Toast';
import { useConfirm } from './shared/Modal';
import { PersistentHeader } from './shared/PersistentHeader';
import WelcomeApp from './apps/WelcomeApp';

// Lazy load app components for code splitting
const ChallengesApp = lazy(() => import('./apps/ChallengesApp/ChallengesApp'));
const InsightsApp = lazy(() => import('./apps/InsightsApp/InsightsApp'));
const JournalApp = lazy(() => import('./apps/JournalApp/JournalApp'));
const SettingsApp = lazy(() => import('./apps/SettingsApp').then(m => ({ default: m.SettingsApp })));
const GadgetsApp = lazy(() => import('./apps/GadgetsApp/GadgetsApp'));
const GlossaryApp = lazy(() => import('./apps/GlossaryApp/GlossaryApp').then(m => ({ default: m.GlossaryApp })));

// Preload function to fetch all lazy chunks immediately
const preloadLazyChunks = () => {
  // Trigger imports without waiting for them
  import('./apps/ChallengesApp/ChallengesApp').catch(err => 
    console.warn('Failed to preload ChallengesApp:', err)
  );
  import('./apps/InsightsApp/InsightsApp').catch(err => 
    console.warn('Failed to preload InsightsApp:', err)
  );
  import('./apps/JournalApp/JournalApp').catch(err => 
    console.warn('Failed to preload JournalApp:', err)
  );
  import('./apps/SettingsApp').catch(err => 
    console.warn('Failed to preload SettingsApp:', err)
  );
  import('./apps/GadgetsApp/GadgetsApp').catch(err => 
    console.warn('Failed to preload GadgetsApp:', err)
  );
  import('./apps/GlossaryApp/GlossaryApp').catch(err => 
    console.warn('Failed to preload GlossaryApp:', err)
  );
};

// Loading component for lazy-loaded apps
const AppLoader: React.FC = () => (
  <div className="h-full w-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="text-gray-600 dark:text-gray-400 text-sm">
      Loading...
    </div>
  </div>
);

const Notebook: React.FC = () => {
  const [state, setState] = useState<NotebookState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const toast = useToast();
  const { confirm, ConfirmModal } = useConfirm();

  // Preload all lazy chunks on mount
  useEffect(() => {
    preloadLazyChunks();
  }, []);

  // Load state on mount and listen for storage changes
  useEffect(() => {
    let mounted = true;
    
    const loadState = async () => {
      try {
        const loadedState = await storage.get();
        if (mounted) {
          setState(loadedState);
        }
      } catch (error) {
        console.error('Notebook: Error loading state:', error);
        if (mounted) {
          setState(INITIAL_STATE);
        }
      } finally {
        if (mounted) {
          // Use requestAnimationFrame to ensure React has finished initial render
          requestAnimationFrame(() => {
            if (mounted) {
              setLoading(false);
            }
          });
        }
      }
    };
    
    loadState();

    // Listen for storage changes (cross-tab sync)
    const handleStorageChange = (changes: any, areaName: string) => {
      if (areaName === 'local' && changes['notebook_state']) {
        const newState = changes['notebook_state'].newValue;
        
        if (newState && mounted) {
          // FIX: Use functional update to access current state and compare
          // Prevent re-render loop by checking if state actually changed
          setState(prevState => {
            // Deep equality check - if data is identical, return same reference to abort re-render
            if (JSON.stringify(prevState) === JSON.stringify(newState)) {
              return prevState; // Return exact same ref to ABORT re-render
            }
            return newState;
          });
        }
      }
    };

    chromeAPI.storage.onChanged.addListener(handleStorageChange);
    
    return () => {
      mounted = false;
      chromeAPI.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // Save state on changes with functional updates to prevent stale closures
  // Debounce persistence to chrome.storage to avoid write loops and UI thrash
  const persistTimerRef = useRef<number | null>(null);
  const pendingStateRef = useRef<NotebookState | null>(null);
  useEffect(() => {
    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
        persistTimerRef.current = null;
      }
      pendingStateRef.current = null;
    };
  }, []);
  const updateState = useCallback((
    updates: Partial<NotebookState> | ((prev: NotebookState) => Partial<NotebookState>)
  ) => {
    setState(prevState => {
      const u = typeof updates === 'function'
        ? (updates as (p: NotebookState) => Partial<NotebookState>)(prevState)
        : updates;

      const newState: NotebookState = {
        ...prevState,
        ...u,
        ui: u.ui ? { ...prevState.ui, ...u.ui } : prevState.ui,
        sessions: u.sessions !== undefined ? u.sessions : prevState.sessions,
        activeSessionId: u.activeSessionId !== undefined ? u.activeSessionId : prevState.activeSessionId,
      };

      // Queue persistence (debounced) to avoid rapid write/read loops
      pendingStateRef.current = newState;
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
      }
      persistTimerRef.current = window.setTimeout(() => {
        const toPersist = pendingStateRef.current;
        if (!toPersist) return;
        storage.set(toPersist).catch(error => {
          const msg = formatErrorForUser(error);
          toast.show(msg || 'Failed to persist changes', 'error');
          console.error('Failed to persist notebook_state', error);
        });
        pendingStateRef.current = null;
        persistTimerRef.current = null;
      }, 75);

      return newState;
    });
  }, [toast]);

  const navigateToApp = useCallback((app: AppScreen) => {
    if (app === 'glossary') {
      // For glossary, just show the modal without changing currentApp
      updateState(prev => ({
        ui: { 
          ...prev.ui, 
          showGlossary: true
        }
      }));
      return;
    }
    
    updateState(prev => ({
      ui: { 
        ...prev.ui, 
        currentApp: app,
        // Reset sub-views when changing apps to prevent stuck states
        insightsView: app === 'insights' ? 'library' : prev.ui.insightsView,
        challengesView: app === 'challenges' ? 'select-type' : prev.ui.challengesView,
        journalView: app === 'journal' ? 'home' : prev.ui.journalView,
        gadgetView: app === 'gadgets' ? 'selector' : prev.ui.gadgetView,
        showGlossary: false // Close glossary when navigating to other apps
      }
    }));
  }, [updateState]);

  const toggleGlossary = useCallback(() => {
    updateState(prev => ({
      ui: { 
        ...prev.ui, 
        showGlossary: !prev.ui.showGlossary
      }
    }));
  }, [updateState]);

  const navigateToSection = useCallback((section: Section) => {
    updateState(prev => ({
      ui: { ...prev.ui, currentSection: section }
    }));
  }, [updateState]);

  const handleQuickStart = useCallback(() => {
    // Navigate to challenges app to start a new evaluation
    navigateToApp('challenges');
  }, [navigateToApp]);

  const handleResume = useCallback(() => {
    // Navigate to journal app to resume the active session
    navigateToApp('journal');
  }, [navigateToApp]);

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
          journalView: 'session', // Go directly to session view (Epoch 1)
          currentSection: 'epoch1'
        }
      });
      
      toast.show('Session created successfully', 'success');
    } catch (error) {
      console.error('Error creating session:', error);
      toast.show(formatErrorForUser(error), 'error');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleStartGyroSuite = async (platform: Platform) => {
    setOperationLoading(true);
    try {
      // Generate unique suite run ID for linking insights
      const suiteRunId = `suite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create 5 sessions for Gyro Suite
      const suiteTypes = ['formal', 'normative', 'procedural', 'strategic', 'epistemic'] as const;
      const suiteTitles: Record<typeof suiteTypes[number], string> = {
        formal: 'GyroDiagnostics - Formal (Physics & Math)',
        normative: 'GyroDiagnostics - Normative (Policy & Ethics)',
        procedural: 'GyroDiagnostics - Procedural (Code & Debugging)',
        strategic: 'GyroDiagnostics - Strategic (Finance & Strategy)',
        epistemic: 'GyroDiagnostics - Epistemic (Knowledge & Communication)'
      };

      // Build challenge items for batch creation
      const items = suiteTypes.map(type => ({
        challenge: {
          title: suiteTitles[type],
          description: `Complete ${type} challenge as part of GyroDiagnostics Evaluation Suite`,
          type: type as ChallengeType,
          domain: ['GyroDiagnostics', type]
        },
        platform
      }));

      // Create all sessions atomically with first session active
      const { sessionIds, state: freshState } = await sessions.createMany(items, 0);
      
      // Start with first challenge (Formal)
      const firstSession = getSessionById(freshState, sessionIds[0]);
      if (!firstSession) throw new Error('Failed to load first session');

      updateState({
        ...freshState,
        activeSessionId: sessionIds[0],
        gyroSuiteSessionIds: sessionIds,
        gyroSuiteCurrentIndex: 0,
        currentSuiteRunId: suiteRunId, // NEW: track this suite run
        ui: {
          ...freshState.ui,
          currentApp: 'journal',
          journalView: 'session', // Go directly to session view (Epoch 1)
          currentSection: 'epoch1'
        }
      });
      
      toast.show('GyroDiagnostics Suite created - 5 challenges ready', 'success');
    } catch (error) {
      console.error('Error starting Gyro Suite:', error);
      toast.show(formatErrorForUser(error), 'error');
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
          Loading AI Inspector...
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
        
        {/* Glossary Modal */}
        {state.ui.showGlossary && (
          <Suspense fallback={<AppLoader />}>
            <GlossaryApp
              state={state}
              onClose={() => toggleGlossary()}
            />
          </Suspense>
        )}
        
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
          <Suspense fallback={<AppLoader />}>
            <ChallengesApp 
              state={state}
              onUpdate={updateState}
              onStartSession={handleStartSession}
              onStartGyroSuite={handleStartGyroSuite}
            />
          </Suspense>
        )}

        {state.ui.currentApp === 'journal' && (
          <Suspense fallback={<AppLoader />}>
            <JournalApp
              state={state}
              onUpdate={updateState}
              onNavigateToChallenges={() => navigateToApp('challenges')}
              onNavigateToSection={navigateToSection}
            />
          </Suspense>
        )}

        {state.ui.currentApp === 'insights' && (
          <Suspense fallback={<AppLoader />}>
            <InsightsApp 
              state={state}
              onUpdate={updateState}
            />
          </Suspense>
        )}

        {state.ui.currentApp === 'settings' && (
          <Suspense fallback={<AppLoader />}>
            <SettingsApp />
          </Suspense>
        )}

        {state.ui.currentApp === 'gadgets' && (
          <Suspense fallback={<AppLoader />}>
            <GadgetsApp
              state={state}
              onUpdate={updateState}
              onNavigateHome={() => navigateToApp('welcome')}
            />
          </Suspense>
        )}
      </div>
      
      {/* Glossary Modal */}
      {state.ui.showGlossary && (
        <Suspense fallback={<AppLoader />}>
          <GlossaryApp
            state={state}
            onClose={() => toggleGlossary()}
          />
        </Suspense>
      )}
      
      {ConfirmModal}
    </div>
  );
};

export default Notebook;

