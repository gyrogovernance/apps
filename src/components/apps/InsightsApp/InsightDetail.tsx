import React from 'react';
import { GovernanceInsight, AlignmentCategory } from '../../../types';
import { exportAsMarkdown, exportAsJSON } from '../../../lib/export';
import { getScoreColor, getAlignmentBadgeColor } from '../../../lib/ui-utils';

interface InsightDetailProps {
  insight: GovernanceInsight;
  onBack: () => void;
}

const InsightDetail: React.FC<InsightDetailProps> = ({ insight, onBack }) => {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'structure' | 'behavior' | 'specialization' | 'transcript'>('overview');

  const handleExportMarkdown = () => {
    const markdown = exportAsMarkdown(insight);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insight_${insight.challenge.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const json = exportAsJSON(insight);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insight_${insight.challenge.title.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJSON = async () => {
    const json = exportAsJSON(insight);
    await navigator.clipboard.writeText(json);
    alert('JSON copied to clipboard!');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <button
        onClick={onBack}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 text-sm flex items-center gap-1"
      >
        ← Back to Library
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          {insight.challenge.title}
        </h1>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-sm rounded-full">
            {insight.challenge.type}
          </span>
          {insight.challenge.domain.map(d => (
            <span key={d} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full">
              {d}
            </span>
          ))}
          <span className="px-3 py-1 text-gray-600 dark:text-gray-400 text-sm">
            {new Date(insight.process.created_at).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Quality Metrics Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Quality Index</div>
          <div className={`text-3xl font-bold mb-1 ${getScoreColor(insight.quality.quality_index / 10)}`}>
            {insight.quality.quality_index.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Overall quality score
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Superintelligence Index</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {insight.quality.superintelligence_index.toFixed(2)}
          </div>
          <details className="text-xs mt-2">
            <summary className="cursor-pointer text-green-700 dark:text-green-300 hover:underline">
              Show SI Details
            </summary>
            <div className="mt-2 space-y-1 text-gray-600 dark:text-gray-400">
              <p>Target Aperture: 0.0207 (K=4)</p>
              <p>Deviation: {insight.quality.si_deviation.toFixed(2)}× from target</p>
              <p className="text-xs mt-2">
                SI measures behavior score spread using K4 spherical aperture geometry.
                Lower deviation indicates more balanced performance.
              </p>
            </div>
          </details>
        </div>

        <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">Alignment</div>
          <div className="mb-2">
            <span className={`px-3 py-1 text-sm font-bold rounded-full border ${getAlignmentBadgeColor(insight.quality.alignment_rate_category)}`}>
              {insight.quality.alignment_rate_category}
            </span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Rate: {insight.quality.alignment_rate.toFixed(4)}/min
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex gap-4">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'structure', label: 'Structure' },
            { id: 'behavior', label: 'Behavior' },
            { id: 'specialization', label: 'Specialization' },
            { id: 'transcript', label: 'Transcript' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mb-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Summary</h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {insight.insights.summary}
              </p>
            </div>

            {insight.quality.pathologies.detected.length > 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <span>🔬</span>
                  <span>Detected Pathologies ({insight.quality.pathologies.detected.length})</span>
                </h3>
                <ul className="space-y-2">
                  {insight.quality.pathologies.detected.map((pathology, idx) => (
                    <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                      <span className="text-red-600 dark:text-red-400">•</span>
                      <span>{pathology}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Models Used</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Synthesis Epochs</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Epoch 1: {insight.process.models_used.synthesis_epoch1}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Epoch 2: {insight.process.models_used.synthesis_epoch2}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Analyst Models</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Analyst 1: {insight.process.models_used.analyst1}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Analyst 2: {insight.process.models_used.analyst2}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'structure' && (
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(insight.quality.structure_scores).map(([key, value]) => (
              <div key={key} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 capitalize">
                  {key}
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(value)}`}>
                  {value.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'behavior' && (
          <div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {Object.entries(insight.quality.behavior_scores).map(([key, value]) => (
                <div key={key} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 capitalize">
                    {key}
                  </div>
                  <div className={`text-2xl font-bold ${typeof value === 'number' ? getScoreColor(value) : 'text-gray-500 dark:text-gray-400'}`}>
                    {typeof value === 'number' ? value.toFixed(1) : value}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>ℹ️ N/A Handling:</strong> Comparison and Preference scores may be "N/A" when not applicable to the challenge.
                N/A metrics are <strong>excluded from QI calculation</strong> and <strong>zero-filled in SI vector</strong> as required by geometry.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'specialization' && (
          <div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {Object.entries(insight.quality.specialization_scores).map(([key, value]) => (
                <div key={key} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {key}
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(value)}`}>
                    {value.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
            {Object.keys(insight.quality.specialization_scores).length === 0 && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                <p>
                  ℹ️ No specialization scores recorded. When empty, the average defaults to 7.0 per GyroDiagnostics spec.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'transcript' && (
          <div className="space-y-6">
            {insight.transcripts ? (
              <>
                {/* Raw Transcripts */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <span>📝</span>
                    <span>Epoch 1 Synthesis</span>
                  </h3>
                  <div className="space-y-4">
                    {insight.transcripts.epoch1.map((turn, i) => (
                      <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          Turn {i + 1}
                        </div>
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                          {turn}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <span>📝</span>
                    <span>Epoch 2 Synthesis</span>
                  </h3>
                  <div className="space-y-4">
                    {insight.transcripts.epoch2.map((turn, i) => (
                      <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          Turn {i + 1}
                        </div>
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                          {turn}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analyst Insights */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    🔬 Analyst Evaluations
                  </h3>
                  <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                      {insight.insights.combined_markdown}
                    </pre>
                  </div>
                </div>
              </>
            ) : (
              /* Fallback for old insights without transcripts */
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  ℹ️ This insight was generated before transcript persistence was enabled.
                  Only analyst evaluations are available.
                </p>
                <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                  {insight.insights.combined_markdown}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Export Actions */}
      <div className="flex flex-wrap gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <button
          onClick={handleExportMarkdown}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          📄 Export Markdown
        </button>
        <button
          onClick={handleExportJSON}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
        >
          📊 Export JSON
        </button>
        <button
          onClick={handleCopyJSON}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
        >
          📋 Copy JSON
        </button>
      </div>
    </div>
  );
};

export default InsightDetail;

