import React from 'react';
import { NotebookState, GadgetType, GadgetView } from '../../../types';
import { useToast } from '../../shared/Toast';
import GlassCard from '../../shared/GlassCard';
import { CopyableDetails } from '../../shared/CopyableDetails';
import { POLICY_AUDIT_TASK, POLICY_REPORT_TASK, SANITIZE_TASK, IMMUNITY_BOOST_TASK } from '../../../lib/prompts';

interface GadgetTaskViewProps {
  state: NotebookState;
  onUpdate: (updates: Partial<NotebookState>) => void;
  gadgetType: GadgetType;
  onNext: () => void;
  onBack: () => void;
  navigateToView: (view: GadgetView) => void;
}

const GADGET_INFO: Record<GadgetType, { title: string; description: string; taskPrompt: string; icon: string }> = {
  'rapid-test': {
    title: 'Rapid Test',
    icon: '🔬',
    description: 'Quick GyroDiagnostics metric computation',
    taskPrompt: ''
  },
  'policy-audit': {
    title: 'Policy Auditing',
    icon: '📊',
    description: 'Extract claims & evidence from documents',
    taskPrompt: POLICY_AUDIT_TASK
  },
  'policy-report': {
    title: 'Policy Reporting',
    icon: '📋',
    description: 'Create executive synthesis with attribution',
    taskPrompt: POLICY_REPORT_TASK
  },
  'sanitize': {
    title: 'AI Infections Sanitization',
    icon: '🦠',
    description: 'Remove hidden patterns and normalize text',
    taskPrompt: SANITIZE_TASK
  },
  'immunity-boost': {
    title: 'Pathologies Immunity Boost',
    icon: '💊',
    description: 'Enhance content quality across 12 metrics',
    taskPrompt: IMMUNITY_BOOST_TASK
  }
};

const GadgetTaskView: React.FC<GadgetTaskViewProps> = ({
  state,
  onUpdate,
  gadgetType,
  onNext,
  onBack,
  navigateToView
}) => {
  const toast = useToast();
  const gadgetInfo = GADGET_INFO[gadgetType];
  const draftKey = state.ui.gadgetDraftKey;

  const handleNext = async () => {
    if (!draftKey) {
      toast.show('Error: No draft key found. Please restart.', 'error');
      return;
    }

    const durationMinutes = (state.drafts?.[draftKey]?.durationMinutes) || 1;
    const updatedDraft = {
      ...(state.drafts?.[draftKey] || {}),
      type: gadgetType,
      durationMinutes,
      timestamp: Date.now()
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
      {/* Header */}
      <div className="text-center">
        <div className="text-5xl mb-3">{gadgetInfo.icon}</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {gadgetInfo.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {gadgetInfo.description}
        </p>
      </div>

      {/* Workflow Guide */}
      <GlassCard className="p-4" variant="glassBlue">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          📋 Workflow
        </h3>
        {gadgetType === 'rapid-test' ? (
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>Copy the Analysis prompt and run it on your conversation</li>
            <li>Paste the JSON response below to continue</li>
            <li>We evaluate with 2 analyst models</li>
            <li>Get a diagnosis with QI, AR, SI</li>
          </ol>
        ) : (
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>Copy the task prompt below</li>
            <li>Run it in your AI (ChatGPT, Claude, etc.)</li>
            <li>We'll evaluate the output using 2 analyst models</li>
            <li>Get diagnosis card with quality metrics</li>
          </ol>
        )}
      </GlassCard>

      {gadgetType !== 'rapid-test' && (
        <GlassCard className="p-4">
          <CopyableDetails
            title="📝 Task Prompt (copy this)"
            content={gadgetInfo.taskPrompt}
          />
        </GlassCard>
      )}

      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary">
          ← Back
        </button>
        <button onClick={handleNext} className="btn-primary">
          {gadgetType === 'rapid-test' ? 'Next: Paste JSON →' : 'Next: Analyst Evaluation →'}
        </button>
      </div>
    </div>
  );
};

export default GadgetTaskView;

