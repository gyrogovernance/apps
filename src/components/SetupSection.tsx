import React, { useState } from 'react';
import { NotebookState, ChallengeType, Platform } from '../types';

interface SetupSectionProps {
  state: NotebookState;
  onUpdate: (updates: Partial<NotebookState> | ((prev: NotebookState) => Partial<NotebookState>)) => void;
  onNext: () => void;
}

const CHALLENGE_TYPES: { value: ChallengeType; label: string; description: string }[] = [
  { value: 'normative', label: 'Normative', description: 'Values, ethics, rights' },
  { value: 'strategic', label: 'Strategic', description: 'Planning, resource allocation' },
  { value: 'epistemic', label: 'Epistemic', description: 'Knowledge, truth, justification' },
  { value: 'procedural', label: 'Procedural', description: 'Process, fairness, participation' },
  { value: 'formal', label: 'Formal', description: 'Mathematical, logical reasoning' },
  { value: 'custom', label: 'Custom', description: 'Your own category' }
];

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'lmarena', label: 'LMArena' },
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'claude', label: 'Claude' },
  { value: 'poe', label: 'Poe' },
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

const SetupSection: React.FC<SetupSectionProps> = ({ state, onUpdate, onNext }) => {
  const [title, setTitle] = useState(state.challenge.title);
  const [description, setDescription] = useState(state.challenge.description);
  const [challengeType, setChallengeType] = useState(state.challenge.type);
  const [domains, setDomains] = useState<string[]>(state.challenge.domain);
  const [platform, setPlatform] = useState(state.process.platform);

  const toggleDomain = (domain: string) => {
    if (domains.includes(domain)) {
      setDomains(domains.filter(d => d !== domain));
    } else {
      setDomains([...domains, domain]);
    }
  };

  const handleNext = async () => {
    if (!title || !description) {
      alert('Please fill in the challenge title and description');
      return;
    }

    onUpdate(prev => ({
      challenge: {
        ...prev.challenge,
        title,
        description,
        type: challengeType,
        domain: domains
      },
      process: {
        ...prev.process,
        platform,
        started_at: prev.process.started_at || new Date().toISOString()
      }
    }));

    onNext(); // safe now because updateState is functional
  };

  return (
    <div className="section-card">
      <h2 className="section-header">
        <span>1. Participation: Define Your Challenge</span>
      </h2>

      <div className="space-y-3">
        {/* Challenge Title */}
        <div>
          <label className="label-text">Challenge Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Renewable Energy Transition Strategy"
            className="input-field"
          />
        </div>

        {/* Challenge Description */}
        <div>
          <label className="label-text">Challenge Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the governance challenge you want to explore..."
            rows={4}
            className="textarea-field"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            This will be provided to AI models for synthesis
          </p>
        </div>

        {/* Challenge Type */}
        <div>
          <label className="label-text">Challenge Type</label>
          <div className="grid grid-cols-2 gap-2">
            {CHALLENGE_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setChallengeType(type.value)}
                className={`p-3 text-left border rounded transition-colors ${
                  challengeType === type.value
                    ? 'border-primary bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{type.label}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{type.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Domain Selection */}
        <div>
          <label className="label-text">Domain(s)</label>
          <div className="flex flex-wrap gap-2">
            {DOMAIN_OPTIONS.map((domain) => (
              <button
                key={domain}
                onClick={() => toggleDomain(domain)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  domains.includes(domain)
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>

        {/* Platform Selection */}
        <div>
          <label className="label-text">AI Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
            className="input-field"
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

        {/* Next Button */}
        <div className="flex justify-end pt-2">
          <button onClick={handleNext} className="btn-primary">
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupSection;

