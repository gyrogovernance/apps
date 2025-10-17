import React from 'react';
import { NotebookState, Section } from '../types';
import { getActiveSession } from '../lib/session-helpers';

interface ProgressDashboardProps {
  state: NotebookState;
  onNavigate: (section: Section) => void;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ state, onNavigate }) => {
  const session = getActiveSession(state);
  
  // Use session data if available, otherwise fall back to legacy state
  const sections = [
    { 
      key: 'setup' as Section, 
      label: 'Setup', 
      icon: '📋',
      completed: session ? !!session.challenge.title : state.challenge.title !== '',
      estimate: '2 min'
    },
    { 
      key: 'epoch1' as Section, 
      label: 'Epoch 1', 
      icon: '1️⃣',
      completed: session ? session.epochs.epoch1.completed : state.epochs.epoch1.completed,
      estimate: '10-15 min'
    },
    { 
      key: 'analyst1_epoch1' as Section, 
      label: 'Analyst 1 - Epoch 1', 
      icon: '🔬',
      completed: session ? session.analysts.epoch1.analyst1.status === 'complete' : false,
      estimate: '3-5 min'
    },
    { 
      key: 'analyst2_epoch1' as Section, 
      label: 'Analyst 2 - Epoch 1', 
      icon: '🔬',
      completed: session ? session.analysts.epoch1.analyst2.status === 'complete' : false,
      estimate: '3-5 min'
    },
    { 
      key: 'epoch2' as Section, 
      label: 'Epoch 2', 
      icon: '2️⃣',
      completed: session ? session.epochs.epoch2.completed : state.epochs.epoch2.completed,
      estimate: '10-15 min'
    },
    { 
      key: 'analyst1_epoch2' as Section, 
      label: 'Analyst 1 - Epoch 2', 
      icon: '🔬',
      completed: session ? session.analysts.epoch2.analyst1.status === 'complete' : false,
      estimate: '3-5 min'
    },
    { 
      key: 'analyst2_epoch2' as Section, 
      label: 'Analyst 2 - Epoch 2', 
      icon: '🔬',
      completed: session ? session.analysts.epoch2.analyst2.status === 'complete' : false,
      estimate: '3-5 min'
    },
    { 
      key: 'report' as Section, 
      label: 'Report', 
      icon: '📊',
      completed: state.results !== null,
      estimate: '1 min'
    }
  ];

  const currentIndex = sections.findIndex(s => s.key === state.ui.currentSection);
  const completedCount = sections.filter(s => s.completed).length;
  const progressPercent = (completedCount / sections.length) * 100;
  const currentSection = sections[currentIndex];

  return (
    <div className="space-y-2 mx-3 mb-3 mt-4">
      {/* Progress bar with percentage */}
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {currentSection ? `${currentSection.label} (${currentSection.estimate})` : 'Progress'}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {completedCount}/{sections.length} complete
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Section indicators with icons */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
        {sections.map((section, index) => (
          <button
            key={section.key}
            onClick={() => onNavigate(section.key)}
            disabled={!section.completed && index > currentIndex + 1}
            className={`flex flex-col items-center px-1.5 py-1.5 rounded transition-all flex-shrink-0 ${
              index === currentIndex
                ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-300 dark:ring-blue-700'
                : section.completed
                ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 opacity-60'
            } disabled:cursor-not-allowed disabled:opacity-40`}
            title={`${section.label} - ${section.estimate}`}
          >
            <span className="text-lg mb-0.5">{section.completed ? '✓' : section.icon}</span>
            <span className="text-[10px] font-medium whitespace-nowrap leading-tight">{section.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProgressDashboard;

