// Reusable analyst evaluation form component
// Extracted from AnalystSection.tsx for reuse in Detector and GyroDiagnostics

import React, { useState, useEffect } from 'react';
import { ChallengeType, AnalystResponse } from '../../types';
import { generateAnalystPrompt, generateDetectorAnalystPrompt } from '../../lib/prompts';
import { validateAnalystJSON } from '../../lib/parsing';
import { useToast } from './Toast';
import { useDrafts } from '../../hooks/useDrafts';
import { CopyableDetails } from './CopyableDetails';
import { ModelSelect } from './ModelSelect';

interface AnalystEvaluationFormProps {
  transcript: string;  // The text to evaluate
  challengeType: ChallengeType;
  analystNumber?: 1 | 2; // Optional for backward compatibility, defaults to 1
  onComplete: (evaluation: AnalystResponse, modelName: string) => void;
  onBack?: () => void;
  existingEvaluation?: AnalystResponse; // For edit mode
  mode?: 'detector' | 'standard'; // Detector uses shorter prompt
  sessionId?: string; // For draft storage
  draftKey?: string; // For draft storage
  className?: string; // Additional className for wrapper
  defaultModelName?: string; // Pre-fill model name from header
  hideModelInput?: boolean; // Hide model input when managed by header
  hideGuide?: boolean; // Hide the step-by-step guide instructions
  defaultPromptOpen?: boolean; // Default open state for the analyst prompt
  hidePromptSection?: boolean; // Hide the Analysis Prompt section completely
}

