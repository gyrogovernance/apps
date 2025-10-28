import React from 'react';
import { ChallengesView } from '../../../types';
import GlassCard from '../../shared/GlassCard';

interface TypeSelectorProps {
  onNavigate: (view: ChallengesView) => void;
}

const TypeSelector: React.FC<TypeSelectorProps> = ({ onNavigate }) => {
  return (
    <div className="w-full px-3 py-4 space-y-2.5">
      {/* Custom Challenge - First */}
      <GlassCard 
        variant="glassPurple" 
        borderGradient="purple"
        hover
        onClick={() => onNavigate('custom-builder')}
        className="cursor-pointer"
      >
        <div className="p-2.5">
          <div className="flex items-center gap-2.5">
            <span className="text-xl flex-shrink-0">✏️</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5 leading-tight">
                Custom Challenge
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight mb-1.5">
                Create custom challenge with AI assistance
              </p>
              <div className="flex flex-wrap gap-1">
                <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                  ✏️ Custom
                </span>
                <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 text-xs rounded-full">
                  🥸 Personal
                </span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* SDG Challenges - Second */}
      <GlassCard 
        variant="glassGreen" 
        borderGradient="green"
        hover
        onClick={() => onNavigate('sdg-gallery')}
        className="cursor-pointer"
      >
        <div className="p-2.5">
          <div className="flex items-center gap-2.5">
            <span className="text-xl flex-shrink-0">🌍</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5 leading-tight">
                SDG Challenges
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight mb-1.5">
                17 real-world governance challenges
              </p>
              <div className="flex flex-wrap gap-1">
                <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 text-xs rounded-full">
                  🌍 17 Goals
                </span>
                <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                  🌐 Real-world
                </span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* GyroDiagnostics Suite - Last */}
      <GlassCard 
        variant="glassBlue" 
        borderGradient="blue"
        hover
        onClick={() => onNavigate('gyro-suite')}
        className="cursor-pointer"
      >
        <div className="p-2.5">
          <div className="flex items-center gap-2.5">
            <span className="text-xl flex-shrink-0">🌟</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5 leading-tight">
                GyroDiagnostics Suite
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight mb-1.5">
                Complete 5-challenge assessment
              </p>
              <div className="flex flex-wrap gap-1">
                <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                  ⏱️ 1h
                </span>
                <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 text-xs rounded-full">
                  📊 Full Report
                </span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default TypeSelector;

