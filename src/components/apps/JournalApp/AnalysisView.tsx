import React from 'react';
import { NotebookState } from '../../../types';
import AnalystSection from '../../AnalystSection';

interface AnalysisViewProps {
  state: NotebookState;
  onUpdate: (updates: Partial<NotebookState> | ((prev: NotebookState) => Partial<NotebookState>)) => void;
  analystKey: 'analyst1' | 'analyst2';
  epochKey: 'epoch1' | 'epoch2';
  onNext: () => void;
  onBack: () => void;
}

/**
 * AnalysisView wraps AnalystSection for per-epoch analyst evaluations.
 * Now explicitly receives both analystKey and epochKey from parent routing.
 */
const AnalysisView: React.FC<AnalysisViewProps> = ({
  state,
  onUpdate,
  analystKey,
  epochKey,
  onNext,
  onBack
}) => {
  return (
    <AnalystSection
      state={state}
      onUpdate={onUpdate}
      analystKey={analystKey}
      epochKey={epochKey}
      onNext={onNext}
      onBack={onBack}
    />
  );
};

export default AnalysisView;

