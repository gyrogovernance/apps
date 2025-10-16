import React, { useState } from 'react';
import { NotebookState } from '../types';
import { generateAnalystPrompt } from '../lib/prompts';
import { validateAnalystJSON } from '../lib/parsing';
import { sessions } from '../lib/storage';

interface AnalystSectionProps {
  state: NotebookState;
  onUpdate: (updates: Partial<NotebookState> | ((prev: NotebookState) => Partial<NotebookState>)) => void;
  analystKey: 'analyst1' | 'analyst2';
  onNext: () => void;
  onBack: () => void;
}

const AnalystSection: React.FC<AnalystSectionProps> = ({
  state,
  onUpdate,
  analystKey,
  onNext,
  onBack
}) => {
  const analystNumber = analystKey === 'analyst1' ? 1 : 2;
  const [jsonInput, setJsonInput] = useState('');
  const [modelName, setModelName] = useState(
    analystKey === 'analyst1' ? state.process.model_analyst1 : state.process.model_analyst2
  );
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
  } | null>(null);
  const [copyStatus, setCopyStatus] = useState<string>('');

  // Generate transcript for analyst
  const getTranscript = (): string => {
    const epoch1Text = state.epochs.epoch1.turns
      .map(t => `{Turn ${t.number}}\n${t.content}`)
      .join('\n\n');

    const epoch2Text = state.epochs.epoch2.turns
      .map(t => `{Turn ${t.number}}\n${t.content}`)
      .join('\n\n');

    return `EPOCH 1\n\n${epoch1Text}\n\n---\n\nEPOCH 2\n\n${epoch2Text}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus(''), 2000);
    } catch (err) {
      setCopyStatus('Failed to copy');
      setTimeout(() => setCopyStatus(''), 2000);
    }
  };

  const handleValidate = async () => {
    if (!jsonInput.trim()) {
      alert('Please paste the JSON response');
      return;
    }
    const result = validateAnalystJSON(jsonInput, state.challenge.type);
    setValidationResult(result);
    if (result.valid && result.parsed) {
      onUpdate(prev => ({
        analysts: {
          ...prev.analysts,
          [analystKey]: result.parsed!
        },
        process: {
          ...prev.process,
          [analystKey === 'analyst1' ? 'model_analyst1' : 'model_analyst2']: modelName
        }
      }));

      // Sync with session storage
      if (state.activeSessionId) {
        const analystUpdate = analystKey === 'analyst1'
          ? { analyst1: { status: 'complete' as const, data: result.parsed! } }
          : { analyst2: { status: 'complete' as const, data: result.parsed! } };
        
        sessions.update(state.activeSessionId, {
          analysts: analystUpdate as any, // Session analysts structure differs from state
          process: {
            ...state.process,
            [analystKey === 'analyst1' ? 'model_analyst1' : 'model_analyst2']: modelName
          }
        }).catch(err => console.error('Session sync error:', err));
      }
    }
  };

  const handleNext = () => {
    if (!state.analysts[analystKey]) {
      alert('Please validate and save the analyst response first');
      return;
    }
    onNext();
  };

  const analystPrompt = generateAnalystPrompt(
    [getTranscript()],
    state.challenge.type
  );

  const isComplete = state.analysts[analystKey] !== null;

  return (
    <div className="section-card">
      <h2 className="section-header">
        <span>3. Provision: Analyst {analystNumber} Evaluation</span>
        {isComplete && <span className="success-badge">✓ Completed</span>}
      </h2>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm">
        <p className="font-medium mb-1">Instructions:</p>
        <ol className="list-decimal list-inside space-y-1 text-gray-700">
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
          <p className="text-xs text-gray-500 mt-1">
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
            This prompt includes the full transcript from both epochs
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
    "domain_1": 8.0,
    "domain_2": 7.5
  },
  "pathologies": [
    "sycophancy",
    "verbosity"
  ],
  "strengths": "Clear structure...",
  "weaknesses": "Limited depth...",
  "insights": "The response shows..."
}`}
                  </pre>
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    💡 All scores 1-10. Use "N/A" for comparison/preference if not applicable.
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
            <div className="mt-2">
              <button
                onClick={handleValidate}
                className="btn-primary"
                disabled={!jsonInput.trim() || !modelName.trim()}
              >
                Validate & Save
              </button>
            </div>
          </div>
        )}

        {/* Validation Result */}
        {validationResult && (
          <div className={`p-3 rounded ${validationResult.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {validationResult.valid ? (
              <div className="text-green-800">
                <div className="font-medium mb-1">✓ Valid JSON Response</div>
                <p className="text-sm">All required fields present and properly formatted.</p>
              </div>
            ) : (
              <div className="text-red-800">
                <div className="font-medium mb-1">✗ Validation Errors</div>
                <ul className="text-sm list-disc list-inside">
                  {validationResult.errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Preview Saved Response */}
        {isComplete && state.analysts[analystKey] && (
          <div className="border rounded p-4 bg-gray-50">
            <h3 className="font-medium mb-3">Saved Response Summary</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Structure Scores:</span>{' '}
                {Object.values(state.analysts[analystKey]!.structure_scores).map(s => s.toFixed(1)).join(', ')}
              </div>
              <div>
                <span className="font-medium">Behavior Scores:</span>{' '}
                {Object.values(state.analysts[analystKey]!.behavior_scores).map(s => typeof s === 'number' ? s.toFixed(1) : s).join(', ')}
              </div>
              <div>
                <span className="font-medium">Pathologies:</span>{' '}
                {state.analysts[analystKey]!.pathologies.length > 0 
                  ? state.analysts[analystKey]!.pathologies.join(', ')
                  : 'None detected'}
              </div>
              <details className="mt-2">
                <summary className="cursor-pointer font-medium text-primary">
                  View Full Insights
                </summary>
                <div className="mt-2 p-3 bg-white rounded text-sm whitespace-pre-wrap">
                  {state.analysts[analystKey]!.insights}
                </div>
              </details>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t mt-4">
        <button onClick={onBack} className="btn-secondary">
          ← Back
        </button>
        <button
          onClick={handleNext}
          className="btn-primary"
          disabled={!isComplete}
        >
          Continue to {analystKey === 'analyst1' ? 'Analyst 2' : 'Report'} →
        </button>
      </div>
    </div>
  );
};

export default AnalystSection;

