// Gadget Analyst View - Evaluate AI output using standard rubric
// Reuses AnalystEvaluationForm for consistency

import React from 'react';
import { NotebookState, AnalystResponse } from '../../../types';
import AnalystEvaluationForm from '../../shared/AnalystEvaluationForm';
import GlassCard from '../../shared/GlassCard';

interface GadgetAnalystProps {
  state: NotebookState;
  onUpdate: (updates: Partial<NotebookState>) => void;
  analystNumber: 1 | 2;
  onNext: () => void;
  onBack: () => void;
  draftKey: string | undefined;
}

const GadgetAnalyst: React.FC<GadgetAnalystProps> = ({
  state,
  onUpdate,
  analystNumber,
  onNext,
  onBack,
  draftKey
}) => {

  if (!draftKey || !state.drafts || !state.drafts[draftKey]) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-red-500 dark:text-red-400">
        Error: No gadget data found. Please start over.
        <button onClick={onBack} className="btn-secondary mt-4">← Back</button>
      </div>
    );
  }

  const draftData = state.drafts[draftKey];

  // Namespace the analyst JSON drafts by the active gadget draftKey
  const evaluationDraftKey = draftKey ? `${draftKey}::analyst_${analystNumber}` : `gadget::analyst_${analystNumber}`;
  const sessionId = draftKey ? `gadget::${draftKey}` : 'gadget';

  // Get transcript from draft (aiOutput serves as transcript)
  const transcript = draftData.transcript || draftData.aiOutput || '';

  const existingEvaluation = analystNumber === 1 ? draftData.analyst1 : draftData.analyst2;

  const handleComplete = async (evaluation: AnalystResponse, modelName: string) => {
    const updatedDraft = {
      ...draftData,
      [`analyst${analystNumber}`]: evaluation,
      [`model_analyst${analystNumber}`]: modelName
    };

    onUpdate({
      drafts: {
        ...state.drafts,
        [draftKey]: updatedDraft
      }
    });

    onNext();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Workflow Reminder */}
      <GlassCard className="p-4" variant="glassBlue">
        <h3 className="card-title text-sm">Evaluation Process</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>Copy the analyst prompt below (includes the AI output)</li>
          <li>Paste into a different AI model for evaluation</li>
          <li>Copy the JSON response and paste it here</li>
          <li>We compute 12 metrics + Superintelligence Index</li>
        </ol>
      </GlassCard>

      <AnalystEvaluationForm
        transcript={transcript}
        challengeType="custom"
        analystNumber={analystNumber}
        onComplete={handleComplete}
        onBack={onBack}
        existingEvaluation={existingEvaluation}
        mode="detector" // Use detector mode for gadget evaluation
        sessionId={sessionId}
        draftKey={evaluationDraftKey}
      />
    </div>
  );
};

export default GadgetAnalyst;

