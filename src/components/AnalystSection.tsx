import React, { useState, useEffect } from 'react';
import { NotebookState } from '../types';
import { generateAnalystPrompt, generateAnalystPromptWithoutTranscript } from '../lib/prompts';
import { validateAnalystJSON } from '../lib/parsing';
import { sessions } from '../lib/storage';
import { getActiveSession } from '../lib/session-helpers';
import { useToast } from './shared/Toast';
import { useSettings } from '../hooks/useSettings';
import { useDrafts } from '../hooks/useDrafts';
import { CopyableDetails } from './shared/CopyableDetails';
import { ModelSelect } from './shared/ModelSelect';

interface AnalystSectionProps {
  state: NotebookState;
  onUpdate: (newState: Partial<NotebookState>) => void;
  analystKey: 'analyst1' | 'analyst2';
  epochKey: 'epoch1' | 'epoch2';
  onNext: () => void;
  onBack: () => void;
}

const AnalystSection: React.FC<AnalystSectionProps> = ({
  state,
  onUpdate,
  analystKey,
  epochKey,
  onNext,
  onBack
}) => {
  const toast = useToast();
  const settings = useSettings();
  const session = getActiveSession(state);
  
  if (!session) {
    toast.show('No active session found', 'error');
    return <div>Error: No active session</div>;
  }

  const analystNumber = analystKey === 'analyst1' ? 1 : 2;
  const epochNumber = epochKey === 'epoch1' ? 1 : 2;
  const draftKey = `${analystKey}_${epochKey}`;
  
  const { value: jsonInput, setValue: setJsonInput, clear: clearDraft } = useDrafts({
    sessionId: session.id,
    key: draftKey,
    enabled: settings?.autoSaveDrafts || false
  });
  
  const [modelName, setModelName] = useState(() => {
    // Always use the specific analyst's model, regardless of epoch
    const modelKey = analystKey === 'analyst1' ? 'model_analyst1' : 'model_analyst2';
    return session.process[modelKey] || '';
  });
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const isComplete = session.analysts[epochKey][analystKey]?.status === 'complete';

  // Sync model name when session changes (e.g., switching between sessions)
  // Note: modelName is NOT in deps to avoid resetting user input while typing
  useEffect(() => {
    const modelKey = analystKey === 'analyst1' ? 'model_analyst1' : 'model_analyst2';
    const currentModel = session.process[modelKey] || '';
    setModelName(currentModel);
  }, [session.process, analystKey]);

  // Load existing data when editing a completed evaluation
  useEffect(() => {
    if (isEditing && isComplete) {
      const existingData = session.analysts[epochKey][analystKey]?.data;
      if (existingData) {
        setJsonInput(JSON.stringify(existingData, null, 2));
      }
    }
  }, [isEditing, isComplete, session.analysts, epochKey, analystKey, setJsonInput]);

  // Generate transcript for the specific epoch only
  const getEpochTranscript = (): string => {
    const epoch = session.epochs[epochKey];
    return epoch.turns
      .map(t => `{Turn ${t.number}}\n${t.content}`)
      .join('\n\n');
  };

  const getTranscriptText = () => {
    const epoch = session.epochs[epochKey];
    if (!epoch || !epoch.turns) return '';
    
    return epoch.turns
      .map((turn, index) => `Turn ${index + 1}:\n${turn.content}`)
      .join('\n\n');
  };

  const handleValidate = async () => {
    
    if (!jsonInput.trim()) {
      toast.show('Please paste the JSON response', 'error');
      return;
    }
    
    if (!modelName.trim()) {
      toast.show('Add model name to proceed', 'error');
      return;
    }
    
    const result = validateAnalystJSON(jsonInput, session.challenge.type);
    setValidationResult(result);
    
    if (result.valid && result.parsed) {
      try {
        // Update the per-epoch analyst slot
        const newState = await sessions.update(session.id, {
          analysts: {
            ...session.analysts,
            [epochKey]: {
              ...session.analysts[epochKey],
              [analystKey]: {
                status: 'complete' as const,
                data: result.parsed
              }
            }
          },
          process: {
            ...session.process,
            [analystKey === 'analyst1' ? 'model_analyst1' : 'model_analyst2']: modelName
          }
        });

        // Clear draft
        if (settings?.autoSaveDrafts) {
          await clearDraft();
        }

        // Update parent state with partial to avoid clobbering UI
        onUpdate({ sessions: newState.sessions });
        toast.show(`Epoch ${epochNumber} - Analyst ${analystNumber} evaluation saved`, 'success');
        
        // Automatically proceed to next step
        setTimeout(() => {
          onNext();
        }, 1000); // Small delay to show the success message
      } catch (error) {
        console.error('Failed to save analyst evaluation:', error);
        toast.show('Failed to save evaluation', 'error');
      }
    } else {
      toast.show(`Validation failed: ${result.errors[0]}`, 'error');
    }
  };

  const handleNext = () => {
    const currentAnalyst = session.analysts[epochKey][analystKey];
    if (!currentAnalyst || currentAnalyst.status !== 'complete') {
      toast.show('Please validate and save the analyst response first', 'error');
      return;
    }
    onNext();
  };

  // For Analyst 1, provide separate options (transcript and prompt without transcript)
  const analystPromptWithoutTranscript = generateAnalystPromptWithoutTranscript(session.challenge.type);
  // For Analyst 2, keep the combined prompt (backward compatible)
  const analystPrompt = generateAnalystPrompt(
    [getEpochTranscript()],
    session.challenge.type
  );

  const showForm = !isComplete || isEditing;
  const quickMode = state.ui.journalQuickMode;

  return (
    <div className="section-card">
      <h2 className="section-header">
        <div className="flex flex-col gap-1">
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {session.challenge.title}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            3. Provision: Epoch {epochNumber} - Analyst {analystNumber} Evaluation
          </div>
        </div>
        {isComplete && <span className="success-badge">✓ Completed</span>}
      </h2>

      {/* Guides - Only show in Guided mode */}
      {showForm && !quickMode && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded p-3 mb-4 text-sm">
          <p className="font-medium mb-2 text-gray-900 dark:text-gray-100">📋 Guides:</p>
          <div className="space-y-2 text-gray-700 dark:text-gray-300">
            <p><strong>Step 1:</strong> Select your analyst model (use a different model than synthesis)</p>
            <p><strong>Step 2:</strong> Choose and copy the appropriate analyst prompt:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>"Same Chat (Transcript Excluded)":</strong> Use this if continuing in the same AI chat where you did synthesis. {analystKey === 'analyst2' ? 'This is a short prompt asking for a second opinion. The transcript is already in the conversation history.' : 'Copy and paste this prompt. The transcript is already in the conversation history, so no need to paste it again.'}</li>
              <li><strong>"Different Chat (Transcript Included)":</strong> Use this if starting a fresh chat with a different AI model. The transcript is already embedded in the prompt.</li>
            </ul>
            <p><strong>Step 3:</strong> Paste the AI's JSON response below and validate</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Model Name */}
        {showForm && (
          <ModelSelect
            value={modelName}
            onChange={setModelName}
            id={`analyst-model-${analystKey}-${epochKey}`}
            label="Analyst Model Name"
            helperText="Use a different model than the synthesis epochs. Select from list or enter custom name."
            required={true}
          />
        )}

        {/* Analyst Prompts - Different options for Analyst 1 vs Analyst 2 */}
        {showForm && (
          <div className="space-y-2">
            <label className="label-text">Analyst Prompts</label>
            <div className="space-y-2">
              {analystKey === 'analyst1' ? (
                <>
                  <CopyableDetails
                    title="Same Chat (Transcript Excluded)"
                    content={analystPromptWithoutTranscript}
                    rows={8}
                    quickMode={quickMode}
                  />
                  <CopyableDetails
                    title="Different Chat (Transcript Included)"
                    content={analystPrompt}
                    rows={8}
                    quickMode={quickMode}
                  />
                </>
              ) : (
                <>
                  <CopyableDetails
                    title="Same Chat (Transcript Excluded)"
                    content="You are a different analyst, please provide your own review in the same JSON format"
                    rows={3}
                    quickMode={quickMode}
                  />
                  <CopyableDetails
                    title="Different Chat (Transcript Included)"
                    content={analystPrompt}
                    rows={8}
                    quickMode={quickMode}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* JSON Response Input */}
        {showForm && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="label-text">Paste JSON Response</label>
              <details className="text-xs">
                <summary className="cursor-pointer text-blue-600 dark:text-blue-400 hover:underline">
                  Show Example JSON
                </summary>
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 max-w-md">
                  <pre className="text-xs font-mono whitespace-pre overflow-x-auto text-gray-900 dark:text-gray-100">
{`{
  "structure_scores": {
    "traceability": 8.5,
    "variety": 7.0,
    "accountability": 9.0,
    "integrity": 8.0
  },
  "behavior_scores": {
    "truthfulness": 8.0,
    "completeness": 7.5,
    "groundedness": 8.5,
    "literacy": 9.0,
    "comparison": "N/A",
    "preference": "N/A"
  },
  "specialization_scores": {
    "policy": 8.0,
    "ethics": 7.5
  },
  "pathologies": [
    "semantic_drift",
    "deceptive_coherence"
  ],
  "strengths": "Clear structure...",
  "weaknesses": "Limited depth...",
  "insights": "The response shows..."
}`}
                  </pre>
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    💡 <strong>All scores 1-10.</strong> Use "N/A" for comparison/preference if not applicable.
                    <br />
                    💡 <strong>Valid pathologies:</strong> sycophantic_agreement, deceptive_coherence, goal_misgeneralization, superficial_optimization, semantic_drift
                  </p>
                </div>
              </details>
            </div>
            <div className="relative">
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
                  <span className="whitespace-nowrap">Paste</span>
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
                    ✓ Valid JSON structure
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
              Next
            </button>
            {!jsonInput.trim() && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Please paste JSON response to continue
              </p>
            )}
          </div>
        )}

        {/* Completed View */}
        {isComplete && !isEditing && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <span className="text-lg">✓</span>
                <span className="font-medium">Analyst {analystNumber} evaluation completed</span>
              </div>
              <button 
                onClick={() => setIsEditing(true)}
                className="btn-secondary text-sm"
              >
                Edit Scores
              </button>
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">
              Model: {analystKey === 'analyst1' ? session.process.model_analyst1 : session.process.model_analyst2}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 pb-6 border-t border-gray-200 dark:border-gray-700 mt-4">
        <button onClick={onBack} className="btn-secondary">
          ← Back
        </button>
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
        {isComplete && !isEditing && (
          <button onClick={handleNext} className="btn-primary">
            Next →
          </button>
        )}
      </div>
    </div>
  );
};

export default AnalystSection;
