// Gadget Task View - Show task prompt and collect AI output
// Simplified input flow for all gadgets

import React, { useState, useEffect, useRef } from 'react';
import { NotebookState, GadgetType, GadgetView } from '../../../types';
import { useClipboard } from '../../../hooks/useClipboard';
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
  'detector': {
    title: 'Detector',
    icon: '🔍',
    description: 'Rapid deception analysis of AI conversations',
    taskPrompt: '' // Detector has special handling
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
  const { paste } = useClipboard();
  
  const [aiOutput, setAiOutput] = useState('');
  const [durationDisplay, setDurationDisplay] = useState('01:00');
  const hasLoadedDraft = useRef(false);

  const gadgetInfo = GADGET_INFO[gadgetType];
  const draftKey = state.ui.gadgetDraftKey;

  // Helper: Convert mm:ss format to decimal minutes
  const mmssToMinutes = (mmss: string): number => {
    const parts = mmss.split(':');
    if (parts.length !== 2) return 0;
    const mins = parseInt(parts[0]) || 0;
    const secs = parseInt(parts[1]) || 0;
    return Number((mins + secs / 60).toFixed(2));
  };

  // Load draft from state on mount
  useEffect(() => {
    if (draftKey && state.drafts && state.drafts[draftKey] && !hasLoadedDraft.current) {
      const draft = state.drafts[draftKey];
      if (draft.aiOutput) {
        setAiOutput(draft.aiOutput);
        toast.show('Loaded previous draft', 'info');
        hasLoadedDraft.current = true;
      }
    }
  }, [draftKey, state.drafts, toast]);

  const handlePaste = async () => {
    const text = await paste();
    if (text) {
      setAiOutput(text);
      toast.show('AI output pasted from clipboard', 'success');
    } else {
      toast.show('Clipboard is empty or contains non-text content', 'error');
    }
  };

  const handleNext = async () => {
    if (!aiOutput.trim()) {
      toast.show('Please paste the AI output to analyze.', 'error');
      return;
    }

    // Validate duration format
    const durationMinutes = mmssToMinutes(durationDisplay);
    if (durationMinutes <= 0) {
      toast.show('Please enter a valid duration (mm:ss format).', 'error');
      return;
    }

    if (!draftKey) {
      toast.show('Error: No draft key found. Please restart.', 'error');
      return;
    }

    // Update draft with AI output
    const updatedDraft = {
      ...(state.drafts?.[draftKey] || {}),
      type: gadgetType,
      aiOutput,
      transcript: aiOutput, // Use aiOutput as transcript for evaluation
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
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>Copy the task prompt below</li>
          <li>Paste it into your AI (ChatGPT, Claude, etc.)</li>
          <li>Copy the AI's output and paste it here</li>
          <li>We'll evaluate the output using 2 analyst models</li>
          <li>Get diagnosis card with quality metrics</li>
        </ol>
      </GlassCard>

      {/* Task Prompt */}
      <GlassCard className="p-4">
        <CopyableDetails
          title="📝 Task Prompt (copy this)"
          content={gadgetInfo.taskPrompt}
        />
      </GlassCard>

      {/* AI Output Input */}
      <GlassCard className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          🤖 Paste AI Output
        </h3>
        <div className="space-y-3">
          <textarea
            value={aiOutput}
            onChange={(e) => setAiOutput(e.target.value)}
            placeholder="Paste the AI's response here..."
            className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm resize-vertical"
          />
          <div className="flex justify-between items-center">
            <button
              onClick={handlePaste}
              className="btn-secondary text-sm"
            >
              📋 Paste from Clipboard
            </button>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {aiOutput.trim().split(/\s+/).filter(Boolean).length} words
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Duration Input */}
      <GlassCard className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          ⏱️ Duration (optional)
        </h3>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={durationDisplay}
            onChange={(e) => setDurationDisplay(e.target.value)}
            placeholder="10:00"
            className="w-24 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-center font-mono"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            (mm:ss format, used for Alignment Rate calculation)
          </span>
        </div>
      </GlassCard>

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary">
          ← Back
        </button>
        <button
          onClick={handleNext}
          className="btn-primary"
          disabled={!aiOutput.trim()}
        >
          Next: Analyst Evaluation →
        </button>
      </div>
    </div>
  );
};

export default GadgetTaskView;

