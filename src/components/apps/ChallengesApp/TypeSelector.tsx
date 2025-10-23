import React from 'react';
import { ChallengesView } from '../../../types';
import GlassCard from '../../shared/GlassCard';

interface TypeSelectorProps {
  onNavigate: (view: ChallengesView) => void;
}

const TypeSelector: React.FC<TypeSelectorProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto p-3 mt-4">

      {/* Custom Challenge - First */}
      <GlassCard className="mb-6" variant="glassPurple" borderGradient="purple">
        <div className="flex items-start gap-3 mb-3">
          <div className="text-3xl">✏️</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              Custom Challenge
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm">
              Create your own governance challenge with AI-assisted prompt design
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                ✏️ Custom
              </span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 text-xs rounded-full">
                🥸 Personal
              </span>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => onNavigate('custom-builder')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            Create Custom Challenge →
          </button>
        </div>
      </GlassCard>

      {/* SDG Challenges - Second */}
      <GlassCard className="mb-6" variant="glassGreen" borderGradient="green">
        <div className="flex items-start gap-3 mb-3">
          <div className="text-3xl">🌍</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              UN Sustainable Development Goals
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm">
              Evaluate AI models on real-world governance challenges (17 goals)
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 text-xs rounded-full">
                🌍 17 Goals
              </span>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                🌐 Real-world
              </span>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => onNavigate('sdg-gallery')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            View SDG Challenge Gallery →
          </button>
        </div>
      </GlassCard>

      {/* GyroDiagnostics Suite - Last */}
      <GlassCard className="mb-6" variant="glassBlue" borderGradient="blue">
        <div className="flex items-start gap-3 mb-3">
          <div className="text-3xl">🌟</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              GyroDiagnostics Evaluation Suite
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm">
              Complete 5-challenge assessment across all governance dimensions: 
              1. Formal, 2. Normative, 3. Procedural, 4. Strategic, and 5. Epistemic.
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                ⏱️ 1h
              </span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 text-xs rounded-full">
                📊 Full Report
              </span>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => onNavigate('gyro-suite')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            Start Full Suite →
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default TypeSelector;

