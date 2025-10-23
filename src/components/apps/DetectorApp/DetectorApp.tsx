// Main Detector App router component
// Routes between detector views (input → analyst1 → analyst2 → results)

import React, { useEffect } from 'react';
import { NotebookState, DetectorView } from '../../../types';
import DetectorInput from './DetectorInput';
import DetectorAnalyst from './DetectorAnalyst';
import DetectorResults from './DetectorResults';

interface DetectorAppProps {
  state: NotebookState;
  onUpdate: (updates: Partial<NotebookState>) => void;
  onNavigateHome: () => void;
}

const DetectorApp: React.FC<DetectorAppProps> = ({ 
  state, 
  onUpdate, 
  onNavigateHome 
}) => {
  const detectorView = state.ui.detectorView || 'input';

  // Scroll to top whenever the detector view changes
  useEffect(() => {
    const scrollToTop = () => {
      // Find the scrollable container (the main content area)
      const scrollableContainer = document.querySelector('.overflow-y-auto');
      if (scrollableContainer) {
        scrollableContainer.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Fallback to window scroll
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    // Try immediate scroll
    scrollToTop();
    
    // Also try after a short delay to ensure DOM is updated
    const timeoutId = setTimeout(scrollToTop, 50);
    
    return () => clearTimeout(timeoutId);
  }, [detectorView]);

  const navigateToView = (view: DetectorView) => {
    onUpdate({ 
      ui: { 
        ...state.ui, 
        detectorView: view 
      } 
    });
  };

  const handleNext = () => {
    switch (detectorView) {
      case 'input':
        navigateToView('analyst1');
        break;
      case 'analyst1':
        navigateToView('analyst2');
        break;
      case 'analyst2':
        navigateToView('results');
        break;
      case 'results':
        // Results view handles its own navigation
        break;
    }
  };

  const handleBack = () => {
    switch (detectorView) {
      case 'input':
        onNavigateHome();
        break;
      case 'analyst1':
        navigateToView('input');
        break;
      case 'analyst2':
        navigateToView('analyst1');
        break;
      case 'results':
        navigateToView('analyst2');
        break;
    }
  };

  // Pass the current draft key to children for persistence
  const currentDraftKey = state.ui.detectorView === 'input'
    ? undefined // Input view creates the draft
    : state.ui.detectorDraftKey
      || Object.keys(state.drafts || {})
          .filter(key => key.startsWith('detector_'))
          .sort()  // keys are detector_<timestamp>, so string sort works
          .pop();

  // Render appropriate view
  switch (detectorView) {
    case 'input':
      return (
        <DetectorInput
          state={state}
          onUpdate={onUpdate}
          navigateToView={navigateToView}
          onNavigateHome={onNavigateHome}
        />
      );
    case 'analyst1':
      return (
        <DetectorAnalyst
          state={state}
          onUpdate={onUpdate}
          analystNumber={1}
          onNext={handleNext}
          onBack={handleBack}
          draftKey={currentDraftKey}
        />
      );
    case 'analyst2':
      return (
        <DetectorAnalyst
          state={state}
          onUpdate={onUpdate}
          analystNumber={2}
          onNext={handleNext}
          onBack={handleBack}
          draftKey={currentDraftKey}
        />
      );
    case 'results':
      return (
        <DetectorResults
          state={state}
          onUpdate={onUpdate}
          onNavigateHome={onNavigateHome}
          draftKey={currentDraftKey}
        />
      );
    default:
      return (
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Invalid Detector View
            </h1>
            <button
              onClick={() => navigateToView('input')}
              className="btn-primary"
            >
              Start Over
            </button>
          </div>
        </div>
      );
  }
};

export default DetectorApp;
