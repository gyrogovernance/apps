import React, { useState, useEffect } from 'react';
import { NotebookState } from '../types';
import { generateAnalystPrompt } from '../lib/prompts';
import { validateAnalystJSON } from '../lib/parsing';
import { sessions, drafts } from '../lib/storage';
import { getActiveSession } from '../lib/session-helpers';
import { useToast } from './shared/Toast';
import { useSettings } from '../hooks/useSettings';
import { ClipboardMonitor } from './shared/ClipboardMonitor';

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
  const [modelName, setModelName] = useState(
    analystKey === 'analyst1' ? session.process.model_analyst1 : session.process.model_analyst2
  );
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
  } | null>(null);
  const [copyStatus, setCopyStatus] = useState<string>('');

  // Load draft on mount (use combined key for per-epoch drafts)
  const draftKey = `${analystKey}_${epochKey}`;
  useEffect(() => {
    if (settings?.autoSaveDrafts && session.id) {
      drafts.load(session.id, draftKey).then(draft => {
        if (draft) setJsonInput(draft);
      }).catch(() => {/* ignore */});
    }
  }, [session.id, draftKey, settings?.autoSaveDrafts]);

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

  const handleValidate = async () => {
    if (!jsonInput.trim()) {
      toast.show('Please paste the JSON response', 'error');
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

        // Update parent state immediately
        onUpdate(newState);
        toast.show(`Epoch ${epochNumber} - Analyst ${analystNumber} evaluation saved`, 'success');
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
            placeholder="e.g., Claude 3.5 Sonnet, GPT-4o"
            className="input-field"
            disabled={isComplete}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Use a different model than the synthesis epochs
          </p>
        </div>

        {/* Analyst Prompt */}
        <div>
          <label className="label-text">Analyst Prompt (Copy this)</label>
          <div className="relative">
            <textarea
              value={analystPrompt}
              readOnly
              rows={12}
              className="textarea-field bg-gray-50 dark:bg-gray-700 font-mono text-sm"
            />
            <button
              onClick={() => copyToClipboard(analystPrompt)}
              className="absolute top-2 right-2 btn-secondary text-xs"
            >
              {copyStatus || 'Copy'}
            </button>
            {copyStatus && (
              <div className="absolute top-2 right-16 text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                {copyStatus}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            This prompt includes the full transcript from Epoch {epochNumber}
          </p>
        </div>

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
                  <pre className="text-xs font-mono whitespace-pre overflow-x-auto">
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
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{"structure_scores": {...}, "behavior_scores": {...}, ...}'
              rows={12}
              className="textarea-field font-mono text-sm"
            />
            
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
              Validate & Save
            </button>
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
            Continue to {analystKey === 'analyst1' ? 'Analyst 2' : 'Report'} →
          </button>
        )}
      </div>

      {/* Clipboard Monitor */}
      {settings?.clipboardMonitoring && (
        <ClipboardMonitor
          enabled={true}
          currentContext="analyst"
          onSuggestPaste={(content) => setJsonInput(content)}
        />
      )}
    </div>
  );
};

export default AnalystSection;
