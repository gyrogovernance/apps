// src/components/apps/GadgetsApp/GadgetAccordion.tsx

import React, { useState, useEffect } from 'react';
import { NotebookState, GadgetType, AnalystResponse } from '../../../types';
import { useToast } from '../../shared/Toast';
import { useConfirm } from '../../shared/Modal';
import GlassCard from '../../shared/GlassCard';
import { CopyableDetails } from '../../shared/CopyableDetails';
import { POLICY_AUDIT_TASK, POLICY_REPORT_TASK, SANITIZE_TASK, IMMUNITY_BOOST_TASK } from '../../../lib/prompts';
import AnalystEvaluationForm from '../../shared/AnalystEvaluationForm';
import { generateDetectorAnalystPrompt, generateAnalystPrompt } from '../../../lib/prompts';
import { generateInsightFromGadget } from '../../../lib/report-generator';
import { insights as insightsStorage } from '../../../lib/storage';
import { formatPathologyName } from '../../../lib/text-utils';
import TruthSpectrumGauge from '../DetectorApp/TruthSpectrumGauge';
import { UNSPECIFIED_MODEL } from '../../../lib/model-list';
import { ModelSelect } from '../../shared/ModelSelect';
import { calculateDeceptionRiskScore, A_STAR } from '../../../lib/calculations';

interface GadgetAccordionProps {
  state: NotebookState;
  onUpdate: (updates: Partial<NotebookState>) => void;
  gadgetType: GadgetType;
  onNavigateHome: () => void;
}

const GADGET_INFO: Record<GadgetType, { title: string; description: string; taskPrompt: string; icon: string; isAnalysis: boolean }> = {
  'detector': {
    title: 'Detector',
    icon: '🔍',
    description: 'Rapid deception analysis of AI conversations',
    taskPrompt: 'Paste your AI conversation transcript below for analysis.',
    isAnalysis: true
  },
  'policy-audit': {
    title: 'Policy Auditing',
    icon: '📊',
    description: 'Extract claims & evidence from documents',
    taskPrompt: POLICY_AUDIT_TASK,
    isAnalysis: true
  },
  'policy-report': {
    title: 'Policy Reporting',
    icon: '📋',
    description: 'Create executive synthesis with attribution',
    taskPrompt: POLICY_REPORT_TASK,
    isAnalysis: true
  },
  'sanitize': {
    title: 'AI Infections Sanitization',
    icon: '🦠',
    description: 'Remove hidden patterns and normalize text',
    taskPrompt: SANITIZE_TASK,
    isAnalysis: false
  },
  'immunity-boost': {
    title: 'Pathologies Immunity Boost',
    icon: '💊',
    description: 'Enhance content quality across 12 metrics',
    taskPrompt: IMMUNITY_BOOST_TASK,
    isAnalysis: false
  }
};

interface StepState {
  expanded: boolean;
  completed: boolean;
}

const stepThemes = {
  1: { badgeClass: 'bg-blue-500', borderClass: 'border-blue-500' },
  2: { badgeClass: 'bg-green-500', borderClass: 'border-green-500' }
};

