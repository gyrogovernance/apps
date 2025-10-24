// Detector Analyst View - Wrapper around AnalystEvaluationForm
// Uses Insight-first approach with drafts for persistence

import React from 'react';
import { NotebookState, ChallengeType, DetectorUIState, AnalystResponse } from '../../../types';
import { useToast } from '../../shared/Toast';
import AnalystEvaluationForm from '../../shared/AnalystEvaluationForm';
import GlassCard from '../../shared/GlassCard';

interface DetectorAnalystProps {
  state: NotebookState;
  onUpdate: (updates: Partial<NotebookState>) => void;
  analystNumber: 1 | 2;
  onNext: () => void;
  onBack: () => void;
  draftKey: string | undefined; // Key to retrieve the current detector draft
}

const DetectorAnalyst: React.FC<DetectorAnalystProps> = ({
  state,
  onUpdate,
  analystNumber,
  onNext,
  onBack,
  draftKey
}) => {
  const toast = useToast();

  if (!draftKey || !state.drafts || !state.drafts[draftKey]) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-red-500 dark:text-red-400">
        Error: No detector data found. Please start a new analysis.
        <button onClick={onBack} className="btn-secondary mt-4">← Back</button>
      </div>
    );
  }

  const draftData: DetectorUIState = state.drafts[draftKey] as DetectorUIState;

  // Namespace the analyst JSON drafts by the active detector draftKey
  const evaluationDraftKey = draftKey ? `${draftKey}::analyst_${analystNumber}` : `detector::analyst_${analystNumber}`;
  const sessionId = draftKey ? `detector::${draftKey}` : 'detector';

  // Get transcript from parsed result
  const transcript = draftData.transcript;

  const existingEvaluation = analystNumber === 1 ? draftData.analyst1 : draftData.analyst2;

  const handleComplete = async (evaluation: AnalystResponse, modelName: string) => {
    const updatedDraft: DetectorUIState = {
      ...draftData,
      [`analyst${analystNumber}`]: evaluation,
      [`model_analyst${analystNumber}`]: modelName // Store model name in draft
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
      {/* How It Works - Show during evaluation */}
      <GlassCard className="p-4" variant="glassBlue">
        <h3 className="card-title text-sm">How It Works</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>You paste an AI conversation (3-6 turns)</li>
          <li>You evaluate it using 2 different AI models</li>
          <li>We compute 12 metrics + structural coherence (SI)</li>
          <li>Risk Score shows structural integrity</li>
        </ol>
      </GlassCard>

      <AnalystEvaluationForm
        transcript={transcript}
        challengeType="custom"
        analystNumber={analystNumber}
        onComplete={handleComplete}
        onBack={onBack}
        existingEvaluation={existingEvaluation}
        mode="detector" // Indicate detector mode for prompt generation
        sessionId={sessionId}
        draftKey={evaluationDraftKey}
      />
    </div>
  );
};

export default DetectorAnalyst;
