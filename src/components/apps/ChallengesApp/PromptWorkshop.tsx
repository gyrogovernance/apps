import React, { useState, useEffect } from 'react';
import GlassCard from '../../shared/GlassCard';
import { useClipboard } from '../../../hooks/useClipboard';

interface PromptWorkshopProps {
  onBack: () => void;
  initialPrompt?: string;
  onApply?: (prompt: string) => void;
}

interface QualityMetrics {
  clarity: number;
  specificity: number;
  testability: number;
  suggestions: string[];
}

const PromptWorkshop: React.FC<PromptWorkshopProps> = ({ 
  onBack, 
  initialPrompt = '',
  onApply 
}) => {
  const { copy, status } = useClipboard();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [metrics, setMetrics] = useState<QualityMetrics>({
    clarity: 0,
    specificity: 0,
    testability: 0,
    suggestions: []
  });

  // Simple heuristic-based prompt analysis
  useEffect(() => {
    analyzePrompt(prompt);
  }, [prompt]);

  const analyzePrompt = (text: string) => {
    const wordCount = text.trim().split(/\s+/).length;
    const hasQuestions = /\?/.test(text);
    const hasMetrics = /\d+%|quantif|measur|metric|indicator|target/i.test(text);
    const hasConstraints = /must|should|requir|constraint|within|limit/i.test(text);
    const hasStakeholders = /stakeholder|communit|group|actor|participant|citizen/i.test(text);
    const hasStructure = /\d\./g.test(text) || /\n-/g.test(text);
    const hasGovernance = /governance|framework|policy|strateg|system/i.test(text);

    const suggestions: string[] = [];

    // Calculate scores
    let clarity = 50;
    if (wordCount > 50) clarity += 20;
    if (wordCount > 100) clarity += 15;
    if (hasStructure) clarity += 15;

    let specificity = 30;
    if (hasConstraints) specificity += 25;
    if (hasMetrics) specificity += 20;
    if (hasStakeholders) specificity += 15;
    if (hasGovernance) specificity += 10;

    let testability = 20;
    if (hasMetrics) testability += 30;
    if (hasConstraints) testability += 25;
    if (hasQuestions) testability += 15;
    if (hasStakeholders) testability += 10;

    // Generate suggestions
    if (!hasMetrics) {
      suggestions.push("Consider adding quantitative success criteria or measurable outcomes");
    }
    if (!hasStakeholders) {
      suggestions.push("Specify stakeholder perspectives or affected groups");
    }
    if (wordCount < 50) {
      suggestions.push("Provide more context and detail (aim for 100+ words)");
    }
    if (!hasConstraints) {
      suggestions.push("Add specific constraints, requirements, or boundaries");
    }
    if (!hasStructure) {
      suggestions.push("Structure your prompt with numbered points or sections");
    }
    if (!hasGovernance) {
      suggestions.push("Frame the challenge in governance terms (framework, policy, strategy)");
    }

    setMetrics({
      clarity: Math.min(100, clarity),
      specificity: Math.min(100, specificity),
      testability: Math.min(100, testability),
      suggestions
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const improvementTools = [
    {
      icon: '🎯',
      label: 'Add Objectives',
      description: 'Define clear, measurable goals',
      template: '\n\nObjectives:\n1. [Primary goal]\n2. [Secondary goal]\n3. [Success metrics]'
    },
    {
      icon: '👥',
      label: 'Specify Stakeholders',
      description: 'Identify affected groups',
      template: '\n\nKey Stakeholders:\n- [Stakeholder group 1]\n- [Stakeholder group 2]\n- [Affected communities]'
    },
    {
      icon: '⚖️',
      label: 'Add Constraints',
      description: 'Define boundaries and limits',
      template: '\n\nConstraints:\n- Resource limits: [specify]\n- Time horizon: [specify]\n- Regulatory requirements: [specify]'
    },
    {
      icon: '📊',
      label: 'Include Metrics',
      description: 'Add measurable indicators',
      template: '\n\nSuccess Metrics:\n- [Quantitative indicator 1]\n- [Quantitative indicator 2]\n- [Evaluation criteria]'
    }
  ];

  const handleApplyTool = (template: string) => {
    setPrompt(prev => prev + template);
  };

  const handleApply = () => {
    if (onApply) {
      onApply(prompt);
    }
    onBack();
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <button
        onClick={onBack}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 text-sm flex items-center gap-1"
      >
        ← Back to Custom Builder
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
          <span>🔧</span>
          <span>Prompt Design Workshop</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Craft effective governance challenges with AI-powered quality analysis
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Prompt Editor */}
        <div className="space-y-4">
          <GlassCard className="p-4" density="dense">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Challenge Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your governance challenge here..."
              rows={16}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {prompt.trim().split(/\s+/).length} words
              </p>
              
              {/* Copy Button */}
              {prompt.trim() && (
                <button
                  onClick={() => copy(prompt)}
                  className="px-3 py-1 text-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded transition-colors flex items-center gap-1"
                  title="Copy to clipboard"
                >
                  {status === 'success' ? '✅ Copied' : status === 'error' ? '❌ Failed' : '📋 Copy'}
                </button>
              )}
            </div>
          </GlassCard>

          {/* Improvement Tools */}
          <GlassCard className="p-4" density="dense">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Tools
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {improvementTools.map(tool => (
                <button
                  key={tool.label}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleApplyTool(tool.template);
                  }}
                  className="p-3 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="text-xl mb-1">{tool.icon}</div>
                  <div className="text-xs font-medium text-gray-900 dark:text-gray-100">{tool.label}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{tool.description}</div>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right: Quality Analysis */}
        <div className="space-y-4">
          <GlassCard className="p-5" variant="glassBlue" borderGradient="blue">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              📊 Prompt Quality Indicators
            </h3>

            {/* Clarity */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Clarity</span>
                <span className={`text-sm font-bold ${getScoreColor(metrics.clarity)}`}>
                  {metrics.clarity}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(metrics.clarity)}`}
                  style={{ width: `${metrics.clarity}%` }}
                />
              </div>
            </div>

            {/* Specificity */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Specificity</span>
                <span className={`text-sm font-bold ${getScoreColor(metrics.specificity)}`}>
                  {metrics.specificity}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(metrics.specificity)}`}
                  style={{ width: `${metrics.specificity}%` }}
                />
              </div>
            </div>

            {/* Testability */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Testability</span>
                <span className={`text-sm font-bold ${getScoreColor(metrics.testability)}`}>
                  {metrics.testability}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(metrics.testability)}`}
                  style={{ width: `${metrics.testability}%` }}
                />
              </div>
            </div>
          </GlassCard>

          {/* Suggestions */}
          {metrics.suggestions.length > 0 && (
            <GlassCard className="p-5" variant="glassPurple" borderGradient="pink">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <span>💡</span>
                <span>Suggestions</span>
              </h3>
              <ul className="space-y-2">
                {metrics.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                    <span className="text-yellow-600 dark:text-yellow-400">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}

          {/* Best Practices */}
          <GlassCard className="p-5" density="dense">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Best Practices
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex gap-2">
                <span>•</span>
                <span>Specific objectives</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Stakeholder perspectives</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Quantifiable criteria</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Clear constraints</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Structured format</span>
              </li>
            </ul>
          </GlassCard>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        {onApply && (
          <button
            onClick={handleApply}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            disabled={!prompt.trim()}
          >
            Apply →
          </button>
        )}
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors"
        >
          {onApply ? 'Cancel' : 'Close'}
        </button>
      </div>
    </div>
  );
};

export default PromptWorkshop;

