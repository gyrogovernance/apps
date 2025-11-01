// src/components/apps/GadgetsApp/GadgetAccordion.tsx

import React, { useState, useEffect, useRef } from 'react';
import { NotebookState, GadgetType, AnalystResponse } from '../../../types';
import { useToast } from '../../shared/Toast';
import { useConfirm } from '../../shared/Modal';
import GlassCard from '../../shared/GlassCard';
import { CopyableDetails } from '../../shared/CopyableDetails';
import AnalystEvaluationForm from '../../shared/AnalystEvaluationForm';
import { generateRapidTestAnalystPrompt, generateAnalystPrompt, generatePolicyGadgetAnalystPrompt } from '../../../lib/prompts';
import { generateInsightFromGadget } from '../../../lib/report-generator';
import { insights as insightsStorage } from '../../../lib/storage';
import { formatPathologyName } from '../../../lib/text-utils';
import { UNSPECIFIED_MODEL } from '../../../lib/model-list';
import { ModelSelect } from '../../shared/ModelSelect';
import { A_STAR } from '../../../lib/calculations';
import { GADGET_CONSTANTS } from '../../../lib/constants';
import StructuralIntegrityGauge from '../../shared/StructuralIntegrityGauge';
import { SmartTooltip } from '../../shared/SmartTooltip';
import ReactMarkdown from 'react-markdown';
import CoreMetricsRings from '../../shared/CoreMetricsRings';

interface GadgetAccordionProps {
  state: NotebookState;
  onUpdate: (updates: Partial<NotebookState>) => void;
  gadgetType: GadgetType;
  onNavigateHome: () => void;
}

