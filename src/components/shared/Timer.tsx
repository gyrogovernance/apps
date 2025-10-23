// Manual Timer Component for epoch timing
import React, { useState, useEffect, useRef } from 'react';
import { 
  formatTime, 
  secondsToMinutes,
  secondsToMinutesPrecise,
  saveTimerState, 
  loadTimerState,
  INITIAL_TIMER_STATE,
  type TimerState 
} from '../../lib/timer';

interface TimerProps {
  sessionId: string;
  epochKey: 'epoch1' | 'epoch2';
  initialDuration?: number; // Duration from session storage (in minutes)
  onDurationChange?: (minutes: number) => void;
  className?: string;
}

export const Timer: React.FC<TimerProps> = React.memo(({ 
  sessionId, 
  epochKey, 
  initialDuration = 0,
  onDurationChange,
  className = '' 
}) => {
  const [state, setState] = useState<TimerState>(() => {
    // Priority 1: Use session storage value if available
    if (initialDuration > 0) {
      return {
        isRunning: false,
        elapsedSeconds: Math.round(initialDuration * 60),
        startTime: null
      };
    }
    // Priority 2: Try localStorage as fallback
    const saved = loadTimerState(sessionId, epochKey);
    if (saved) {
      return saved;
    }
    // Priority 3: Start fresh
    return INITIAL_TIMER_STATE;
  });
  
  const intervalRef = useRef<number | null>(null);

  // Reset timer when session or epoch changes (critical for suite transitions)
  useEffect(() => {
    // Stop any running timer first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (initialDuration > 0) {
      setState({
        isRunning: false,
        elapsedSeconds: Math.round(initialDuration * 60),
        startTime: null
      });
    } else {
      const saved = loadTimerState(sessionId, epochKey);
      setState(saved || INITIAL_TIMER_STATE);
    }
  }, [sessionId, epochKey, initialDuration]);

  // Sync elapsed time to parent (use precise minutes for AR calculation)
  useEffect(() => {
    if (onDurationChange) {
      const minutes = secondsToMinutesPrecise(state.elapsedSeconds);
      onDurationChange(minutes);
    }
  }, [state.elapsedSeconds, onDurationChange]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveTimerState(sessionId, epochKey, state);
  }, [sessionId, epochKey, state]);

  // Timer tick effect
  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = window.setInterval(() => {
        setState(prev => ({
          ...prev,
          elapsedSeconds: prev.elapsedSeconds + 1
        }));
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning]);

  const handleStartPause = () => {
    setState(prev => ({
      ...prev,
      isRunning: !prev.isRunning,
      startTime: !prev.isRunning ? Date.now() : prev.startTime
    }));
  };

  const handleReset = () => {
    setState(INITIAL_TIMER_STATE);
    if (onDurationChange) {
      onDurationChange(0);
    }
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">TIMER</span>
        <div className="text-lg font-mono font-bold text-gray-900 dark:text-gray-100 tabular-nums">
          {formatTime(state.elapsedSeconds)}
        </div>
      </div>
      
      <div className="flex gap-1 ml-auto">
        <button
          onClick={handleStartPause}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            state.isRunning 
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
          title={state.isRunning ? 'Pause timer' : 'Start timer'}
        >
          {state.isRunning ? '⏸' : '▶'}
        </button>
        
        <button
          onClick={handleReset}
          className="px-2 py-1 rounded text-xs font-medium bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
          title="Reset timer to 00:00"
        >
          ↺
        </button>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 ml-1">
        ≈ {secondsToMinutes(state.elapsedSeconds)} min
      </div>
    </div>
  );
});

