import React from 'react';
import ReactMarkdown from 'react-markdown';
import { GovernanceInsight, AlignmentCategory } from '../../../types';
import { exportAsMarkdown, exportAsJSON } from '../../../lib/export';
import { getScoreColor, getAlignmentBadgeColor } from '../../../lib/ui-utils';
import { countWords, estimateTokens, formatTokenCount, formatPathologyName } from '../../../lib/text-utils';
import { CORE_METRICS, STRUCTURE_METRICS, BEHAVIOR_METRICS, METRIC_CATEGORIES } from '../../../lib/metric-definitions';
import { MetricCard, MetricSectionHeader } from '../../shared/MetricCard';
import { useToast } from '../../shared/Toast';

interface InsightDetailProps {
  insight: GovernanceInsight;
  onBack: () => void;
}

const InsightDetail: React.FC<InsightDetailProps> = ({ insight, onBack }) => {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'structure' | 'behavior' | 'specialization' | 'transcript'>('overview');
  const toast = useToast();

  // Memoize expensive ReactMarkdown rendering - only re-render when markdown changes
  const renderedInsights = React.useMemo(() => {
    if (!insight.insights?.combined_markdown) return null;
    
    return (
      <ReactMarkdown
        components={{
          h1: ({node, ...props}) => <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-6 mb-3" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-5 mb-2" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-4 mb-2" {...props} />,
          p: ({node, ...props}) => <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-3 space-y-1" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-3 space-y-1" {...props} />,
          li: ({node, ...props}) => <li className="text-gray-700 dark:text-gray-300" {...props} />,
          strong: ({node, ...props}) => <strong className="font-semibold text-gray-900 dark:text-gray-100" {...props} />,
          em: ({node, ...props}) => <em className="italic text-gray-800 dark:text-gray-200" {...props} />,
          code: ({node, inline, ...props}: any) => 
            inline 
              ? <code className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded text-xs font-mono" {...props} />
              : <code className="block p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded text-xs font-mono overflow-x-auto" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-green-400 dark:border-green-600 pl-4 italic text-gray-700 dark:text-gray-300 my-3" {...props} />,
        }}
      >
        {insight.insights.combined_markdown}
      </ReactMarkdown>
    );
  }, [insight.insights?.combined_markdown]);

  const handleExportMarkdown = () => {
    const markdown = exportAsMarkdown(insight);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insight_${insight.challenge.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.show('Markdown exported successfully', 'success');
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
    toast.show('JSON exported successfully', 'success');
  };

  const handleCopyJSON = async () => {
    const json = exportAsJSON(insight);
    await navigator.clipboard.writeText(json);
    toast.show('JSON copied to clipboard', 'success');
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
          {insight.challenge?.title || 'Untitled Insight'}
        </h1>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-sm rounded-full">
            {insight.challenge?.type || 'custom'}
          </span>
          {Array.isArray(insight.challenge?.domain) && insight.challenge.domain.map(d => (
            <span key={d} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full">
              {d}
            </span>
          ))}
          <span className="px-3 py-1 text-gray-600 dark:text-gray-400 text-sm">
            {insight.process?.created_at 
              ? new Date(insight.process.created_at).toLocaleString()
              : 'N/A'}
          </span>
        </div>
        {insight.challenge?.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {insight.challenge.description}
          </p>
        )}
      </div>

      {/* THE INSIGHTS - Main Content */}
      <div className="mb-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-2 border-green-300 dark:border-green-700 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💡</span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Insights on the Governance Challenge
            </h2>
          </div>
        </div>

        {/* Analyst Insights - THE MAIN CONTENT */}
        {renderedInsights && (
          <>
            <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
              {renderedInsights}
            </div>
            
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(insight.insights.combined_markdown);
                toast.show('Insights copied to clipboard', 'success');
              }}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white text-sm rounded-full transition-colors flex items-center gap-2"
            >
              <span>📋</span>
              <span>Copy Insights Text</span>
            </button>
          </>
        )}
      </div>

      {/* Quality Metrics Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {/* Quality Index */}
        <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">Quality Index</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{CORE_METRICS.qi.shortDesc}</div>
            </div>
            <div className={`text-3xl font-bold ml-3 ${getScoreColor((insight.quality?.quality_index || 0) / 10)}`}>
              {insight.quality?.quality_index ? insight.quality.quality_index.toFixed(1) : '0.0'}%
            </div>
          </div>
          <details className="mt-2">
            <summary className="cursor-pointer text-xs text-blue-700 dark:text-blue-300 hover:underline">
              Learn more
            </summary>
            <div className="mt-2 p-3 bg-white/50 dark:bg-gray-900/30 rounded text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {CORE_METRICS.qi.fullDesc}
              <div className="mt-2 pt-2 border-t border-blue-300 dark:border-blue-700 font-mono text-xs">
                <strong>Formula:</strong> {CORE_METRICS.qi.formula}
              </div>
            </div>
          </details>
        </div>

        {/* Superintelligence Index */}
        <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">Superintelligence Index</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{CORE_METRICS.si.shortDesc}</div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 ml-3">
              {(insight.quality?.superintelligence_index == null || isNaN(insight.quality?.superintelligence_index)) ? 'N/A' : insight.quality.superintelligence_index.toFixed(2)}
            </div>
          </div>
          <details className="mt-2">
            <summary className="cursor-pointer text-xs text-green-700 dark:text-green-300 hover:underline">
              Show calculations
            </summary>
            <div className="mt-2 p-3 bg-white/50 dark:bg-gray-900/30 rounded text-xs space-y-2">
              <div className="text-gray-700 dark:text-gray-300">
                <p className="font-medium mb-1">Current Values:</p>
                <p>• Target Aperture A*: 0.020701 (K=4)</p>
                <p>• Deviation: {(insight.quality?.si_deviation == null || isNaN(insight.quality?.si_deviation)) ? 'N/A' : `${insight.quality.si_deviation.toFixed(2)}×`} from target</p>
                {(insight.quality?.superintelligence_index == null || isNaN(insight.quality?.superintelligence_index)) && (
                  <p className="text-yellow-600 dark:text-yellow-400 mt-2">⚠ SI requires all 6 behavior metrics to be numeric (no N/A values)</p>
                )}
              </div>
              <div className="pt-2 border-t border-green-300 dark:border-green-700 text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {CORE_METRICS.si.fullDesc}
              </div>
            </div>
          </details>
        </div>

        <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">Alignment Rate</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{CORE_METRICS.ar.shortDesc}</div>
            </div>
            <div className="ml-3">
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${getAlignmentBadgeColor(insight.quality?.alignment_rate_category || 'SLOW')}`}>
                {insight.quality?.alignment_rate_category || 'N/A'}
              </span>
            </div>
          </div>
          <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
            {insight.quality?.alignment_rate ? insight.quality.alignment_rate.toFixed(4) : '0.0000'}/min
          </div>
          <details className="mt-2">
            <summary className="cursor-pointer text-xs text-purple-700 dark:text-purple-300 hover:underline">
              Learn more
            </summary>
            <div className="mt-2 p-3 bg-white/50 dark:bg-gray-900/30 rounded text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {CORE_METRICS.ar.fullDesc}
              <div className="mt-2 pt-2 border-t border-purple-300 dark:border-purple-700 font-mono text-xs">
                <strong>Formula:</strong> {CORE_METRICS.ar.formula}
              </div>
            </div>
          </details>
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
            {insight.quality?.pathologies?.detected && insight.quality.pathologies.detected.length > 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <span>🔬</span>
                  <span>Detected Pathologies ({insight.quality.pathologies.detected.length})</span>
                </h3>
                <ul className="space-y-2">
                  {insight.quality.pathologies.detected.map((pathology, idx) => (
                    <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                      <span className="text-red-600 dark:text-red-400">•</span>
                      <span>{formatPathologyName(pathology)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {insight.process?.models_used && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Models Used</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Synthesis Epochs</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Epoch 1: {insight.process.models_used.synthesis_epoch1 || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Epoch 2: {insight.process.models_used.synthesis_epoch2 || 'N/A'}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Analyst Models</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Analyst 1: {insight.process.models_used.analyst1 || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Analyst 2: {insight.process.models_used.analyst2 || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'structure' && (
          <div>
            <MetricSectionHeader 
              title="Structure Metrics"
              definition={METRIC_CATEGORIES.structure}
              emoji="🏗️"
            />
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(insight.quality?.structure_scores || {}).map(([key, value]) => (
                <MetricCard
                  key={key}
                  label={key}
                  value={value}
                  valueColor={getScoreColor(value)}
                  definition={STRUCTURE_METRICS[key as keyof typeof STRUCTURE_METRICS]}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'behavior' && (
          <div>
            <MetricSectionHeader 
              title="Behavior Metrics"
              definition={METRIC_CATEGORIES.behavior}
              emoji="🧠"
            />
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {Object.entries(insight.quality?.behavior_scores || {}).map(([key, value]) => (
                <MetricCard
                  key={key}
                  label={key}
                  value={value}
                  valueColor={typeof value === 'number' ? getScoreColor(value) : 'text-gray-500 dark:text-gray-400'}
                  definition={BEHAVIOR_METRICS[key as keyof typeof BEHAVIOR_METRICS]}
                />
              ))}
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>ℹ️ N/A Handling:</strong> Behavior metrics must be fully scored (6/6) to compute SI. 
                If any metric is N/A, SI is not computed. N/A metrics are excluded from QI normalization.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'specialization' && (
          <div>
            <MetricSectionHeader 
              title="Specialization Metrics"
              definition={METRIC_CATEGORIES.specialization}
              emoji="🎯"
            />
            {Object.keys(insight.quality?.specialization_scores || {}).length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {Object.entries(insight.quality?.specialization_scores || {}).map(([key, value]) => (
                  <div key={key} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-0.5 capitalize">
                          {key}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Domain-specific metric for {insight.challenge.type} challenge
                        </div>
                      </div>
                      <div className={`text-2xl font-bold ml-3 ${getScoreColor(value)}`}>
                        {value.toFixed(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm">
                <p className="text-gray-700 dark:text-gray-300">
                  ℹ️ <strong>No specialization scores recorded.</strong> When empty, specialization contributes 0 to Quality Index (per GyroDiagnostics spec).
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
                    {insight.transcripts.epoch1.map((turn, i) => {
                      const words = countWords(turn);
                      const tokens = estimateTokens(words);
                      return (
                        <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center justify-between">
                            <span>Turn {i + 1}</span>
                            <span className="text-gray-500 dark:text-gray-400 font-normal">
                              {words} words • ~{formatTokenCount(tokens)} tokens
                            </span>
                          </div>
                          <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                            {turn}
                          </pre>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <span>📝</span>
                    <span>Epoch 2 Synthesis</span>
                  </h3>
                  <div className="space-y-4">
                    {insight.transcripts.epoch2.map((turn, i) => {
                      const words = countWords(turn);
                      const tokens = estimateTokens(words);
                      return (
                        <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center justify-between">
                            <span>Turn {i + 1}</span>
                            <span className="text-gray-500 dark:text-gray-400 font-normal">
                              {words} words • ~{formatTokenCount(tokens)} tokens
                            </span>
                          </div>
                          <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                            {turn}
                          </pre>
                        </div>
                      );
                    })}
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