import { GADGETS } from '../../../lib/gadgets';

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
  const gadgetInfo = GADGETS[gadgetType];
  const isAnalysisGadget = gadgetInfo.isAnalysis;
  const taskPrompt = gadgetInfo.taskPrompt;
  const analystPrompt = (gadgetType === 'rapid-test'
    ? generateRapidTestAnalystPrompt('custom')
    : (gadgetType === 'policy-audit' || gadgetType === 'policy-report')
      ? generatePolicyGadgetAnalystPrompt()
      : generateAnalystPrompt([''], 'custom'));
  const step1HeaderRef = useRef<HTMLDivElement | null>(null);
  const step2HeaderRef = useRef<HTMLDivElement | null>(null);
  
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
            durationMinutes: GADGET_CONSTANTS.DEFAULT_DURATION_MINUTES,
            timestamp: Date.now()
          }
        }
      });
    }
  }, [draftKey]);

  const draftData = state.drafts?.[draftKey] || {};
  const analyst1 = draftData.analyst1 as AnalystResponse | undefined;

  // Model name state (the model the user is testing/using, not an analyst model)
  const [modelName, setModelName] = useState(draftData.model_name || draftData.model_analyst1 || UNSPECIFIED_MODEL.value);

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
          durationMinutes: (typeof draftData.durationMinutes === 'number' && draftData.durationMinutes > 0)
            ? draftData.durationMinutes
            : GADGET_CONSTANTS.DEFAULT_DURATION_MINUTES
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

  // Scroll to Step 2 header when it expands (account for sticky header height)
  useEffect(() => {
    if (steps[2]?.expanded && step2HeaderRef.current) {
      const headerOffset = 72;
      const extraOffset = 8; // stop a bit higher to align with previous card end
      const container = (document.querySelector('.overflow-y-auto') as HTMLElement) || null;
      
      // Wait for collapse/expand animations to settle
      setTimeout(() => {
        if (!step2HeaderRef.current) return;
        const headerRect = step2HeaderRef.current.getBoundingClientRect();
        
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const target = headerRect.top - containerRect.top + container.scrollTop - headerOffset - extraOffset;
          container.scrollTo({ top: target, behavior: 'smooth' });
        } else {
          const y = headerRect.top + window.scrollY - headerOffset - extraOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [steps[2]?.expanded]);

  const handleSaveAsInsight = async () => {
    if (!insight) return;
    
    // Check if model is unspecified
    const modelName = draftData.model_analyst1 || UNSPECIFIED_MODEL.value;
    const isUnspecified = !modelName || modelName === UNSPECIFIED_MODEL.value || modelName.trim() === '';
    
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

  const handleNew = () => {
    const newDraftKey = `gadget_${Date.now()}`;
    setSteps({
      1: { expanded: true, completed: false },
      2: { expanded: false, completed: false }
    });
    setModelName(UNSPECIFIED_MODEL.value);
    onUpdate({
      ui: {
        ...state.ui,
        gadgetDraftKey: newDraftKey
      },
      drafts: {
        ...state.drafts || {},
        [newDraftKey]: {
          type: gadgetType,
          durationMinutes: 0,
          timestamp: Date.now()
        }
      }
    });
    // Scroll to Step 1 after reset
    setTimeout(() => {
      if (step1HeaderRef.current) {
        const headerOffset = 72;
        const container = (document.querySelector('.overflow-y-auto') as HTMLElement) || null;
        const headerRect = step1HeaderRef.current.getBoundingClientRect();
        
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const target = headerRect.top - containerRect.top + container.scrollTop - headerOffset;
          container.scrollTo({ top: target, behavior: 'smooth' });
        } else {
          const y = headerRect.top + window.scrollY - headerOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }
    }, 100);
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
                ref={step1HeaderRef}
                className="flex items-center justify-between cursor-pointer py-3"
                onClick={() => toggleStep(1)}
                tabIndex={-1}
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
                      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded p-4 space-y-3 mb-3">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                          {gadgetType === 'rapid-test' ? 'Rapid Test Analysis' : 'Gadget Workflow'}
                        </p>
                        {gadgetType === 'rapid-test' ? (
                          <div className="space-y-3 text-xs text-gray-700 dark:text-gray-300">
                            <div className="font-semibold mb-1">Step 1: Analysis</div>
                            <div className="flex items-start space-x-2">
                              <span className="font-medium">1.</span>
                              <span>
                                <strong>Prepare:</strong> Complete a 3-6 turn conversation with your AI assistant on any topic
                              </span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <span className="font-medium">2.</span>
                              <span>
                                <strong>Analyze:</strong> Copy the Analysis prompt below and submit it to your AI assistant
                              </span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <span className="font-medium">3.</span>
                              <span>
                                <strong>Process:</strong> Paste the JSON response here to compute behavioral balance and quality metrics
                              </span>
                            </div>
                            
                            <div className="font-semibold mt-3 mb-1">Step 2: Results</div>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                              You get three immediate benefits:
                            </p>
                            <ul className="list-disc ml-5 text-xs text-gray-700 dark:text-gray-300 space-y-1 mt-1">
                              <li>Comprehensive pathology diagnosis detecting issues like hallucination, sycophancy, and reasoning drift</li>
                              <li>Three key performance metrics: Quality Index, Alignment Rate, and Superintelligence Index</li>
                              <li>Actionable recommendations with specific next steps to improve your AI's performance</li>
                            </ul>
                            
                            <div className="text-xs italic text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 p-2 rounded mt-2">
                              Save multiple evaluations to your Insights Library for tracking and comparison over time.
                            </div>

                            {/* Tip at end */}
                            <div className="text-xs italic text-gray-600 dark:text-gray-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 p-2 rounded mt-2">
                              Tip: Use different AI models for task generation vs. analysis to reduce bias.
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3 text-xs text-gray-700 dark:text-gray-300">
                            <div className="font-semibold mb-1">Step 1: Analysis</div>
                            <div className="flex items-start space-x-2">
                              <span className="font-medium">1.</span>
                              <span>
                                <strong>Generate output:</strong> Copy the Task prompt and submit it to your AI assistant together with the Text or Document you want to audit.
                              </span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <span className="font-medium">2.</span>
                              <span>
                                <strong>Evaluate quality:</strong> Copy the Analysis prompt below, paste it into the same AI chat, then copy the JSON response you'll receive and paste it into the evaluation form below
                              </span>
                            </div>
                            
                            {/* Standard Step 2 for all gadgets */}
                            <div className="font-semibold mt-3 mb-1">Step 2: Results</div>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                              You get three immediate benefits:
                            </p>
                            <ul className="list-disc ml-5 text-xs text-gray-700 dark:text-gray-300 space-y-1 mt-1">
                              <li>Comprehensive pathology diagnosis detecting issues like hallucination, sycophancy, and reasoning drift</li>
                              <li>Three key performance metrics: Quality Index, Alignment Rate, and Superintelligence Index</li>
                              <li>Actionable recommendations with specific next steps to improve your AI's performance</li>
                            </ul>
                            
                            <div className="text-xs italic text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 p-2 rounded mt-2">
                              Save multiple evaluations to your Insights Library for tracking and comparison over time.
                            </div>

                            {/* Tip at end (no emoji) */}
                            <div className="text-xs italic text-gray-600 dark:text-gray-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 p-2 rounded mt-2">
                              Tip: Use different AI models for task generation vs. analysis to reduce bias.
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      {gadgetType !== 'rapid-test' && (
                        <div className="border-2 border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg overflow-hidden">
                          <CopyableDetails
                            title="Task"
                            content={taskPrompt}
                            defaultOpen={!quickMode}
                          />
                        </div>
                      )}
                      
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
                ref={step2HeaderRef}
                className="flex items-center justify-between py-3 cursor-pointer"
                tabIndex={-1}
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

              {steps[2].expanded && insight && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4" style={{ overflowAnchor: 'none' as any }}>
                  
                  {/* Alignment Rate Gauge (top emphasis) */}
                  <div className="flex flex-col items-center gap-2">
                    <StructuralIntegrityGauge 
                      si={isNaN(insight.quality.superintelligence_index) ? null : insight.quality.superintelligence_index} 
                      size="md" 
                      centerLabel={insight.quality.alignment_rate_category}
                      arCategory={insight.quality.alignment_rate_category}
                    />
                    <SmartTooltip term="AR" definition={(
                      <div>
                        <div className="font-semibold mb-1.5">Alignment Rate</div>
                        <div className="text-gray-300 text-xs space-y-1 leading-relaxed">
                          <div>Quality-per-minute of the evaluation process.</div>
                          <div><strong>Categories</strong>: VALID 0.03–0.15/min, SUPERFICIAL &gt; 0.15/min, SLOW &lt; 0.03/min</div>
                          <div>Set an accurate duration to avoid misclassification.</div>
                        </div>
                      </div>
                    )}>
                      <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-bold flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">i</span>
                    </SmartTooltip>
                  </div>

                  {/* Core Metrics */}
                  <div className="p-3 rounded border border-purple-500 bg-purple-50 dark:bg-purple-900/20">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Core Metrics</h3>
                    <CoreMetricsRings 
                      qi={insight.quality.quality_index}
                      si={isNaN(insight.quality.superintelligence_index) ? null : insight.quality.superintelligence_index}
                      arCategory={insight.quality.alignment_rate_category}
                      arRate={insight.quality.alignment_rate}
                      size="sm"
                    />
                  </div>

                  {/* Pathologies if detected */}
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

                  {/* Analysis Insights with Recommendations */}
                  <div className="p-3 rounded border border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Analysis & Recommendations</h3>
                    <div className="text-sm text-gray-700 dark:text-gray-300 max-w-none">
                      <ReactMarkdown
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2" {...props} />, 
                          h2: ({node, ...props}) => <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-3 mb-2" {...props} />, 
                          h3: ({node, ...props}) => <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-2 mb-1" {...props} />, 
                          p: ({node, ...props}) => <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2" {...props} />, 
                          ul: ({node, ...props}) => <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-2 space-y-1" {...props} />, 
                          ol: ({node, ...props}) => <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-2 space-y-1" {...props} />, 
                          li: ({node, ...props}) => <li className="text-gray-700 dark:text-gray-300" {...props} />, 
                          strong: ({node, ...props}) => <strong className="font-semibold text-gray-900 dark:text-gray-100" {...props} />, 
                          em: ({node, ...props}) => <em className="italic text-gray-800 dark:text-gray-200" {...props} />, 
                          code: ({node, inline, ...props}: any) => inline 
                            ? <code className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded text-xs font-mono" {...props} />
                            : <code className="block p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded text-xs font-mono overflow-x-auto" {...props} />,
                          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-green-400 dark:border-green-600 pl-4 italic text-gray-700 dark:text-gray-300 my-2" {...props} />,
                        }}
                      >
                        {insight.insights.combined_markdown || insight.insights.summary}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* View Full Analysis (saves then opens detail) */}
                  <div className="p-3 rounded border border-green-500 bg-green-50 dark:bg-green-900/20 space-y-2">
                    <button
                      onClick={async () => {
                        if (!insight) return;
                        try {
                          await insightsStorage.save(insight);
                          // Navigate and request opening detail for this insight
                          onUpdate({
                            ui: {
                              ...state.ui,
                              currentApp: 'insights',
                              insightsView: 'detail',
                              pendingInsightId: insight.id
                            }
                          });
                        } catch (error) {
                          console.error('Failed to save insight:', error);
                          toast.show('Failed to save insight', 'error');
                        }
                      }}
                      className="btn-primary w-full text-sm"
                    >
                      📊 View Full Analysis
                    </button>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between pt-2 gap-3">
                    <button onClick={onNavigateHome} className="btn-secondary flex-1">
                      ← Home
                    </button>
                    <button 
                      onClick={handleNew}
                      className="btn-primary flex-1"
                    >
                      🔄 New
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
