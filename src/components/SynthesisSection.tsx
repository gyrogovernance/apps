import React, { useState, useEffect } from 'react';
import { NotebookState, TurnNumber } from '../types';
import { generateSynthesisPrompt, generateContinuePrompt } from '../lib/prompts';
import { parseManualPaste } from '../lib/parsing';
import { sessions, drafts } from '../lib/storage';
import { getActiveSession, requireActiveSession } from '../lib/session-helpers';
import { useToast } from './shared/Toast';
import { useSettings } from '../hooks/useSettings';
import { countWords, estimateTokens, formatTokenCount } from '../lib/text-utils';
import { loadTimerState, clearTimerState, secondsToMinutesPrecise } from '../lib/timer';
import { AI_MODELS } from '../lib/model-list';

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
  
  // Debug logging to see what's happening
  console.log('SynthesisSection render:', {
    sessionId: session.id,
    epochKey,
    turnsLength: epoch.turns.length,
    currentTurnNumber,
    completed: epoch.completed,
    allTurns: epoch.turns.map(t => t.number)
  });
  const [pastedText, setPastedText] = useState('');
  const [modelName, setModelName] = useState(
    epochKey === 'epoch1' ? session.process.model_epoch1 : session.process.model_epoch2
  );
  const [duration, setDuration] = useState(epoch.duration_minutes);
  const [durationDisplay, setDurationDisplay] = useState('00:00');
  const [autoRecordedMinutes, setAutoRecordedMinutes] = useState<number | null>(null);
  const [copyStatus, setCopyStatus] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<{
    prompt?: 'success' | 'error' | null;
    transcript?: 'success' | 'error' | null;
  }>({});

  // Helper: Convert decimal minutes to mm:ss format
  const minutesToMMSS = (decimalMinutes: number): string => {
    const mins = Math.floor(decimalMinutes);
    const secs = Math.round((decimalMinutes - mins) * 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Helper: Convert mm:ss format to decimal minutes
  const mmssToMinutes = (mmss: string): number => {
    const parts = mmss.split(':');
    if (parts.length !== 2) return 0;
    const mins = parseInt(parts[0]) || 0;
    const secs = parseInt(parts[1]) || 0;
    return Number((mins + secs / 60).toFixed(2));
  };

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

  // Auto-capture and stop timer when all 6 turns are complete
  useEffect(() => {
    if (!session?.id) return;
    if (epoch.turns.length === 6 && autoRecordedMinutes === null) {
      try {
        const saved = loadTimerState(session.id, epochKey);
        const minutes = secondsToMinutesPrecise(saved?.elapsedSeconds || 0);
        setDuration(minutes);
        setDurationDisplay(minutesToMMSS(minutes));
        setAutoRecordedMinutes(minutes);
        // Stop and clear timer state so it doesn't keep ticking
        clearTimerState(session.id, epochKey);
      } catch {
        // If no timer state found, keep existing duration
      }
    }
  }, [epoch.turns.length, session?.id, epochKey, autoRecordedMinutes]);

  // Initialize duration display on mount
  useEffect(() => {
    if (duration > 0) {
      setDurationDisplay(minutesToMMSS(duration));
    }
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus(''), 2000);
    } catch (err) {
      toast.show('Failed to copy to clipboard', 'error');
    }
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

  const handlePasteTurn = async () => {
    if (!pastedText.trim()) {
      toast.show('Please paste some text', 'error');
      return;
    }

    const turn = parseManualPaste(pastedText, currentTurnNumber);
    const updatedTurns = [...epoch.turns, turn];
    const completed = updatedTurns.length === 6;

    try {
      console.log('Before save:', {
        currentTurnNumber,
        turnsLength: epoch.turns.length,
        updatedTurnsLength: updatedTurns.length,
        completed
      });

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

      console.log('After save:', {
        newStateSessions: newState.sessions.find(s => s.id === session.id)?.epochs[epochKey].turns.length,
        newStateTurns: newState.sessions.find(s => s.id === session.id)?.epochs[epochKey].turns.map(t => t.number)
      });

      // Clear draft
      if (settings?.autoSaveDrafts) {
        const draftKey = `${epochKey}_turn_${currentTurnNumber}`;
        await drafts.clear(session.id, draftKey);
      }

      // Update parent state immediately with partial to avoid clobbering UI
      onUpdate({ sessions: newState.sessions });
      setPastedText('');
      
      // Standard toast for all turns (timer auto-capture happens in useEffect)
      toast.show(`Turn ${currentTurnNumber} saved`, 'success');
    } catch (error) {
      console.error('Failed to save turn:', error);
      toast.show('Failed to save turn', 'error');
    }
  };

  const handleSaveDuration = async () => {
    try {
      // Convert mm:ss display to decimal minutes
      let finalMinutes = mmssToMinutes(durationDisplay);
      
      // Fallback to timer state if conversion failed
      if (!finalMinutes || finalMinutes <= 0) {
        const saved = loadTimerState(session.id, epochKey);
        finalMinutes = secondsToMinutesPrecise(saved?.elapsedSeconds || 0);
      }

      const modelKey = epochKey === 'epoch1' ? 'model_epoch1' : 'model_epoch2';
      const modelValue = epochKey === 'epoch1' 
        ? (modelName.trim() || session.process[modelKey] || 'Unspecified')
        : session.process.model_epoch1; // Use Epoch 1 model for Epoch 2
      
      const newState = await sessions.update(session.id, {
        epochs: {
          ...session.epochs,
          [epochKey]: {
            ...epoch,
            duration_minutes: finalMinutes,
            status: 'complete' as const,
            completed: true
          }
        },
        process: {
          ...session.process,
          [modelKey]: modelValue
        }
      });

      // Update parent state with partial to avoid clobbering UI
      onUpdate({ sessions: newState.sessions });
      toast.show(`${epochKey === 'epoch1' ? 'Epoch 1' : 'Epoch 2'} completed`, 'success');
      onNext();
    } catch (error) {
      console.error('Failed to finalize epoch:', error);
      toast.show('Failed to finalize epoch', 'error');
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

      {/* Instructions - only show when collecting turns */}
      {!allTurnsComplete && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded p-3 mb-4 text-sm">
          <p className="font-medium mb-1 text-gray-900 dark:text-gray-100">Instructions:</p>
          <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
            <li>Copy the prompt below and paste it into your AI chat</li>
            <li>Copy the AI's response and paste it here</li>
            <li>Repeat for all 6 turns</li>
            <li>Enter the model name and confirm the duration</li>
          </ol>
        </div>
      )}

      {/* Turn Collection */}
      {!allTurnsComplete ? (
        <div className="space-y-4">
          {/* Prompt to Copy - Progressive Disclosure for Turn 1 */}
          <div>
            <label className="label-text">
              Prompt for Turn {currentTurnNumber}
            </label>
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
                  handleCopy(getPromptForTurn(currentTurnNumber), 'prompt');
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                title="Copy prompt"
              >
                {copyFeedback.prompt === 'success' ? '✅' : copyFeedback.prompt === 'error' ? '❌' : '📋'}
              </button>
            </summary>
              <div className="p-4 border-t border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-b-lg text-gray-900 dark:text-gray-100">
                <div className="relative">
                  <textarea
                    value={getPromptForTurn(currentTurnNumber)}
                    readOnly
                    rows={6}
                    className="textarea-field bg-gray-50 dark:bg-gray-700 font-mono text-sm pb-8"
                  />
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    <button
                      onClick={() => copyToClipboard(getPromptForTurn(currentTurnNumber))}
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

          {/* Paste Area */}
          <div>
            <label className="label-text mb-1 block">
              Paste AI Response for Turn {currentTurnNumber}
            </label>
            <div className="relative">
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste the AI's response here, or click the Paste button below..."
                rows={8}
                className="textarea-field pb-8"
              />
              <div className="absolute bottom-2 right-2 flex gap-1">
                <button
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      if (text) {
                        setPastedText(text);
                        toast.show('Text pasted from clipboard', 'success');
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

          {/* Model selection only for Epoch 1 */}
          {epochKey === 'epoch1' && (
            <div>
              <label className="label-text">Model Name *</label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                list="model-suggestions"
                placeholder="Select or type model name (e.g., gpt-5-chat, claude-sonnet-4-5)"
                className="input-field"
              />
              <datalist id="model-suggestions">
                {AI_MODELS.map((model) => (
                  <option key={model.value} value={model.value} />
                ))}
              </datalist>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Select from the list or enter a custom model name
              </p>
            </div>
          )}

          <div>
            <label className="label-text">Duration (mm:ss) *</label>
            <input
              type="text"
              value={durationDisplay}
              onChange={(e) => setDurationDisplay(e.target.value)}
              placeholder="15:30"
              pattern="[0-9]{1,3}:[0-5][0-9]"
              className="input-field font-mono"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              ⏱️ Auto-captured from timer. Format: minutes:seconds (e.g., 15:30)
            </p>
          </div>

          {/* View Transcript */}
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400 group-open:rotate-180 transition-transform" title="Click to expand">
                  ▼
                </span>
                <span className="text-sm font-medium">View Full Transcript</span>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const transcriptText = epoch.turns.map((turn, index) => 
                    `Turn ${index + 1}:\n${turn.content}`
                  ).join('\n\n');
                  handleCopy(transcriptText, 'transcript');
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                title="Copy transcript"
              >
                {copyFeedback.transcript === 'success' ? '✅' : copyFeedback.transcript === 'error' ? '❌' : '📋'}
              </button>
            </summary>
            <div className="p-4 border-t border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-b-lg text-gray-900 dark:text-gray-100">
              <div className="space-y-3 max-h-96 overflow-y-auto">
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
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
};

export default SynthesisSection;
