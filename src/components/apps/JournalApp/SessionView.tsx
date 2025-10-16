import React from 'react';
import { NotebookState } from '../../../types';
import SynthesisSection from '../../SynthesisSection';

interface SessionViewProps {
  state: NotebookState;
  onUpdate: (updates: Partial<NotebookState> | ((prev: NotebookState) => Partial<NotebookState>)) => void;
  epochKey: 'epoch1' | 'epoch2';
  onNext: () => void;
  onBack: () => void;
}

/**
 * SessionView wraps SynthesisSection to provide consistent JournalApp routing.
 * Currently passes through to existing SynthesisSection which already syncs with sessions.
 * Future: Could load directly from session storage here for true session-first architecture.
 */
const SessionView: React.FC<SessionViewProps> = ({
  state,
  onUpdate,
  epochKey,
  onNext,
  onBack
}) => {
  // For now, delegate to SynthesisSection which already has session sync
  // In future iteration, could load session here and pass specific epoch data
  return (
    <SynthesisSection
      state={state}
      onUpdate={onUpdate}
      epochKey={epochKey}
      onNext={onNext}
      onBack={onBack}
    />
  );
};

export default SessionView;

