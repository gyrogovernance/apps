import React, { useState, useEffect } from 'react';
import { NotebookState, Section, INITIAL_STATE } from '../types';
import { storage } from '../lib/storage';
import SetupSection from './SetupSection';
import SynthesisSection from './SynthesisSection';
import AnalystSection from './AnalystSection';
import ReportSection from './ReportSection';
import ProgressDashboard from './ProgressDashboard';

const Notebook: React.FC = () => {
  const [state, setState] = useState<NotebookState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);

  // Load state on mount
  useEffect(() => {
    console.log('Notebook: Loading initial state...');
    storage.get().then((loadedState) => {
      console.log('Notebook: State loaded:', loadedState);
      setState(loadedState);
      setLoading(false);
    }).catch((error) => {
      console.error('Notebook: Error loading state:', error);
      setState(INITIAL_STATE);
      setLoading(false);
    });
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
      };

      // Persist atomically with the merged state
      storage.set(newState);
      return newState;
    });
  };

  const navigateToSection = (section: Section) => {
    updateState(prev => ({
      ui: { ...prev.ui, currentSection: section }
    }));
  };

  const resetNotebook = async () => {
    if (confirm('Are you sure you want to reset? This will delete all progress.')) {
      await storage.clear();
      setState(INITIAL_STATE);
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

  return (
    <div className="h-full w-full max-w-full bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <h1 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">
              AI-Empowered Governance Apps
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-tight">
              Generate validated insights through structured AI-empowered processes
            </p>
          </div>
          <button
            onClick={resetNotebook}
            className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-2 py-1 whitespace-nowrap"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Progress Dashboard */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex-shrink-0">
        <ProgressDashboard state={state} onNavigate={navigateToSection} />
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3">
        {state.ui.currentSection === 'setup' && (
          <SetupSection state={state} onUpdate={updateState} onNext={() => navigateToSection('epoch1')} />
        )}

        {state.ui.currentSection === 'epoch1' && (
          <SynthesisSection
            state={state}
            onUpdate={updateState}
            epochKey="epoch1"
            onNext={() => navigateToSection('epoch2')}
            onBack={() => navigateToSection('setup')}
          />
        )}

        {state.ui.currentSection === 'epoch2' && (
          <SynthesisSection
            state={state}
            onUpdate={updateState}
            epochKey="epoch2"
            onNext={() => navigateToSection('analyst1')}
            onBack={() => navigateToSection('epoch1')}
          />
        )}

        {state.ui.currentSection === 'analyst1' && (
          <AnalystSection
            state={state}
            onUpdate={updateState}
            analystKey="analyst1"
            onNext={() => navigateToSection('analyst2')}
            onBack={() => navigateToSection('epoch2')}
          />
        )}

        {state.ui.currentSection === 'analyst2' && (
          <AnalystSection
            state={state}
            onUpdate={updateState}
            analystKey="analyst2"
            onNext={() => navigateToSection('report')}
            onBack={() => navigateToSection('analyst1')}
          />
        )}

        {state.ui.currentSection === 'report' && (
          <ReportSection
            state={state}
            onBack={() => navigateToSection('analyst2')}
          />
        )}
      </div>
    </div>
  );
};

export default Notebook;