const GadgetAccordion: React.FC<GadgetAccordionProps> = ({
  state,
  onUpdate,
  gadgetType,
  onNavigateHome
}) => {
  const toast = useToast();
  const { confirm, ConfirmModal } = useConfirm();
  const gadgetInfo = GADGET_INFO[gadgetType];
  const isAnalysisGadget = gadgetInfo.isAnalysis;
  const taskPrompt = gadgetType === 'detector' ? generateDetectorAnalystPrompt('custom') : gadgetInfo.taskPrompt;
  const analystPrompt = gadgetType === 'detector' 
    ? generateDetectorAnalystPrompt('custom')
    : generateAnalystPrompt([''], 'custom');
  const totalSteps = isAnalysisGadget ? 2 : 1;
  
  const [steps, setSteps] = useState<Record<number, StepState>>({
    1: { expanded: true, completed: false },
    2: { expanded: false, completed: false }
  });

  const draftKey = state.ui.gadgetDraftKey || `gadget_${Date.now()}`;
  
  useEffect(() => {
    if (!state.drafts?.[draftKey]) {
      onUpdate({
        ui: {
          ...state.ui,
          gadgetDraftKey: draftKey
        },
        drafts: {
          ...state.drafts || {},
          [draftKey]: {
            type: gadgetType,
            durationMinutes: 0,
            timestamp: Date.now()
          }
        }
      });
    }
  }, [draftKey]);

  const draftData = state.drafts?.[draftKey] || {};
  const analyst1 = draftData.analyst1 as AnalystResponse | undefined;

  // Model name state (the model the user is testing/using, not an analyst model)
  const [modelName, setModelName] = useState(draftData.model_name || draftData.model_analyst1 || 'Unspecified');

  // Quick/Guided mode (from persisted state)
  const quickMode = state.ui.gadgetsQuickMode ?? true;

  // Persist model name to draft whenever it changes (use model_name for gadgets)
  useEffect(() => {
    onUpdate({
      drafts: {
        ...state.drafts || {},
        [draftKey]: { 
          ...draftData, 
          model_name: modelName, 
          model_analyst1: modelName,
          durationMinutes: draftData.durationMinutes || 1 // Default 1 minute for SI calculation
        }
      }
    });
  }, [modelName, draftKey]);

  useEffect(() => {
    if (isAnalysisGadget) {
      const hasAnalyst1 = !!analyst1;
      setSteps(prev => ({
        1: { ...prev[1], completed: hasAnalyst1 },
        2: { ...prev[2], completed: hasAnalyst1 }
      }));
    } else {
      setSteps(prev => ({
        1: { ...prev[1], completed: prev[1].completed },
        2: { ...prev[2], completed: false }
      }));
    }
  }, [analyst1, isAnalysisGadget]);

  const toggleStep = (stepNumber: number) => {
    setSteps(prev => ({
      ...prev,
      [stepNumber]: { ...prev[stepNumber], expanded: !prev[stepNumber].expanded }
    }));
  };

  const handleTreatmentComplete = () => {
    setSteps(prev => ({
      ...prev,
      1: { ...prev[1], completed: true, expanded: true }
    }));
  };

  const handleAnalystComplete = async (evaluation: AnalystResponse, _modelName: string) => {
    // Use the top-level modelName state (the model being tested, not analyst)
    const updatedDraft = {
      ...draftData,
      analyst1: evaluation,
      model_name: modelName,
      model_analyst1: modelName // Keep for backward compatibility with insight generation
    };

    onUpdate({
      drafts: {
        ...state.drafts || {},
        [draftKey]: updatedDraft
      }
    });

    setSteps(prev => ({
      ...prev,
      1: { ...prev[1], completed: true, expanded: false },
      2: { ...prev[2], expanded: true }
    }));
  };

  const insight = (isAnalysisGadget && analyst1) ? generateInsightFromGadget(
    draftData,
    gadgetType,
    gadgetInfo.title
  ) : null;

  const handleSaveAsInsight = async () => {
    if (!insight) return;
    
    // Check if model is unspecified
    const modelName = draftData.model_analyst1 || 'Unspecified';
    const isUnspecified = !modelName || modelName === 'Unspecified' || modelName.trim() === '';
    
    if (isUnspecified) {
      const confirmed = await confirm(
        'Unspecified Model',
        'This insight will be saved with an unspecified model name. Do you want to continue?',
        {
          confirmText: 'Save Anyway',
          cancelText: 'Go Back'
        }
      );
      
      if (!confirmed) {
        return;
      }
    }
    
    try {
      await insightsStorage.save(insight);
      toast.show('Saved to Insights library', 'success');
    } catch (error) {
      console.error('Failed to save insight:', error);
      toast.show('Failed to save insight', 'error');
    }
  };

  const drs = insight ? calculateDeceptionRiskScore(
    {
      superintelligence_index: insight.quality.superintelligence_index,
      si_deviation: insight.quality.si_deviation,
      aperture: insight.quality.aperture ?? A_STAR  // Use stored value from calculation
    },
    {
      behavior: insight.quality.behavior_scores,
      pathologies: insight.quality.pathologies.detected
    }
  ) : null;

  const handleBackToSelector = () => {
    onUpdate({
      ui: {
        ...state.ui,
        gadgetView: 'selector',
        gadgetType: undefined,
        gadgetDraftKey: undefined
      }
    });
  };

  return (
    <div className="w-full">
      {/* Back Link */}
      <div className="px-3 pt-3 pb-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <button
          onClick={handleBackToSelector}
          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
        >
          <span>←</span>
          <span>Back to Gadgets Selection</span>
        </button>
      </div>

      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            {gadgetInfo.icon} {gadgetInfo.title}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        <div className="px-6 pt-4 space-y-4 pb-6">
          
          {/* ANALYSIS GADGETS: Step 1 = Combined Task + Evaluation */}
          {isAnalysisGadget && (
            <GlassCard className={`transition-all duration-300 ${steps[1].expanded ? stepThemes[1].borderClass + ' border-2' : 'border-gray-200 dark:border-gray-700'}`}>
              <div
                className="flex items-center justify-between cursor-pointer py-3"
                onClick={() => toggleStep(1)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold transition-transform duration-300 hover:scale-110 ${
                    steps[1].completed 
                      ? 'bg-green-500 text-white' 
                      : stepThemes[1].badgeClass + ' text-white'
                  }`}>
                    {steps[1].completed ? '✓' : '1'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Analysis</h3>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {steps[1].completed && (
                    <span className="text-green-600 dark:text-green-400 text-sm whitespace-nowrap">Complete</span>
                  )}
                  <span className="text-gray-400 shrink-0">{steps[1].expanded ? '▼' : '▶'}</span>
                </div>
              </div>

              {steps[1].expanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-5">
                  {/* Setup Section */}
                  <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Setup</h4>
                    <div className="space-y-3">
                      {/* Model Selection */}
                      <ModelSelect
                        value={modelName}
                        onChange={setModelName}
                        id="gadget-model-select"
                        label="Your AI Model"
                        helperText={quickMode ? undefined : "The AI model you're using (e.g., ChatGPT, Claude, Gemini)"}
                        required={false}
                      />
                      
                      {/* Mode Toggle */}
                      <div className="flex items-center justify-between gap-3">
                        <label className="text-sm font-medium text-gray-900 dark:text-white">Workflow</label>
                        <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 p-0.5 bg-gray-100 dark:bg-gray-800">
                          <button
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                              quickMode
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                            onClick={() => onUpdate({ ui: { ...state.ui, gadgetsQuickMode: true } })}
                            title="Hide step-by-step instructions"
                          >
                            ⚡ Quick
                          </button>
                          <button
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                              !quickMode
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                            onClick={() => onUpdate({ ui: { ...state.ui, gadgetsQuickMode: false } })}
                            title="Show step-by-step instructions"
                          >
                            📋 Guided
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Prompts Section */}
                  <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Prompts</h4>
                    
                    {/* Guided Mode: Step-by-step instructions */}
                    {!quickMode && (
                      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded p-4 space-y-2 mb-3">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Quick Guide:</p>
                        <ol className="list-decimal list-inside space-y-1 text-xs text-gray-700 dark:text-gray-300">
                          <li>Copy Task prompt → Run in your AI</li>
                          <li>Copy Analysis prompt → Run with AI's output</li>
                          <li>Paste JSON response in Evaluation below</li>
                        </ol>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <div className="border-2 border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg overflow-hidden">
                        <CopyableDetails
                          title="Task"
                          content={taskPrompt}
                          defaultOpen={!quickMode}
                        />
                      </div>
                      
                      <div className="border-2 border-purple-500 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg overflow-hidden">
                        <CopyableDetails
                          title="Analysis"
                          content={analystPrompt}
                          defaultOpen={false}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Evaluation Section */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Evaluation</h4>
                    <AnalystEvaluationForm
                      transcript=""
                      challengeType="custom"
                      onComplete={handleAnalystComplete}
                      mode="detector"
                      sessionId={`gadget::${draftKey}`}
                      draftKey={`${draftKey}::analyst_1`}
                      existingEvaluation={analyst1}
                      className=""
                      hideModelInput={true}
                      hideGuide={true}
                      hidePromptSection={true}
                      defaultPromptOpen={false}
                      defaultModelName={modelName}
                    />
                  </div>
                </div>
              )}
            </GlassCard>
          )}

          {/* TREATMENT GADGETS: Step 1 = Just Task */}
          {!isAnalysisGadget && (
            <GlassCard className={`transition-all duration-300 ${steps[1].expanded ? stepThemes[1].borderClass + ' border-2' : 'border-gray-200 dark:border-gray-700'}`}>
              <div
                className="flex items-center justify-between cursor-pointer py-3"
                onClick={() => toggleStep(1)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold transition-transform duration-300 hover:scale-110 ${
                    steps[1].completed 
                      ? 'bg-green-500 text-white' 
                      : stepThemes[1].badgeClass + ' text-white'
                  }`}>
                    {steps[1].completed ? '✓' : '1'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Task</h3>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {steps[1].completed && (
                    <span className="text-green-600 dark:text-green-400 text-sm whitespace-nowrap">Complete</span>
                  )}
                  <span className="text-gray-400 shrink-0">{steps[1].expanded ? '▼' : '▶'}</span>
                </div>
              </div>

              {steps[1].expanded && !steps[1].completed && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                  {/* Instructions */}
                  <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded p-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Procedure:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      <li>Copy the task prompt below</li>
                      <li>Submit it to your AI assistant</li>
                      <li>Use the improved output (no analysis needed)</li>
                    </ol>
                  </div>
                  
                  {/* Task Prompt */}
                  <CopyableDetails
                    title="Task Prompt"
                    content={taskPrompt}
                    defaultOpen={true}
                  />

                  <button
                    onClick={handleTreatmentComplete}
                    className="btn-primary w-full"
                  >
                    Complete
                  </button>
                </div>
              )}

              {/* Treatment Completion Card */}
              {steps[1].completed && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="text-center space-y-4">
                    <div className="text-6xl">✅</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Treatment Complete</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Use the improved output from your AI assistant.
                    </p>
                    <div className="flex justify-between pt-4 gap-3">
                      <button onClick={onNavigateHome} className="btn-secondary flex-1">
                        ← Home
                      </button>
                      <button 
                        onClick={handleBackToSelector}
                        className="btn-primary flex-1"
                      >
                        🔄 New Gadget
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </GlassCard>
          )}

          {/* Step 2: Results (Analysis Gadgets Only) */}
          {isAnalysisGadget && (
            <GlassCard className={`transition-all duration-300 ${steps[2].expanded ? stepThemes[2].borderClass + ' border-2' : 'border-gray-200 dark:border-gray-700'}`}>
              <div
                className="flex items-center justify-between py-3 cursor-pointer"
                onClick={() => toggleStep(2)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold ${stepThemes[2].badgeClass} text-white transition-all duration-300 hover:scale-110`}>
                    2
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Results</h3>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-gray-400 shrink-0">{steps[2].expanded ? '▼' : '▶'}</span>
                </div>
              </div>

              {steps[2].expanded && insight && drs && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">

                  <div className="text-center mb-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Risk: <span className="font-semibold text-red-600 dark:text-red-400">{drs.category}</span> •
                      QI <span className="font-semibold text-gray-900 dark:text-white">{insight.quality.quality_index.toFixed(1)}%</span> •
                      SI <span className="font-semibold text-gray-900 dark:text-white">{insight.quality.superintelligence_index.toFixed(3)}</span>
                    </div>
                  </div>

                  <div className="flex justify-center mb-2">
                    <TruthSpectrumGauge drs={drs} size="sm" />
                  </div>

                  <div className="p-3 rounded border border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {insight.insights.summary}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Risk</p>
                        <p className="text-lg font-bold text-red-600 dark:text-red-400">{drs.category}</p>
                      </div>
                    </div>
                  </div>
                  
                  {insight.quality.pathologies.detected.length > 0 && (
                    <div className="p-3 rounded border border-red-500 bg-red-50 dark:bg-red-900/20">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Detected Pathologies</h3>
                      <ul className="space-y-1">
                        {insight.quality.pathologies.detected.map((p, i) => (
                          <li key={i} className="text-sm text-gray-700 dark:text-gray-300">
                            • {formatPathologyName(p)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="p-3 rounded border border-purple-500 bg-purple-50 dark:bg-purple-900/20">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Metrics</h3>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">SI</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{insight.quality.superintelligence_index.toFixed(3)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">SI Dev</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{insight.quality.si_deviation.toFixed(3)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Aperture</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{(insight.quality.aperture ?? A_STAR).toFixed(5)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded border border-green-500 bg-green-50 dark:bg-green-900/20">
                    <button
                      onClick={handleSaveAsInsight}
                      className="btn-primary w-full text-sm"
                    >
                      💾 Save to Insights
                    </button>
                  </div>

                  <div className="flex justify-between pt-2 gap-3">
                    <button onClick={onNavigateHome} className="btn-secondary flex-1">
                      ← Home
                    </button>
                    <button 
                      onClick={handleBackToSelector}
                      className="btn-primary flex-1"
                    >
                      🔄 New Gadget
                    </button>
                  </div>
                </div>
              )}
            </GlassCard>
          )}

        </div>
      </div>
      {ConfirmModal}
    </div>
  );
};

export default GadgetAccordion;