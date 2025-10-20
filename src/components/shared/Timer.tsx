// Manual Timer Component for epoch timing
import React, { useState, useEffect, useRef } from 'react';
import { 
  formatTime, 
  secondsToMinutes,
  saveTimerState, 
  loadTimerState,
  INITIAL_TIMER_STATE,
  type TimerState 
} from '../../lib/timer';

interface TimerProps {
  sessionId: string;
  epochKey: 'epoch1' | 'epoch2';
  onDurationChange?: (minutes: number) => void;
  className?: string;
}

export const Timer: React.FC<TimerProps> = ({ 
  sessionId, 
  epochKey, 
  onDurationChange,
  className = '' 
}) => {
  const [state, setState] = useState<TimerState>(() => {
    // Load saved state on mount
    const saved = loadTimerState(sessionId, epochKey);
    return saved || INITIAL_TIMER_STATE;
  });
  
  const intervalRef = useRef<number | null>(null);

  // Sync elapsed time to parent
  useEffect(() => {
    if (onDurationChange) {
      const minutes = secondsToMinutes(state.elapsedSeconds);
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
};

