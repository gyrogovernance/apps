import React, { useState, useEffect } from 'react';
import { NotebookState, TurnNumber } from '../types';
import { generateSynthesisPrompt, generateContinuePrompt } from '../lib/prompts';
import { parseManualPaste } from '../lib/parsing';
import { sessions, drafts } from '../lib/storage';
import { getActiveSession, requireActiveSession } from '../lib/session-helpers';
import { useToast } from './shared/Toast';
import { useSettings } from '../hooks/useSettings';
import { ClipboardMonitor } from './shared/ClipboardMonitor';
import { countWords, estimateTokens, formatTokenCount } from '../lib/text-utils';
import ElementPicker from './ElementPicker';

interface SynthesisSectionProps {
  state: NotebookState;
  onUpdate: (newState: Partial<NotebookState>) => void;
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
  const toast = useToast();
  const settings = useSettings();
  const session = getActiveSession(state);
  
  if (!session) {
    toast.show('No active session found', 'error');
    return <div>Error: No active session</div>;
  }

  const epoch = session.epochs[epochKey];
  const currentTurnNumber = (epoch.turns.length + 1) as TurnNumber;
  const [pastedText, setPastedText] = useState('');
  const [modelName, setModelName] = useState(
    epochKey === 'epoch1' ? session.process.model_epoch1 : session.process.model_epoch2
  );
  const [duration, setDuration] = useState(epoch.duration_minutes);
  const [copyStatus, setCopyStatus] = useState<string>('');

  // Load draft on mount
  useEffect(() => {
    if (settings?.autoSaveDrafts && session.id) {
      const draftKey = `${epochKey}_turn_${currentTurnNumber}`;
      drafts.load(session.id, draftKey).then(draft => {
        if (draft) setPastedText(draft);
      }).catch(() => {/* ignore */});
    }
  }, [session.id, epochKey, currentTurnNumber, settings?.autoSaveDrafts]);

  // Auto-save draft
  useEffect(() => {
    if (settings?.autoSaveDrafts && pastedText && session.id) {
      const timeout = setTimeout(() => {
        const draftKey = `${epochKey}_turn_${currentTurnNumber}`;
        drafts.save(session.id!, draftKey, pastedText).catch(() => {/* ignore */});
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [pastedText, session.id, epochKey, currentTurnNumber, settings?.autoSaveDrafts]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus(''), 2000);
    } catch (err) {
      toast.show('Failed to copy to clipboard', 'error');
    }
  };

  const handlePasteTurn = async () => {
    if (!pastedText.trim()) {
      toast.show('Please paste some text', 'error');
      return;
    }

    const turn = parseManualPaste(pastedText, currentTurnNumber);
    const updatedTurns = [...epoch.turns, turn];
    const completed = updatedTurns.length === 6;

    try {
      // Update session storage (returns full updated state)
      const newState = await sessions.update(session.id, {
        epochs: {
          ...session.epochs,
          [epochKey]: {
            ...epoch,
            turns: updatedTurns,
            completed,
            status: completed ? ('complete' as const) : ('in-progress' as const)
          }
        }
      });

      // Clear draft
      if (settings?.autoSaveDrafts) {
        const draftKey = `${epochKey}_turn_${currentTurnNumber}`;
        await drafts.clear(session.id, draftKey);
      }

      // Update parent state immediately (don't wait for storage listener)
      onUpdate(newState);
      setPastedText('');
      toast.show(`Turn ${currentTurnNumber} saved`, 'success');
    } catch (error) {
      console.error('Failed to save turn:', error);
      toast.show('Failed to save turn', 'error');
    }
  };

  const handleSaveDuration = async () => {
    if (!modelName.trim()) {
      toast.show('Please enter the model name', 'error');
      return;
    }

    try {
      const newState = await sessions.update(session.id, {
        epochs: {
          ...session.epochs,
          [epochKey]: {
            ...epoch,
            duration_minutes: duration,
            status: 'complete' as const
          }
        },
        process: {
          ...session.process,
          [epochKey === 'epoch1' ? 'model_epoch1' : 'model_epoch2']: modelName
        }
      });

      // Update parent state immediately
      onUpdate(newState);
      toast.show(`${epochKey === 'epoch1' ? 'Epoch 1' : 'Epoch 2'} completed`, 'success');
      onNext();
    } catch (error) {
      console.error('Failed to save epoch metadata:', error);
      toast.show('Failed to save', 'error');
    }
  };

  const getPromptForTurn = (turnNum: number): string => {
    if (turnNum === 1) {
      return generateSynthesisPrompt(
        session.challenge.description,
        session.challenge.type,
        session.challenge.title
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
          {/* Prompt to Copy - Progressive Disclosure for Turn 1 */}
          <div>
            <label className="label-text">
              Prompt for Turn {currentTurnNumber}
            </label>
            {currentTurnNumber === 1 ? (
              <details className="border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
                <summary className="cursor-pointer p-3 font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg flex items-center justify-between">
                  <span>📋 View Full Prompt (click to expand)</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      copyToClipboard(getPromptForTurn(currentTurnNumber));
                    }}
                    className="btn-secondary text-xs"
                  >
                    {copyStatus || 'Copy'}
                  </button>
                </summary>
                <div className="p-4 border-t border-gray-300 dark:border-gray-600">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono bg-white dark:bg-gray-900 p-3 rounded">
                    {getPromptForTurn(currentTurnNumber)}
                  </pre>
                </div>
              </details>
            ) : (
              <div className="relative">
                <textarea
                  value={getPromptForTurn(currentTurnNumber)}
                  readOnly
                  rows={3}
                  className="textarea-field bg-gray-50 dark:bg-gray-700 font-mono text-sm"
                />
                <button
                  onClick={() => copyToClipboard(getPromptForTurn(currentTurnNumber))}
                  className="absolute top-2 right-2 btn-secondary text-xs"
                >
                  {copyStatus || 'Copy'}
                </button>
              </div>
            )}
            {copyStatus && (
              <div className="mt-2 text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded inline-block">
                {copyStatus}
              </div>
            )}
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
                {(() => {
                  const words = countWords(pastedText);
                  const tokens = estimateTokens(words);
                  return `${words} words (~${formatTokenCount(tokens)} tokens)`;
                })()}
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
                {epoch.turns.map((turn) => {
                  const estimatedTokens = estimateTokens(turn.word_count);
                  return (
                    <div key={turn.number} className="flex items-center gap-2 text-sm">
                      <span className="success-badge">Turn {turn.number}</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {turn.word_count} words
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        ~{formatTokenCount(estimatedTokens)} tokens
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(turn.captured_at).toLocaleTimeString()}
                      </span>
                    </div>
                  );
                })}
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
              {epoch.turns.map((turn) => {
                const estimatedTokens = estimateTokens(turn.word_count);
                return (
                  <div key={turn.number} className="border-l-2 border-primary pl-3">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Turn {turn.number} ({turn.word_count} words, ~{formatTokenCount(estimatedTokens)} tokens)
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {turn.content.substring(0, 200)}...
                    </div>
                  </div>
                );
              })}
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
            Continue to {epochKey === 'epoch1' ? 'Epoch 2' : 'Analyst 1'} →
          </button>
        )}
      </div>

      {/* Clipboard Monitor */}
      {settings?.clipboardMonitoring && (
        <ClipboardMonitor
          enabled={true}
          currentContext="synthesis"
          onSuggestPaste={(content) => setPastedText(content)}
        />
      )}
    </div>
  );
};

export default SynthesisSection;
