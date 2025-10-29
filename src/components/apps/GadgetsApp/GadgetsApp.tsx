// Main Gadgets App router component
// Integrates all gadget types with unified workflow

import React from 'react';
import { NotebookState, GadgetType, GadgetView } from '../../../types';
import GadgetSelector from './GadgetSelector';
import GadgetAccordion from './GadgetAccordion';
import TreatmentSelector from './TreatmentSelector';

interface GadgetsAppProps {
  state: NotebookState;
  onUpdate: (updates: Partial<NotebookState>) => void;
  onNavigateHome: () => void;
}

const GadgetsApp: React.FC<GadgetsAppProps> = ({
  state,
  onUpdate,
  onNavigateHome
}) => {
  const gadgetView = state.ui.gadgetView || 'selector';
  const gadgetType = state.ui.gadgetType || 'rapid-test';

  // Render appropriate view
  if (gadgetView === 'selector') {
    return (
      <GadgetSelector
        state={state}
        onUpdate={onUpdate}
        onNavigateHome={onNavigateHome}
        navigateToView={(view: GadgetView) => {
          onUpdate({
            ui: {
              ...state.ui,
              gadgetView: view
            }
          });
        }}
      />
    );
  }

  if (gadgetView === 'treatment-selector') {
    return (
      <TreatmentSelector
        state={state}
        onUpdate={onUpdate}
        onNavigateHome={onNavigateHome}
      />
    );
  }

  // All analysis gadgets go through the accordion workflow
  return (
    <GadgetAccordion
      state={state}
      onUpdate={onUpdate}
      gadgetType={gadgetType}
      onNavigateHome={onNavigateHome}
    />
  );
};

export default GadgetsApp;

