// Treatment Selector - Shows treatment gadgets in an accordion
// Users select between Meta-Evaluation, AI Infection Sanitization, and Pathologies Immunity Boost

import React, { useState } from 'react';
import { NotebookState, GadgetType } from '../../../types';
import GlassCard from '../../shared/GlassCard';
import { CopyableDetails } from '../../shared/CopyableDetails';
import { SANITIZE_TASK, IMMUNITY_BOOST_TASK } from '../../../lib/prompts';

interface TreatmentSelectorProps {
  state: NotebookState;
  onUpdate: (updates: Partial<NotebookState>) => void;
  onNavigateHome: () => void;
}

const TREATMENT_GADGETS: Array<{
  id: GadgetType;
  title: string;
  description: string;
  taskPrompt: string;
  icon: string;
}> = [
  {
    id: 'meta-evaluation',
    title: 'Meta-Evaluation',
    description: 'Evaluations of AI Evaluations for AI Safety',
    taskPrompt: '', // Handled specially with 3-pass prompts
    icon: '🔍'
  },
  {
    id: 'immunity-boost',
    title: 'Pathologies Immunity Boost',
    description: 'Enhance content quality across all 12 metrics',
    taskPrompt: IMMUNITY_BOOST_TASK,
    icon: '💊'
  },
  {
    id: 'sanitize',
    title: 'AI Infection Sanitization',
    description: 'Remove hidden patterns and normalize text safely',
    taskPrompt: SANITIZE_TASK,
    icon: '🦠'
  }
];

const TreatmentSelector: React.FC<TreatmentSelectorProps> = ({
  state,
  onUpdate,
  onNavigateHome
}) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const toggleStep = (step: number) => {
    setExpandedStep(expandedStep === step ? null : step);
  };

  const handleBackToMainSelector = () => {
    onUpdate({
      ui: {
        ...state.ui,
        gadgetView: 'selector'
      }
    });
  };

  return (
    <div className="w-full">
      {/* Back Link & Header */}
      <div className="px-3 pt-2.5 pb-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={handleBackToMainSelector}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            <span>←</span>
            <span>Back</span>
          </button>
          <h1 className="text-sm font-semibold text-gray-900 dark:text-white">
            Treatment
          </h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Two-step accordion */}
      <div className="px-4 py-3">
        <div className="space-y-3">
          {TREATMENT_GADGETS.map((gadget, index) => {
            const stepNumber = index + 1;
            const isExpanded = expandedStep === stepNumber;

            return (
              <GlassCard
                key={gadget.id}
                className={`transition-all duration-300 ${
                  isExpanded ? 'border-blue-500 border-2' : 'border-gray-200 dark:border-gray-700'
                }`}
                density="dense"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => toggleStep(stepNumber)}
                >
                  {/* Vertical layout: badge/icon row, then title, then description */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    {/* Left: Badge + Icon */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-bold transition-transform duration-300 hover:scale-110 ${
                        isExpanded ? 'bg-blue-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}>
                        <span className="text-base">{stepNumber}</span>
                      </div>
                      <div className="text-xl shrink-0">{gadget.icon}</div>
                    </div>
                    {/* Right: Arrow */}
                    <div className="flex items-start shrink-0 pt-0.5">
                      <span className="text-gray-400 text-xs">{isExpanded ? '▼' : '▶'}</span>
                    </div>
                  </div>
                  
                  {/* Title - full width */}
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight mb-1.5 pr-6">
                    {gadget.title}
                  </h3>
                  
                  {/* Description - full width */}
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight pr-6">
                    {gadget.description}
                  </p>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 space-y-3">
                    {gadget.id === 'meta-evaluation' ? (
                      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded p-2.5">
                        <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                          Meta-Evaluation uses a 3-pass pipeline workflow. Click the card to start the full workflow.
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdate({
                              ui: {
                                ...state.ui,
                                gadgetType: 'meta-evaluation',
                                gadgetView: 'accordion',
                                gadgetDraftKey: `gadget_meta-evaluation_${Date.now()}`
                              }
                            });
                          }}
                          className="btn-primary w-full text-xs"
                        >
                          Start Meta-Evaluation Workflow
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded p-2.5">
                          <ol className="list-decimal list-inside space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                            <li>Copy prompt</li>
                            <li>Paste into AI</li>
                            <li>Add your content</li>
                          </ol>
                        </div>

                        <div className="bg-gray-100 dark:bg-gray-800 rounded p-2.5">
                          <CopyableDetails
                            title="Prompt"
                            content={gadget.taskPrompt}
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TreatmentSelector;
