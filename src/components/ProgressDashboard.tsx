import React from 'react';
import { NotebookState, Section } from '../types';

interface ProgressDashboardProps {
  state: NotebookState;
  onNavigate: (section: Section) => void;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ state, onNavigate }) => {
  const sections = [
    { key: 'setup' as Section, label: 'Setup', completed: state.challenge.title !== '' },
    { key: 'epoch1' as Section, label: 'Epoch 1', completed: state.epochs.epoch1.completed },
    { key: 'epoch2' as Section, label: 'Epoch 2', completed: state.epochs.epoch2.completed },
    { key: 'analyst1' as Section, label: 'Analyst 1', completed: state.analysts.analyst1 !== null },
    { key: 'analyst2' as Section, label: 'Analyst 2', completed: state.analysts.analyst2 !== null },
    { key: 'report' as Section, label: 'Report', completed: state.results !== null }
  ];

  const currentIndex = sections.findIndex(s => s.key === state.ui.currentSection);
  const completedCount = sections.filter(s => s.completed).length;
  const progressPercent = (completedCount / sections.length) * 100;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-medium text-gray-700 dark:text-gray-300">Progress</span>
          <span className="text-gray-600 dark:text-gray-400">{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex gap-1 flex-shrink-0">
        {sections.map((section, index) => (
          <button
            key={section.key}
            onClick={() => onNavigate(section.key)}
            className={`px-1.5 py-1 rounded text-xs font-medium transition-colors min-w-[24px] ${
              index === currentIndex
                ? 'bg-primary text-white'
                : section.completed
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title={section.label}
          >
            {section.completed ? '✓' : section.label.charAt(0)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProgressDashboard;

