// Detector Input View - Collect transcript and basic metadata
// Uses Insight-first approach with drafts for persistence

import React, { useState, useEffect, useRef } from 'react';
import { NotebookState, DetectorView, DetectorUIState } from '../../../types';
import { useClipboard } from '../../../hooks/useClipboard';
import { useToast } from '../../shared/Toast';
import GlassCard from '../../shared/GlassCard';
import DetectorGuide from './DetectorGuide';

interface DetectorInputProps {
  state: NotebookState;
  onUpdate: (updates: Partial<NotebookState>) => void;
  navigateToView: (view: DetectorView) => void;
  onNavigateHome: () => void;
}

const DetectorInput: React.FC<DetectorInputProps> = ({
  state,
  onUpdate,
  navigateToView,
  onNavigateHome
}) => {
  const toast = useToast();
  const { paste } = useClipboard();
  
  const [transcript, setTranscript] = useState('');
  const [durationDisplay, setDurationDisplay] = useState('00:00');
  const hasLoadedDraft = useRef(false);

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

  // Load draft from state on mount
  useEffect(() => {
    const detectorDrafts = state.drafts || {};
    const detectorKeys = Object.keys(detectorDrafts).filter(key => key.startsWith('detector_'));
    
    if (detectorKeys.length > 0 && !hasLoadedDraft.current) {
      // Load the most recent draft
      const latestKey = detectorKeys.sort().pop()!;
      const draft = detectorDrafts[latestKey] as DetectorUIState;
      
      if (draft) {
        setTranscript(draft.transcript || '');
        toast.show('Loaded previous detector draft', 'info');
        hasLoadedDraft.current = true;
      }
    }
  }, [state.drafts, toast]);

  const handlePaste = async () => {
    const text = await paste();
    if (text) {
      setTranscript(text);
      toast.show('Transcript pasted from clipboard', 'success');
    } else {
      toast.show('Clipboard is empty or contains non-text content', 'error');
    }
  };

  const handleNext = async () => {
    if (!transcript.trim()) {
      toast.show('Please paste a transcript to analyze.', 'error');
      return;
    }

    // Validate duration format
    const durationMinutes = mmssToMinutes(durationDisplay);
    if (durationMinutes <= 0) {
      toast.show('Please enter a valid duration (mm:ss format).', 'error');
      return;
    }

    const draftTimestamp = Date.now();
    const newDraftKey = `detector_${draftTimestamp}`;

    const detectorData: DetectorUIState = {
      transcript,
      parsedResult: null, // No parsing needed
      timestamp: draftTimestamp,
      analyst1: undefined, // Clear previous analyst data
      analyst2: undefined,
      durationMinutes: durationMinutes,
    };

    onUpdate({
      ui: { 
        ...state.ui, 
        detectorView: 'analyst1',
        detectorDraftKey: newDraftKey  // Keep track of active detector draft
      },
      drafts: { ...state.drafts, [newDraftKey]: detectorData }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Gauge Preview - Truth Example */}
      <div className="flex justify-center">
        <GlassCard className="w-32 h-32 rounded-full p-0 flex items-center justify-center" variant="glassBlue">
          <div className="w-24 h-24 relative">
            {/* Truth example gauge */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
                className="dark:stroke-gray-600"
              />
              {/* Progress arc - showing LOW risk (truthful) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#10b981"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * 0.7}`}
                transform="rotate(-90 50 50)"
              />
              {/* Risk Level Text */}
              <text
                x="50"
                y="50"
                textAnchor="middle"
                className="text-lg font-bold fill-gray-900 dark:fill-white"
              >
                LOW
              </text>
              <text
                x="50"
                y="65"
                textAnchor="middle"
                className="text-xs font-medium fill-gray-500 dark:fill-gray-400"
              >
                RISK
              </text>
            </svg>
          </div>
        </GlassCard>
      </div>

      {/* Educational Guide */}
      <DetectorGuide />

      {/* Instructions Card */}
      <GlassCard className="p-6" variant="glassBlue" borderGradient="blue">
        <h3 className="card-title">Instructions</h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>• Paste any AI conversation or text</li>
          <li>• You'll evaluate it using 2 different AI models</li>
          <li>• The analysis focuses on structural deception patterns</li>
        </ul>
      </GlassCard>



      {/* Transcript Input */}
      <GlassCard className="p-6" variant="glassBlue" borderGradient="blue">
        <div className="flex justify-between items-center mb-4">
          <h3 className="card-title">Transcript Input</h3>
          <button
            onClick={handlePaste}
            className="btn-secondary text-sm flex items-center gap-1"
          >
            📋 Paste
          </button>
        </div>

        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste your AI conversation here...

Example:
User: What is the capital of France?
Assistant: The capital of France is Paris. It's located in the north-central part of the country and is known for landmarks like the Eiffel Tower and the Louvre Museum.
User: Can you tell me more about Paris?
Assistant: Certainly! Paris is not only the capital but also the largest city in France..."
          rows={12}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm resize-y"
        />

        {/* Template Button */}
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => {
              const template = `I said: 

AI said: 

I said: 

AI said: 

I said: 

AI said: `;
              setTranscript(template);
            }}
            className="btn-secondary text-sm flex items-center gap-1"
          >
            📝 Use Template
          </button>
        </div>
      </GlassCard>

      {/* Duration Input */}
      <GlassCard className="p-6" variant="glassBlue" borderGradient="blue">
        <div>
          <label className="label-text">Approximate Duration (mm:ss) *</label>
          <input
            type="text"
            value={durationDisplay}
            onChange={(e) => setDurationDisplay(e.target.value)}
            placeholder="15:30"
            pattern="[0-9]{1,3}:[0-5][0-9]"
            className="input-field font-mono"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            ⏱️ Approximate time for the entire conversation. Format: minutes:seconds (e.g., 15:30)
          </p>
        </div>
      </GlassCard>

      {/* Navigation */}
      <div className="flex justify-between pt-4 pb-6 border-t border-gray-200 dark:border-gray-700">
        <button onClick={onNavigateHome} className="btn-secondary">
          ← Back to Home
        </button>
        <button
          onClick={handleNext}
          className="btn-primary"
          disabled={!transcript.trim() || !durationDisplay.trim() || mmssToMinutes(durationDisplay) <= 0}
        >
          Start Analysis →
        </button>
      </div>

      {(!transcript.trim() || !durationDisplay.trim() || mmssToMinutes(durationDisplay) <= 0) && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center pb-4">
          {!transcript.trim() 
            ? 'Please enter a transcript'
            : !durationDisplay.trim()
              ? 'Please enter a duration'
              : 'Please enter a valid duration (mm:ss format)'
          }
        </p>
      )}
    </div>
  );
};

export default DetectorInput;
