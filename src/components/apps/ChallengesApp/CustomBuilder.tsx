import React, { useState } from 'react';
import { ChallengeType, Platform } from '../../../types';
import { ChallengesView } from '../../../types';

interface CustomBuilderProps {
  onNavigate: (view: ChallengesView) => void;
  onStartSession: (challenge: {
    title: string;
    description: string;
    type: ChallengeType;
    domain: string[];
  }, platform: Platform) => void;
  onBack: () => void;
  prefilledType?: ChallengeType;
}

const CHALLENGE_TYPES: { value: ChallengeType; label: string; description: string; icon: string }[] = [
  { value: 'formal', icon: '🧮', label: 'Formal', description: 'Physics, mathematics, quantitative reasoning' },
  { value: 'normative', icon: '⚖️', label: 'Normative', description: 'Values, ethics, policy, rights' },
  { value: 'procedural', icon: '💻', label: 'Procedural', description: 'Code, debugging, systematic processes' },
  { value: 'strategic', icon: '🎲', label: 'Strategic', description: 'Planning, finance, resource allocation' },
  { value: 'epistemic', icon: '🔍', label: 'Epistemic', description: 'Knowledge, communication, evidence' },
  { value: 'custom', icon: '✏️', label: 'Custom', description: 'Your own category' }
];

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'claude', label: 'Claude' },
  { value: 'poe', label: 'Poe' },
  { value: 'lmarena', label: 'LMArena' },
  { value: 'custom', label: 'Custom' }
];

const DOMAIN_OPTIONS = [
  'SDG 1: No Poverty',
  'SDG 2: Zero Hunger',
  'SDG 3: Good Health and Well-being',
  'SDG 4: Quality Education',
  'SDG 5: Gender Equality',
  'SDG 6: Clean Water and Sanitation',
  'SDG 7: Affordable and Clean Energy',
  'SDG 8: Decent Work and Economic Growth',
  'SDG 9: Industry, Innovation and Infrastructure',
  'SDG 10: Reduced Inequality',
  'SDG 11: Sustainable Cities and Communities',
  'SDG 12: Responsible Consumption and Production',
  'SDG 13: Climate Action',
  'SDG 14: Life Below Water',
  'SDG 15: Life on Land',
  'SDG 16: Peace, Justice and Strong Institutions',
  'SDG 17: Partnerships for the Goals'
];

const CustomBuilder: React.FC<CustomBuilderProps> = ({ 
  onNavigate, 
  onStartSession, 
  onBack,
  prefilledType
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [challengeType, setChallengeType] = useState<ChallengeType>(prefilledType || 'custom');
  const [domains, setDomains] = useState<string[]>([]);
  const [platform, setPlatform] = useState<Platform>('custom');

  const toggleDomain = (domain: string) => {
    if (domains.includes(domain)) {
      setDomains(domains.filter(d => d !== domain));
    } else {
      setDomains([...domains, domain]);
    }
  };

  const handleStartSession = () => {
    if (!title || !description) {
      alert('Please fill in the challenge title and description');
      return;
    }

    onStartSession(
      { title, description, type: challengeType, domain: domains },
      platform
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={onBack}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 text-sm flex items-center gap-1"
      >
        ← Back to Challenge Selection
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          ✏️ Create Custom Challenge
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Define your own governance challenge or use templates to get started
        </p>
      </div>

      <div className="space-y-6">
        {/* Challenge Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Challenge Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., AI-Empowered Climate Adaptation Framework"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Challenge Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Challenge Description *
            </label>
            <button
              onClick={() => onNavigate('prompt-workshop')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
            >
              <span>🔧</span>
              <span>Open Prompt Workshop</span>
            </button>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the governance challenge you want to explore. Be specific about objectives, constraints, and expected outcomes..."
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            💡 This prompt will be provided to AI models for synthesis. Use the Prompt Workshop for help crafting an effective challenge.
          </p>
        </div>

        {/* Challenge Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Challenge Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CHALLENGE_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setChallengeType(type.value)}
                className={`p-3 text-left border-2 rounded-lg transition-all ${
                  challengeType === type.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{type.label}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{type.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Domain Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Domain(s) (Optional)
          </label>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
            {DOMAIN_OPTIONS.map((domain) => (
              <button
                key={domain}
                onClick={() => toggleDomain(domain)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  domains.includes(domain)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {domain}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Select relevant UN SDGs or other domains
          </p>
        </div>

        {/* Platform Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            AI Platform
          </label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Select the platform where you'll conduct the synthesis
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={handleStartSession}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Start Session →
          </button>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomBuilder;

