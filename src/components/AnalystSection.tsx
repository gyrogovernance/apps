import React, { useState, useEffect } from 'react';
import { NotebookState } from '../types';
import { generateAnalystPrompt } from '../lib/prompts';
import { validateAnalystJSON } from '../lib/parsing';
import { sessions, drafts } from '../lib/storage';
import { getActiveSession } from '../lib/session-helpers';
import { useToast } from './shared/Toast';
import { useSettings } from '../hooks/useSettings';
import { AI_MODELS } from '../lib/model-list';

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
  const [jsonInput, setJsonInput] = useState('');
  const [modelName, setModelName] = useState(() => {
    // Always use the specific analyst's model, regardless of epoch
    const modelKey = analystKey === 'analyst1' ? 'model_analyst1' : 'model_analyst2';
    return session.process[modelKey] || '';
  });
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
  } | null>(null);
  const [copyStatus, setCopyStatus] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<{
    prompt?: 'success' | 'error' | null;
    transcript?: 'success' | 'error' | null;
    fullPrompt?: 'success' | 'error' | null;
    shortPrompt?: 'success' | 'error' | null;
  }>({});

  // Load draft on mount (use combined key for per-epoch drafts)
  const draftKey = `${analystKey}_${epochKey}`;

  // Reset local fields when stage changes, then load draft for that stage
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      // Clear any carry-over state immediately
      setJsonInput('');
      setValidationResult(null);

      if (settings?.autoSaveDrafts && session.id) {
        try {
          const draft = await drafts.load(session.id, draftKey);
          if (!cancelled && draft && draft.trim()) {
            setJsonInput(draft);
          }
        } catch {
          // ignore
        }
      }
    };
    init();
    return () => { cancelled = true; };
  }, [session.id, draftKey, settings?.autoSaveDrafts]);

  // Update model name when session changes (e.g., when going back to Epoch 1)
  useEffect(() => {
    const modelKey = analystKey === 'analyst1' ? 'model_analyst1' : 'model_analyst2';
    const currentModel = session.process[modelKey] || '';
    if (currentModel !== modelName) {
      setModelName(currentModel);
    }
  }, [session.process, analystKey, modelName]);

  // Auto-save draft
  useEffect(() => {
    if (settings?.autoSaveDrafts && jsonInput && session.id) {
      const timeout = setTimeout(() => {
        drafts.save(session.id!, draftKey, jsonInput).catch(() => {/* ignore */});
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [jsonInput, session.id, draftKey, settings?.autoSaveDrafts]);

  // Generate transcript for the specific epoch only
  const getEpochTranscript = (): string => {
    const epoch = session.epochs[epochKey];
    return epoch.turns
      .map(t => `{Turn ${t.number}}\n${t.content}`)
      .join('\n\n');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus(''), 2000);
    } catch (err) {
      toast.show('Failed to copy to clipboard', 'error');
    }
  };

  const getTranscriptText = () => {
    const epoch = session.epochs[epochKey];
    if (!epoch || !epoch.turns) return '';
    
    return epoch.turns
      .map((turn, index) => `Turn ${index + 1}:\n${turn.content}`)
      .join('\n\n');
  };

  const handleCopy = async (text: string, type: keyof typeof copyFeedback) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(prev => ({ ...prev, [type]: 'success' }));
      setTimeout(() => {
        setCopyFeedback(prev => ({ ...prev, [type]: null }));
      }, 2000);
    } catch (error) {
      setCopyFeedback(prev => ({ ...prev, [type]: 'error' }));
      setTimeout(() => {
        setCopyFeedback(prev => ({ ...prev, [type]: null }));
      }, 2000);
    }
  };

  const handleValidate = async () => {
    console.log('handleValidate called', { jsonInput: jsonInput.trim(), modelName: modelName.trim() });
    
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
          await drafts.clear(session.id, draftKey);
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

  const isComplete = session.analysts[epochKey][analystKey]?.status === 'complete';

  return (
    <div className="section-card">
      <h2 className="section-header">
        <span>3. Provision: Epoch {epochNumber} - Analyst {analystNumber} Evaluation</span>
        {isComplete && <span className="success-badge">✓ Completed</span>}
      </h2>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded p-3 mb-4 text-sm">
        <p className="font-medium mb-1 text-gray-900 dark:text-gray-100">Instructions:</p>
        <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
          <li>Copy the analyst prompt below</li>
          <li>Paste it into a <strong>different AI model</strong> than used for synthesis</li>
          <li>Copy the JSON response and paste it here</li>
          <li>Validate to ensure proper format</li>
        </ol>
      </div>

      <div className="space-y-4">
        {/* Model Name */}
        <div>
          <label className="label-text">Analyst Model Name *</label>
          <input
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            list={`analyst-model-suggestions-${analystKey}-${epochKey}`}
            placeholder="Select or type model name (e.g., gpt-5-chat, claude-opus-4-1)"
            className="input-field"
          />
          <datalist id={`analyst-model-suggestions-${analystKey}-${epochKey}`}>
            {AI_MODELS.map((model) => (
              <option key={model.value} value={model.value} />
            ))}
          </datalist>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Use a different model than the synthesis epochs. Select from list or enter custom name.
          </p>
        </div>

        {/* Copy Options for Analyst 2 */}
        {analystKey === 'analyst2' && (
          <div className="space-y-2">
            <label className="label-text">Copy Options</label>
            <div className="space-y-2">
              {/* Transcript */}
              <details className="group">
            <summary className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400 group-open:rotate-180 transition-transform" title="Click to expand">
                  ▼
                </span>
                <span className="text-sm font-medium">Transcript</span>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCopy(getTranscriptText(), 'transcript');
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                title="Copy transcript"
              >
                {copyFeedback.transcript === 'success' ? '✅' : copyFeedback.transcript === 'error' ? '❌' : '📋'}
              </button>
            </summary>
                <div className="p-4 border-t border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-b-lg text-gray-900 dark:text-gray-100">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Copy this to provide the full conversation context to a different AI model for analysis.
                  </p>
                  <div className="relative">
                    <textarea
                      value={getTranscriptText()}
                      readOnly
                      rows={6}
                      className="textarea-field bg-gray-50 dark:bg-gray-700 font-mono text-sm pb-8"
                    />
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <button
                        onClick={() => copyToClipboard(getTranscriptText())}
                        className="btn-secondary flex items-center gap-1 px-2 py-1 text-xs hover:bg-gray-300 dark:hover:bg-gray-600 border border-gray-400 dark:border-gray-500 shadow-md min-w-[60px] justify-center"
                      >
                        <span className="text-sm">📋</span>
                        <span className="whitespace-nowrap">{copyStatus || 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </details>

              {/* Full Analyst Prompt */}
              <details className="group">
            <summary className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400 group-open:rotate-180 transition-transform" title="Click to expand">
                  ▼
                </span>
                <span className="text-sm font-medium">Full Analyst Prompt</span>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCopy(analystPrompt, 'fullPrompt');
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                title="Copy full prompt"
              >
                {copyFeedback.fullPrompt === 'success' ? '✅' : copyFeedback.fullPrompt === 'error' ? '❌' : '📋'}
              </button>
            </summary>
                <div className="p-4 border-t border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-b-lg text-gray-900 dark:text-gray-100">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Use this when you want the full context and detailed instructions for the analyst.
                  </p>
                  <div className="relative">
                    <textarea
                      value={analystPrompt}
                      readOnly
                      rows={8}
                      className="textarea-field bg-gray-50 dark:bg-gray-700 font-mono text-sm pb-8"
                    />
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <button
                        onClick={() => copyToClipboard(analystPrompt)}
                        className="btn-secondary flex items-center gap-1 px-2 py-1 text-xs hover:bg-gray-300 dark:hover:bg-gray-600 border border-gray-400 dark:border-gray-500 shadow-md min-w-[60px] justify-center"
                      >
                        <span className="text-sm">📋</span>
                        <span className="whitespace-nowrap">{copyStatus || 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </details>

              {/* Short Analyst Prompt */}
              <details className="group">
            <summary className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400 group-open:rotate-180 transition-transform" title="Click to expand">
                  ▼
                </span>
                <span className="text-sm font-medium">Short Analyst Prompt</span>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCopy("You are a different analyst, please provide your own review in the same JSON format", 'shortPrompt');
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                title="Copy short prompt"
              >
                {copyFeedback.shortPrompt === 'success' ? '✅' : copyFeedback.shortPrompt === 'error' ? '❌' : '📋'}
              </button>
            </summary>
                <div className="p-4 border-t border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-b-lg text-gray-900 dark:text-gray-100">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Use this for token economy when using a different model in the same chat session.
                  </p>
                  <div className="relative">
                    <textarea
                      value="You are a different analyst, please provide your own review in the same JSON format"
                      readOnly
                      rows={3}
                      className="textarea-field bg-gray-50 dark:bg-gray-700 font-mono text-sm pb-8"
                    />
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <button
                        onClick={() => copyToClipboard("You are a different analyst, please provide your own review in the same JSON format")}
                        className="btn-secondary flex items-center gap-1 px-2 py-1 text-xs hover:bg-gray-300 dark:hover:bg-gray-600 border border-gray-400 dark:border-gray-500 shadow-md min-w-[60px] justify-center"
                      >
                        <span className="text-sm">📋</span>
                        <span className="whitespace-nowrap">{copyStatus || 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </details>
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
            <details className="group">
            <summary className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400 group-open:rotate-180 transition-transform" title="Click to expand">
                  ▼
                </span>
                <span className="text-sm font-medium">View Full Prompt</span>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCopy(analystPrompt, 'prompt');
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                title="Copy prompt"
              >
                {copyFeedback.prompt === 'success' ? '✅' : copyFeedback.prompt === 'error' ? '❌' : '📋'}
              </button>
            </summary>
              <div className="p-4 border-t border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-b-lg">
          <div className="relative">
            <textarea
              value={analystPrompt}
              readOnly
              rows={12}
                    className="textarea-field bg-gray-50 dark:bg-gray-700 font-mono text-sm pb-8"
            />
                  <div className="absolute bottom-2 right-2 flex gap-1">
            <button
              onClick={() => copyToClipboard(analystPrompt)}
                      className="btn-secondary flex items-center gap-1 px-2 py-1 text-xs hover:bg-gray-300 dark:hover:bg-gray-600 border border-gray-400 dark:border-gray-500 shadow-md min-w-[60px] justify-center"
            >
                      <span className="text-sm">📋</span>
                      <span className="whitespace-nowrap">{copyStatus || 'Copy'}</span>
            </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  This prompt includes the full transcript from Epoch {epochNumber}
                </p>
              </div>
            </details>
          </div>
        )}

        {/* JSON Response Input */}
        {!isComplete && (
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
                      console.error('Failed to read clipboard:', err);
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
        {isComplete && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded p-4">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200 mb-2">
              <span className="text-lg">✓</span>
              <span className="font-medium">Analyst {analystNumber} evaluation completed</span>
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
        {isComplete && (
          <button onClick={handleNext} className="btn-primary">
            Next →
          </button>
        )}
      </div>
    </div>
  );
};

export default AnalystSection;
