import React from 'react';
import { GYRO_SUITE } from '../../../lib/challenges';
import { ChallengesView } from '../../../types';
import { challengeColorMap } from '../../../lib/ui-utils';
import GlassCard from '../../shared/GlassCard';

interface GyroSuiteViewProps {
  onStart: () => void;
  onBack: () => void;
}

const GyroSuiteView: React.FC<GyroSuiteViewProps> = ({ onStart, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto p-3 mt-4">
      <button
        onClick={onBack}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 text-sm flex items-center gap-1"
      >
        ← Back to Challenge Selection
      </button>

      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🎯</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {GYRO_SUITE.title}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {GYRO_SUITE.description}
        </p>
      </div>

      {/* Challenge Cards */}
      <div className="grid gap-3 mb-8">
        {GYRO_SUITE.challenges.map((challenge, index) => {
          const colors = challengeColorMap[challenge.color] || challengeColorMap.blue;
          // Map challenge colors to valid borderGradient values
          const borderGradient = challenge.color === 'orange' ? 'pink' :
                                 challenge.color === 'red' ? 'pink' :
                                 challenge.color as 'blue' | 'purple' | 'green' | 'pink';
          return (
            <GlassCard
              key={challenge.type}
              className="p-2.5"
              borderGradient={borderGradient}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl flex-shrink-0">{challenge.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {index + 1}. {challenge.label}
                    </h3>
                    <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${colors.bg} ${colors.text}`}>
                      {challenge.domains}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                    {challenge.description}
                  </p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-3 mb-8">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-xl mb-1.5">⏱️</div>
          <div className="font-semibold text-gray-900 dark:text-gray-100 mb-0.5 text-sm">
            Estimated Time
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {GYRO_SUITE.estimatedTime}
          </div>
        </div>
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-xl mb-1.5">📊</div>
          <div className="font-semibold text-gray-900 dark:text-gray-100 mb-0.5 text-sm">
            Output
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            QI, SI, AR metrics
          </div>
        </div>
        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="text-xl mb-1.5">🔬</div>
          <div className="font-semibold text-gray-900 dark:text-gray-100 mb-0.5 text-sm">
            Process
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            2 epochs × 2 analysts
          </div>
        </div>
      </div>

      {/* What You'll Do */}
      <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Steps
        </h3>
        <ol className="space-y-3 text-gray-700 dark:text-gray-300">
          <li className="flex gap-3">
            <span className="font-bold text-blue-600 dark:text-blue-400">1.</span>
            <span>Complete 5 challenges (pausable)</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-blue-600 dark:text-blue-400">2.</span>
            <span>Run 2 epochs per challenge</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-blue-600 dark:text-blue-400">3.</span>
            <span>Get 2 analyst evaluations</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-blue-600 dark:text-blue-400">4.</span>
            <span>Receive full report</span>
          </li>
        </ol>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onStart}
          className="flex-1 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-lg"
        >
          Start →
        </button>
        <button
          onClick={onBack}
          className="px-6 py-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Help Text */}
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
        💡 ~1 hour (pausable)
      </p>
    </div>
  );
};

export default GyroSuiteView;

