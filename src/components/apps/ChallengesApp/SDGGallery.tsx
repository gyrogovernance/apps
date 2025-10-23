import React, { useState } from 'react';
import { SDG_CHALLENGES } from '../../../lib/challenges';
import { ChallengeType } from '../../../types';
import GlassCard from '../../shared/GlassCard';

interface SDGGalleryProps {
  onSelect: (challengeId: string) => void;
  onBack: () => void;
}

const SDGGallery: React.FC<SDGGalleryProps> = ({ onSelect, onBack }) => {
  const [selectedFilter, setSelectedFilter] = useState<ChallengeType | 'all'>('all');
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);

  const filteredChallenges = selectedFilter === 'all'
    ? SDG_CHALLENGES
    : SDG_CHALLENGES.filter(c => c.type === selectedFilter);

  const selectedChallengeData = selectedChallenge 
    ? SDG_CHALLENGES.find(c => c.id === selectedChallenge)
    : null;

  if (selectedChallengeData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => setSelectedChallenge(null)}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 text-sm flex items-center gap-1"
        >
          ← Back to SDG Gallery
        </button>

        <GlassCard className="mb-6 p-6" variant="glassGreen" borderGradient="green">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">{selectedChallengeData.icon}</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {selectedChallengeData.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedChallengeData.description}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-sm rounded-full">
              {selectedChallengeData.type}
            </span>
            {selectedChallengeData.domain.map(d => (
              <span key={d} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full">
                {d}
              </span>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="mb-6 p-6" density="dense">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            📋 Challenge Prompt
          </h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans">
            {selectedChallengeData.prompt}
          </pre>
        </GlassCard>

        <div className="flex gap-4">
          <button
            onClick={() => onSelect(selectedChallengeData.id)}
            className="flex-1 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Use This Challenge
          </button>
          <button
            onClick={() => setSelectedChallenge(null)}
            className="px-6 py-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <button
        onClick={onBack}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 text-sm flex items-center gap-1"
      >
        ← Back to Challenge Selection
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-3">
          <span>🌍</span>
          <span>UN Sustainable Development Goals</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Select a real-world governance challenge to evaluate your AI model (17 goals available)
        </p>
      </div>

      {/* Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          All Goals ({SDG_CHALLENGES.length})
        </button>
        {(['normative', 'strategic', 'epistemic', 'procedural'] as ChallengeType[]).map(type => {
          const count = SDG_CHALLENGES.filter(c => c.type === type).length;
          return (
            <button
              key={type}
              onClick={() => setSelectedFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} ({count})
            </button>
          );
        })}
      </div>

      {/* SDG Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChallenges.map((challenge) => (
          <GlassCard
            key={challenge.id}
            onClick={() => setSelectedChallenge(challenge.id)}
            hover
            className="p-5 text-left group"
            borderGradient="green"
          >
            <div className="text-4xl mb-3">{challenge.icon}</div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {challenge.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {challenge.description}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                {challenge.type}
              </span>
            </div>
          </GlassCard>
        ))}
      </div>

      {filteredChallenges.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No challenges found for this filter
        </div>
      )}
    </div>
  );
};

export default SDGGallery;