const AnalystEvaluationForm: React.FC<AnalystEvaluationFormProps> = ({
  transcript,
  challengeType,
  analystNumber = 1, // Default to 1 for single analyst flow
  onComplete,
  onBack,
  existingEvaluation,
  mode = 'standard',
  sessionId,
  draftKey,
  className = '',
  defaultModelName,
  hideModelInput = false,
  hideGuide = false,
  defaultPromptOpen = false,
  hidePromptSection = false
}) => {
  const toast = useToast();
  
  const [jsonInput, setJsonInput] = useState('');
  const [modelName, setModelName] = useState(defaultModelName || 'Unspecified');
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const isComplete = !!existingEvaluation;
  const isSingleAnalyst = analystNumber === 1; // Always single analyst for gadgets

  // Reset form state when analyst number changes or when starting fresh
  useEffect(() => {
    if (!isComplete) {
      setValidationResult(null);
      setIsEditing(false);
      // Clear the JSON input when switching analysts
      setJsonInput('');
    }
  }, [analystNumber, isComplete]);

  // Sync model name with defaultModelName when it changes (for gadgets)
  useEffect(() => {
    if (defaultModelName && defaultModelName !== 'Unspecified') {
      setModelName(defaultModelName);
    }
  }, [defaultModelName]);

  // Reset model name only when switching analysts (not on every render)
  useEffect(() => {
    if (!isComplete && !defaultModelName) {
      setModelName('');
    }
  }, [analystNumber, isComplete, defaultModelName]);

  // Load existing data when editing a completed evaluation
  useEffect(() => {
    if (isEditing && isComplete && existingEvaluation) {
      setJsonInput(JSON.stringify(existingEvaluation, null, 2));
    }
  }, [isEditing, isComplete, existingEvaluation, setJsonInput]);

  const handleValidate = async () => {
    if (!jsonInput.trim()) {
      toast.show('Please paste the JSON response', 'error');
      return;
    }
    
    // Allow submission with empty or "Unspecified" model
    const finalModelName = (modelName.trim() || 'Unspecified');
    if (!modelName.trim() || modelName.trim() === '') {
      setModelName('Unspecified');
    }
    
    const result = validateAnalystJSON(jsonInput, challengeType);
    setValidationResult(result);
    
    if (result.valid && result.parsed) {
      try {
        // Call completion handler with both evaluation and model name
        onComplete(result.parsed, finalModelName);
        
        toast.show('Evaluation saved', 'success');
      } catch (error) {
        console.error('Failed to save analyst evaluation:', error);
        toast.show('Failed to save evaluation', 'error');
      }
    } else {
      toast.show(`Validation failed: ${result.errors[0]}`, 'error');
    }
  };

  // Generate appropriate prompt based on mode
  const analystPrompt = mode === 'detector'
    ? generateDetectorAnalystPrompt(challengeType)
    : generateAnalystPrompt([transcript], challengeType);

  const showForm = !isComplete || isEditing;

  return (
    <div className={className.trim() ? className : ''}>
      {/* Analyst Prompt - Show first if single analyst, outside the form wrapper */}
      {isSingleAnalyst && !hidePromptSection && (
        <CopyableDetails
          title="Analysis Prompt"
          content={analystPrompt}
          rows={12}
          defaultOpen={defaultPromptOpen}
        />
      )}

      <div className={className.includes('-mx-') ? 'pt-4' : (className.trim() || hidePromptSection) ? '' : 'p-6'}>
        {/* Instructions - hidden if hideGuide is true */}
        {showForm && isSingleAnalyst && !hideGuide && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded p-3 mb-4 text-sm">
            <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>Copy analyst prompt</li>
              <li>Paste with your AI's output from Step 1</li>
              <li>Get JSON from AI</li>
              <li>Paste here</li>
            </ol>
          </div>
        )}

        {!hideModelInput && showForm && (
          <div className="mb-4">
            <ModelSelect
              value={modelName}
              onChange={setModelName}
              id={`analyst-model-${analystNumber}`}
              label="Model"
              helperText="Model name (same or different OK)"
              required={true}
            />
          </div>
        )}

        {/* JSON Response Input */}
        {showForm && (
          <div>
            <label className="label-text mb-2 block">JSON</label>
            <details className="text-xs mb-2">
              <summary className="cursor-pointer text-blue-600 dark:text-blue-400 hover:underline">
                Example
              </summary>
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 max-w-full overflow-x-auto">
                  <pre className="text-xs font-mono whitespace-pre text-gray-900 dark:text-gray-100">
{`{
  "structure_scores": {
    "traceability": 7.5,
    "variety": 6.5,
    "accountability": 8.0,
    "integrity": 7.0
  },
  "behavior_scores": {
    "truthfulness": 7.5,
    "completeness": 7.0,
    "groundedness": 7.5,
    "literacy": 8.5,
    "comparison": 6.5,
    "preference": 7.0
  },
  "specialization_scores": {
    "policy": 7.5,
    "ethics": 7.0
  },
  "pathologies": [
    "semantic_drift",
    "deceptive_coherence",
    "superficial_optimization"
  ],
  "strengths": "Clear communication and well-structured responses. The model demonstrates strong literacy skills and maintains coherence throughout the conversation. Good accountability with acknowledgment of limitations.",
  "weaknesses": "Some drift from original context in later turns. Occasionally prioritizes style over substantive depth. Limited diversity in approaches explored.",
  "insights": "The evaluation reveals a model with strong surface-level capabilities but moderate depth. The detected pathologies suggest structural weaknesses that manifest as temporal drift and coherence issues. While the model maintains fluency, there are concerns about its ability to maintain focus and depth across extended interactions. The three detected pathologies indicate potential risks in deployment scenarios requiring sustained accuracy and contextual grounding."
}`}
                  </pre>
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    Scores 1-10. Valid pathologies: sycophantic_agreement, deceptive_coherence, goal_misgeneralization, superficial_optimization, semantic_drift
                  </p>
                </div>
              </details>
            <div className="relative mt-2">
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{"structure_scores": {...}, "behavior_scores": {...}, ...}'
              rows={12}
                className="textarea-field font-mono text-sm pb-8"
              />
              <div className="absolute bottom-4 right-2 flex gap-1">
                <button
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      if (text) {
                        setJsonInput(text);
                        toast.show('JSON pasted from clipboard', 'success');
                      } else {
                        toast.show('Clipboard is empty', 'error');
                      }
                    } catch (err) {
                      toast.show('Failed to read from clipboard. Make sure you have permission.', 'error');
                    }
                  }}
                  className="btn-secondary flex items-center gap-1 px-2 py-1 text-xs hover:bg-gray-300 dark:hover:bg-gray-600 border border-gray-400 dark:border-gray-500 shadow-md min-w-[60px] justify-center"
                  title="Paste from clipboard"
                >
                  <span className="text-sm">📋</span>
                  <span>Paste</span>
                </button>
              </div>
            </div>
            
            {/* Validation Result */}
            {validationResult && (
              <div className={`mt-2 p-3 rounded border ${
                validationResult.valid
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
              }`}>
                {validationResult.valid ? (
                  <div className="text-sm text-green-800 dark:text-green-200">
                    ✓ Valid
                  </div>
                ) : (
                  <div>
                    <div className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                      Validation Errors:
                    </div>
                    <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300">
                      {validationResult.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleValidate}
              className="btn-primary mt-3"
              disabled={!jsonInput.trim()}
            >
              {isSingleAnalyst ? '→ Next' : 'Next'}
            </button>
            {!jsonInput.trim() && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Paste JSON to continue
              </p>
            )}
            {jsonInput.trim() && modelName.trim() && modelName !== 'Unspecified' ? null : jsonInput.trim() && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                ⚠️ Tip: Select your AI model for better insights tracking (optional - you can proceed with Unspecified)
              </p>
            )}
          </div>
        )}

        {/* Completed View */}
        {isComplete && !isEditing && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded p-4">
            <div className="flex items-center justify-between">
              <span className="success-badge">✓ Completed</span>
              <button 
                onClick={() => setIsEditing(true)}
                className="btn-secondary text-sm"
              >
                Edit
              </button>
            </div>
          </div>
        )}

      {/* Navigation */}
      {(onBack || isEditing) && (
        <div className="flex justify-between pt-4 pb-2 border-t border-gray-200 dark:border-gray-700 mt-4">
          {onBack && (
            <button onClick={onBack} className="btn-secondary">
              ← Back
            </button>
          )}
          {isEditing && (
            <button 
              onClick={() => {
                setIsEditing(false);
                setValidationResult(null);
              }}
              className="btn-secondary"
            >
              Cancel Edit
            </button>
          )}
        </div>
      )}
      </div>
    </div>
  );
};

export default AnalystEvaluationForm;
