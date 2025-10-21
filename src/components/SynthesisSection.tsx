import React, { useState, useEffect } from 'react';
import { NotebookState, TurnNumber } from '../types';
import { generateSynthesisPrompt, generateContinuePrompt } from '../lib/prompts';
import { parseManualPaste } from '../lib/parsing';
import { sessions } from '../lib/storage';
import { getActiveSession } from '../lib/session-helpers';
import { useToast } from './shared/Toast';
import { useSettings } from '../hooks/useSettings';
import { countWords, estimateTokens, formatTokenCount } from '../lib/text-utils';
import { loadTimerState, clearTimerState, secondsToMinutesPrecise } from '../lib/timer';
import { useDrafts } from '../hooks/useDrafts';
import { CopyableDetails } from './shared/CopyableDetails';
import { TurnsSummary } from './shared/TurnsSummary';
import { ModelSelect } from './shared/ModelSelect';
import { SESSION_CONSTANTS } from '../lib/constants';

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
  
  const { value: pastedText, setValue: setPastedText, clear: clearDraft } = useDrafts({
    sessionId: session.id,
    key: `${epochKey}_turn_${currentTurnNumber}`,
    enabled: settings?.autoSaveDrafts || false
  });
  
  // Always use Epoch 1 model for consistency across both epochs
  const [modelName, setModelName] = useState(session.process.model_epoch1 || '');
  const [duration, setDuration] = useState(epoch.duration_minutes);
  const [durationDisplay, setDurationDisplay] = useState('00:00');
  const [autoRecordedMinutes, setAutoRecordedMinutes] = useState<number | null>(null);

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

  // Auto-capture timer state when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      // When component unmounts, ensure timer state is saved to session
      if (session?.id && epoch.turns.length < SESSION_CONSTANTS.TURNS_PER_EPOCH) {
        try {
          const saved = loadTimerState(session.id, epochKey);
          if (saved && saved.elapsedSeconds > 0) {
            const minutes = secondsToMinutesPrecise(saved.elapsedSeconds);
            // Fetch fresh session before writing to avoid overwriting turns
            sessions.getById(session.id).then(fresh => {
              if (!fresh) return;
              sessions.update(session.id, {
                epochs: {
                  ...fresh.epochs,
                  [epochKey]: {
                    ...fresh.epochs[epochKey],
                    duration_minutes: minutes
                  }
                }
              }).catch(() => {});
            }).catch(() => {});
          }
        } catch {
          // Silently ignore errors
        }
      }
    };
  }, [session?.id, epochKey, epoch.turns.length]);

  // Auto-capture and stop timer when all turns are complete
  useEffect(() => {
    if (!session?.id) return;
    if (epoch.turns.length === SESSION_CONSTANTS.TURNS_PER_EPOCH && autoRecordedMinutes === null) {
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

  const handlePasteTurn = async () => {
    if (!pastedText.trim()) {
      toast.show('Please paste some text', 'error');
      return;
    }

    const turn = parseManualPaste(pastedText, currentTurnNumber);

    try {
      // Fetch fresh session to avoid clobbering newer duration updates
      const fresh = await sessions.getById(session.id);
      if (!fresh) return;

      const freshEpoch = fresh.epochs[epochKey];
      const updatedTurns = [...freshEpoch.turns, turn];
      const completed = updatedTurns.length === SESSION_CONSTANTS.TURNS_PER_EPOCH;

      // Update session storage (returns full updated state)
      const newState = await sessions.update(session.id, {
        epochs: {
          ...fresh.epochs,
          [epochKey]: {
            ...freshEpoch,
            turns: updatedTurns,
            completed,
            status: completed ? ('complete' as const) : ('in-progress' as const)
          }
        }
      });

      // Clear draft
      if (settings?.autoSaveDrafts) {
        await clearDraft();
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

  const allTurnsComplete = epoch.turns.length === SESSION_CONSTANTS.TURNS_PER_EPOCH;

  return (
    <div className="section-card">
      <h2 className="section-header">
        <div className="flex flex-col gap-1">
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {session.challenge.title}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            2. Preparation: {epochKey === 'epoch1' ? 'First' : 'Second'} Synthesis Epoch
          </div>
        </div>
        <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
          {epoch.turns.length}/{SESSION_CONSTANTS.TURNS_PER_EPOCH} turns
        </span>
      </h2>

      {/* Instructions - only show when collecting turns */}
      {!allTurnsComplete && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded p-3 mb-4 text-sm">
          <p className="font-medium mb-1 text-gray-900 dark:text-gray-100">Instructions:</p>
          <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
            <li>Copy the prompt below and paste it into your AI chat</li>
            <li>Copy the AI's response and paste it here</li>
            <li>Repeat for all {SESSION_CONSTANTS.TURNS_PER_EPOCH} turns</li>
            <li>Enter the model name and confirm the duration</li>
          </ol>
        </div>
      )}

      {/* Turn Collection */}
      {!allTurnsComplete ? (
        <div className="space-y-4">
          {/* Prompt to Copy */}
          <div>
            <label className="label-text">
              Prompt for Turn {currentTurnNumber}
            </label>
            <CopyableDetails
              title="View Full Prompt"
              content={getPromptForTurn(currentTurnNumber)}
              rows={6}
            />
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
          <TurnsSummary turns={epoch.turns} />
        </div>
      ) : (
        /* Metadata Collection */
        <div className="space-y-4">
          <div className="success-badge mb-2">
            ✓ All {SESSION_CONSTANTS.TURNS_PER_EPOCH} turns completed
          </div>

          {/* Model selection for Epoch 1, read-only display for Epoch 2 */}
          {epochKey === 'epoch1' ? (
            <ModelSelect
              value={modelName}
              onChange={setModelName}
              id="synthesis-model-suggestions"
              required={true}
            />
          ) : (
            <div>
              <label className="label-text">Model (from Epoch 1)</label>
              <input
                type="text"
                value={session.process.model_epoch1}
                disabled
                className="input-field bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Using the same model as Epoch 1 for consistency
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
          <CopyableDetails
            title="View Full Transcript"
            content={epoch.turns.map((turn, index) => 
              `Turn ${index + 1}:\n${turn.content}`
            ).join('\n\n')}
            rows={12}
          />
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
