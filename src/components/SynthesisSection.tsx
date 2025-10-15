import React, { useState } from 'react';
import { NotebookState, TurnNumber } from '../types';
import { generateSynthesisPrompt, generateContinuePrompt } from '../lib/prompts';
import { parseManualPaste } from '../lib/parsing';
import ElementPicker from './ElementPicker';

interface SynthesisSectionProps {
  state: NotebookState;
  onUpdate: (updates: Partial<NotebookState> | ((prev: NotebookState) => Partial<NotebookState>)) => void;
  epochKey: 'epoch1' | 'epoch2';
  onNext: () => void;
  onBack: () => void;
}

const SynthesisSection: React.FC<SynthesisSectionProps> = ({
  state,
  onUpdate,
  epochKey,
  onNext,
  onBack
}) => {
  const epoch = state.epochs[epochKey];
  const currentTurnNumber = (epoch.turns.length + 1) as TurnNumber;
  const [pastedText, setPastedText] = useState('');
  const [modelName, setModelName] = useState(
    epochKey === 'epoch1' ? state.process.model_epoch1 : state.process.model_epoch2
  );
  const [duration, setDuration] = useState(epoch.duration_minutes);

  const [copyStatus, setCopyStatus] = useState<string>('');

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

  const handlePasteTurn = () => {
    if (!pastedText.trim()) {
      alert('Please paste some text');
      return;
    }

    const turn = parseManualPaste(pastedText, currentTurnNumber);
    
    onUpdate(prev => {
      const currentEpoch = prev.epochs[epochKey];
      const updatedTurns = [...currentEpoch.turns, turn];
      const completed = updatedTurns.length === 6;
      
      return {
        epochs: {
          ...prev.epochs,
          [epochKey]: {
            ...currentEpoch,
            turns: updatedTurns,
            completed
          }
        }
      };
    });

    setPastedText('');
  };

  const handleSaveDuration = () => {
    if (!modelName.trim()) {
      alert('Please enter the model name');
      return;
    }

    onUpdate(prev => ({
      epochs: {
        ...prev.epochs,
        [epochKey]: {
          ...prev.epochs[epochKey],
          duration_minutes: duration
        }
      },
      process: {
        ...prev.process,
        [epochKey === 'epoch1' ? 'model_epoch1' : 'model_epoch2']: modelName
      }
    }));

    if (epoch.completed) {
      onNext();
    }
  };

  const getPromptForTurn = (turnNum: number): string => {
    if (turnNum === 1) {
      return generateSynthesisPrompt(
        state.challenge.description, // Used for custom type, ignored for predefined types
        state.challenge.type, 
        state.challenge.title
      );
    } else {
      return generateContinuePrompt(turnNum);
    }
  };

  const allTurnsComplete = epoch.turns.length === 6;

  return (
    <div className="section-card">
      <h2 className="section-header">
        <span>
          2. Preparation: {epochKey === 'epoch1' ? 'First' : 'Second'} Synthesis Epoch
        </span>
        <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
          {epoch.turns.length}/6 turns
        </span>
      </h2>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded p-3 mb-4 text-sm">
        <p className="font-medium mb-1 text-gray-900 dark:text-gray-100">Instructions:</p>
        <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
          <li>Copy the prompt below and paste it into your AI chat</li>
          <li>Copy the AI's response and paste it here</li>
          <li>Repeat for all 6 turns</li>
          <li>Enter the model name and total time spent</li>
        </ol>
      </div>

      {/* Turn Collection */}
      {!allTurnsComplete ? (
        <div className="space-y-4">
          {/* Prompt to Copy */}
          <div>
            <label className="label-text">
              Prompt for Turn {currentTurnNumber}
            </label>
            <div className="relative">
              <textarea
                value={getPromptForTurn(currentTurnNumber)}
                readOnly
                rows={currentTurnNumber === 1 ? 15 : 3}
                className="textarea-field bg-gray-50 dark:bg-gray-700 font-mono text-sm"
              />
              <button
                onClick={() => copyToClipboard(getPromptForTurn(currentTurnNumber))}
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
          </div>

          {/* Paste Area */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="label-text">
                Paste AI Response for Turn {currentTurnNumber}
              </label>
              <ElementPicker onTextCaptured={(text) => setPastedText(text)} />
            </div>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste the AI's response here, or use Element Picker..."
              rows={8}
              className="textarea-field"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Word count: {pastedText.trim().split(/\s+/).filter(w => w.length > 0).length}
              </span>
              <button
                onClick={handlePasteTurn}
                className="btn-primary"
                disabled={!pastedText.trim()}
              >
                Save Turn {currentTurnNumber}
              </button>
            </div>
          </div>

          {/* Previous Turns Summary */}
          {epoch.turns.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Completed Turns:</h3>
              <div className="space-y-2">
                {epoch.turns.map((turn) => (
                  <div key={turn.number} className="flex items-center gap-2 text-sm">
                    <span className="success-badge">Turn {turn.number}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {turn.word_count} words
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(turn.captured_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Metadata Collection */
        <div className="space-y-4">
          <div className="success-badge mb-2">
            ✓ All 6 turns completed
          </div>

          <div>
            <label className="label-text">Model Name *</label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="e.g., GPT-4, Claude 3.5 Sonnet, Grok-2"
              className="input-field"
            />
          </div>

          <div>
            <label className="label-text">Total Duration (minutes) *</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
              min="1"
              placeholder="e.g., 15"
              className="input-field"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Approximate time spent on this synthesis epoch
            </p>
          </div>

          {/* View Transcript */}
          <details className="border border-gray-200 dark:border-gray-700 rounded p-3 bg-white dark:bg-gray-800">
            <summary className="cursor-pointer font-medium text-gray-900 dark:text-gray-100">
              View Full Transcript
            </summary>
            <div className="mt-3 space-y-3 max-h-96 overflow-y-auto">
              {epoch.turns.map((turn) => (
                <div key={turn.number} className="border-l-2 border-primary pl-3">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Turn {turn.number} ({turn.word_count} words)
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {turn.content.substring(0, 200)}...
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
        <button onClick={onBack} className="btn-secondary">
          ← Back
        </button>
        {allTurnsComplete && (
          <button
            onClick={handleSaveDuration}
            className="btn-primary"
            disabled={!modelName.trim() || duration === 0}
          >
            Continue to {epochKey === 'epoch1' ? 'Epoch 2' : 'Analysis'} →
          </button>
        )}
      </div>
    </div>
  );
};

export default SynthesisSection;

