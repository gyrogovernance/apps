import React, { useState, useEffect } from 'react';
import { NotebookState } from '../types';
import { generateAnalystPrompt } from '../lib/prompts';
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
      toast.show('Please enter a model name', 'error');
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

  const analystPrompt = generateAnalystPrompt(
    [getEpochTranscript()],
    session.challenge.type
  );

  const showForm = !isComplete || isEditing;

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

      {/* Instructions */}
      {showForm && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded p-3 mb-4 text-sm">
          <p className="font-medium mb-1 text-gray-900 dark:text-gray-100">Instructions:</p>
          <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
            <li>Copy the analyst prompt below</li>
            <li>Paste it into a <strong>different AI model</strong> than used for synthesis</li>
            <li>Copy the JSON response and paste it here</li>
            <li>Validate to ensure proper format</li>
          </ol>
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

        {/* Copy Options for Analyst 2 */}
        {showForm && analystKey === 'analyst2' && (
          <div className="space-y-2">
            <label className="label-text">Copy Options</label>
            <div className="space-y-2">
              <CopyableDetails
                title="Transcript"
                content={getTranscriptText()}
                rows={6}
              />
              <CopyableDetails
                title="Full Analyst Prompt"
                content={analystPrompt}
                rows={8}
              />
              <CopyableDetails
                title="Short Analyst Prompt"
                content="You are a different analyst, please provide your own review in the same JSON format"
                rows={3}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Choose what to copy based on your analysis workflow preference.
            </p>
          </div>
        )}

        {/* Analyst Prompt - Only show for Analyst 1 */}
        {analystKey === 'analyst1' && (
          <div>
            <label className="label-text">Analyst Prompt (Copy this)</label>
            <CopyableDetails
              title="View Full Prompt"
              content={analystPrompt}
              rows={12}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              This prompt includes the full transcript from Epoch {epochNumber}
            </p>
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
              <div className="absolute bottom-2 right-2 flex gap-1">
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
              disabled={!jsonInput.trim() || !modelName.trim()}
            >
              Next
            </button>
            {(!jsonInput.trim() || !modelName.trim()) && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {!jsonInput.trim() && !modelName.trim() 
                  ? 'Please paste JSON response and enter model name'
                  : !jsonInput.trim() 
                    ? 'Please paste JSON response'
                    : 'Please enter model name'
                }
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
      <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
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
