import React from 'react';
import { NotebookState } from '../../../types';
import AnalystSection from '../../AnalystSection';

interface AnalysisViewProps {
  state: NotebookState;
  onUpdate: (updates: Partial<NotebookState> | ((prev: NotebookState) => Partial<NotebookState>)) => void;
  analystKey: 'analyst1' | 'analyst2';
  onNext: () => void;
  onBack: () => void;
}

/**
 * AnalysisView wraps AnalystSection to provide consistent JournalApp routing.
 * Currently passes through to existing AnalystSection which already syncs with sessions.
 * Future: Could load directly from session storage here for true session-first architecture.
 */
const AnalysisView: React.FC<AnalysisViewProps> = ({
  state,
  onUpdate,
  analystKey,
  onNext,
  onBack
}) => {
  // For now, delegate to AnalystSection which already has session sync
  // In future iteration, could load session here and pass specific analyst data
  return (
    <AnalystSection
      state={state}
      onUpdate={onUpdate}
      analystKey={analystKey}
      onNext={onNext}
      onBack={onBack}
    />
  );
};

export default AnalysisView;

