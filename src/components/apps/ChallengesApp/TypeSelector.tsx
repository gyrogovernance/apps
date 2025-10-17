import React from 'react';
import { ChallengesView } from '../../../types';

interface TypeSelectorProps {
  onNavigate: (view: ChallengesView) => void;
}

const TypeSelector: React.FC<TypeSelectorProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto p-3 mt-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        📋 Select Challenge Type
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
        Choose how you want to evaluate your AI model
      </p>

      {/* GyroDiagnostics Suite - Featured */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🎯</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              GyroDiagnostics Evaluation Suite
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm">
              Complete 5-challenge assessment across all governance dimensions: 
              Formal, Normative, Procedural, Strategic, and Epistemic.
            </p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                ⏱️ 1h
              </span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 text-xs rounded-full">
                📊 Full Report
              </span>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                ✓ Recommended
              </span>
            </div>
            <button
              onClick={() => onNavigate('gyro-suite')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Start Full Suite →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Challenge Templates */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          🎨 Quick Challenge Templates
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Select an individual challenge type for focused evaluation
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { type: 'formal', icon: '🧮', label: 'Formal', desc: 'Physics & Math' },
            { type: 'normative', icon: '⚖️', label: 'Normative', desc: 'Policy & Ethics' },
            { type: 'procedural', icon: '💻', label: 'Procedural', desc: 'Code & Debug' },
            { type: 'strategic', icon: '🎲', label: 'Strategic', desc: 'Finance & Strategy' },
            { type: 'epistemic', icon: '🔍', label: 'Epistemic', desc: 'Knowledge & Comm.' }
          ].map(challenge => (
            <button
              key={challenge.type}
              onClick={() => onNavigate('custom-builder')}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:shadow-md transition-all text-left"
            >
              <div className="text-3xl mb-2">{challenge.icon}</div>
              <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {challenge.label}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {challenge.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* SDG Challenges */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl">🌍</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              UN Sustainable Development Goals
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Evaluate AI models on real-world governance challenges (17 goals)
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('sdg-gallery')}
          className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 hover:shadow-md transition-all flex items-center justify-between"
        >
          <span className="font-medium text-gray-900 dark:text-gray-100">
            View SDG Challenge Gallery
          </span>
          <span className="text-gray-400">→</span>
        </button>
      </div>

      {/* Custom Challenge */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl">✏️</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Custom Challenge
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create your own governance challenge with AI-assisted prompt design
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('custom-builder')}
          className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:shadow-md transition-all flex items-center justify-between"
        >
          <span className="font-medium text-gray-900 dark:text-gray-100">
            Create Custom Challenge
          </span>
          <span className="text-gray-400">→</span>
        </button>
      </div>
    </div>
  );
};

export default TypeSelector;

