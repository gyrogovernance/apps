// Detector Results View - Display Truth Spectrum + full diagnostics
// Uses Insight-first approach with drafts for persistence

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { NotebookState, GovernanceInsight, DetectorUIState } from '../../../types';
import { useToast } from '../../shared/Toast';
import { aggregateAnalystScores, calculateQualityMetrics } from '../../../lib/score-aggregator';
import { calculateDeceptionRiskScore } from '../../../lib/calculations';
import { insights as insightsStorage } from '../../../lib/storage';
import GlassCard from '../../shared/GlassCard';
import TruthSpectrumGauge from './TruthSpectrumGauge';
import QuickSummaryCard from './QuickSummaryCard';
import PathologyReport from './PathologyReport';
import TechnicalDetails from './TechnicalDetails';
import ExportActions from './ExportActions';
import MetricsDisplayTable from '../../shared/MetricsDisplayTable';

interface DetectorResultsProps {
  state: NotebookState;
  onUpdate: (updates: Partial<NotebookState>) => void;
  onNavigateHome: () => void;
  draftKey: string | undefined;
}

interface ComputedDetectorResults {
  aggregated: ReturnType<typeof aggregateAnalystScores>;
  metrics: ReturnType<typeof calculateQualityMetrics>;
  drs: ReturnType<typeof calculateDeceptionRiskScore>;
}

const DetectorResults: React.FC<DetectorResultsProps> = ({ 
  state, 
  onUpdate, 
  onNavigateHome,
  draftKey
}) => {
  const toast = useToast();
  const [computedResults, setComputedResults] = useState<ComputedDetectorResults | null>(null);
  const [arOverride, setArOverride] = useState<number | null>(null);

  if (!draftKey || !state.drafts || !state.drafts[draftKey]) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-red-500 dark:text-red-400">
        Error: No detector data found. Please start a new analysis.
        <button onClick={onNavigateHome} className="btn-secondary mt-4">← Go Home</button>
      </div>
    );
  }

  const draftData: DetectorUIState = state.drafts[draftKey] as DetectorUIState;

  useEffect(() => {
    if (draftData?.analyst1 && draftData?.analyst2) {
      computeResults();
    }
  }, [draftData, arOverride]); // Re-compute if draftData or AR override changes

  const computeResults = () => {
    if (!draftData.analyst1 || !draftData.analyst2) {
      console.error("Missing analyst data for results computation.");
      return;
    }

    try {
      // Aggregate scores
      const aggregated = aggregateAnalystScores(draftData.analyst1, draftData.analyst2);

      // Calculate quality metrics (with optional AR override)
      const durationMinutes = arOverride || (draftData.parsedResult?.turns?.length || 0) * 1.5;
      const metrics = calculateQualityMetrics(aggregated, durationMinutes);

      // Calculate Risk Score
      const drs = calculateDeceptionRiskScore(metrics, aggregated);

      setComputedResults({ aggregated, metrics, drs });
    } catch (error) {
      console.error('Failed to compute results:', error);
      toast.show('Failed to compute analysis results', 'error');
    }
  };

  const handleSaveInsight = async () => {
    if (!computedResults || !draftData) {
      toast.show('No analysis data to save', 'error');
      return;
    }

    try {
      // Create complete GovernanceInsight
      const insight: GovernanceInsight = {
        id: `detector_${Date.now()}`,
        challenge: {
          type: 'custom',
          title: "Lie Detector Analysis",
          description: draftData.transcript?.substring(0, 200) + '...' || 'AI conversation analysis',
          domain: ['detector', 'deception-analysis']
        },
        insights: {
          summary: `Risk Score: ${computedResults.drs.score}/100 (${computedResults.drs.category}) with ${computedResults.metrics.confidence} confidence`,
          participation: 'Rapid structural deception analysis using dual-analyst evaluation',
          preparation: 'Transcript parsing and multi-model analysis',
          provision: 'Risk Score and structural integrity assessment',
          combined_markdown: `# Lie Detector Analysis Results\n\n**Risk Score**: ${computedResults.drs.score}/100 (${computedResults.drs.category})\n\n**Confidence**: ${computedResults.metrics.confidence}\n\n**Key Findings**:\n- Quality Index: ${computedResults.metrics.quality_index.toFixed(1)}%\n- Superintelligence Index: ${isNaN(computedResults.metrics.superintelligence_index) ? 'N/A' : computedResults.metrics.superintelligence_index.toFixed(2)}\n- Pathologies: ${computedResults.aggregated.pathologies.length}\n\n## Analysis\n\nThis analysis measures structural patterns in AI responses to detect "deceptive coherence" - responses that sound fluent but lack grounding or internal consistency.`
        },
        transcripts: {
          epoch1: draftData.parsedResult?.turns?.map((t: any) => t.content) || [],
          epoch2: []
        },
        quality: {
          quality_index: computedResults.metrics.quality_index,
          alignment_rate: computedResults.metrics.alignment_rate,
          alignment_rate_category: computedResults.metrics.alignment_rate_category,
          superintelligence_index: computedResults.metrics.superintelligence_index,
          si_deviation: computedResults.metrics.si_deviation,
          structure_scores: computedResults.aggregated.structure,
          behavior_scores: {
            truthfulness: computedResults.aggregated.behavior.truthfulness,
            completeness: computedResults.aggregated.behavior.completeness,
            groundedness: computedResults.aggregated.behavior.groundedness,
            literacy: computedResults.aggregated.behavior.literacy,
            comparison: computedResults.aggregated.behavior.comparison,
            preference: computedResults.aggregated.behavior.preference
          },
          specialization_scores: computedResults.aggregated.specialization,
          pathologies: {
            detected: computedResults.aggregated.pathologies,
            frequency: computedResults.aggregated.pathologies.length / 2 // 2 analysts
          }
        },
        process: {
          platform: 'detector',
          models_used: {
            synthesis_epoch1: 'N/A',
            synthesis_epoch2: 'N/A',
            analyst1: draftData.model_analyst1 || 'Unknown',
            analyst2: draftData.model_analyst2 || 'Unknown'
          },
          durations: {
            epoch1_minutes: computedResults.metrics.alignment_rate * (draftData.parsedResult?.turns?.length || 0),
            epoch2_minutes: 0
          },
          created_at: new Date().toISOString(),
          schema_version: '1.0.0'
        },
        contribution: {
          public: true,
          license: 'CC0',
          contributor: 'Anonymous'
        },
        tags: ['detector', 'deception-analysis'],
        starred: false,
        notes: ''
      };

      // Save as insight and navigate to InsightsApp
      await insightsStorage.save(insight);
      
      // Clean up draft - delete the key instead of setting to undefined
      const drafts = { ...state.drafts };
      delete drafts[draftKey];
      onUpdate({
        ui: { ...state.ui, currentApp: 'insights' },
        drafts
      });
      
      toast.show('Analysis saved to Insights Library', 'success');
    } catch (error) {
      console.error('Failed to save insight:', error);
      toast.show('Failed to save analysis', 'error');
    }
  };

  if (!draftData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Error: No detector data found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please go back and complete the analysis.
          </p>
          <button onClick={() => onNavigateHome()} className="btn-primary">
            ← Back to Analysis
          </button>
        </div>
      </div>
    );
  }

  if (!computedResults) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Computing Analysis Results
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we calculate the Risk Score...
          </p>
        </div>
      </div>
    );
  }

  if (!computedResults) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Analysis Incomplete
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please complete both analyst evaluations first.
          </p>
          <button onClick={() => onNavigateHome()} className="btn-primary">
            ← Back to Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Hero: Risk Score Gauge */}
      <TruthSpectrumGauge drs={computedResults.drs} />

      {/* Quick Summary with Confidence */}
      <QuickSummaryCard
        drs={computedResults.drs}
        metrics={computedResults.metrics}
        arOverride={arOverride}
        onArOverride={setArOverride}
      />

      {/* Technical Warning - Moved after summary */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          <strong>⚠️ Disclaimer:</strong> This analysis uses automated multi-dimensional quality assessment across 12 evaluation criteria.
          It detects scoring imbalances where surface metrics (fluency, presentation) score high while foundational metrics 
          (truthfulness, groundedness) score low. Always verify claims independently.
        </p>
      </div>

      {/* Analyst Insights - Show both analysts separately */}
      {(computedResults.aggregated.analyst1Insights || computedResults.aggregated.analyst2Insights) && (
        <div className="space-y-6">
          {/* Analyst 1 Insights */}
          {computedResults.aggregated.analyst1Insights && (
            computedResults.aggregated.analyst1Insights.insights || 
            computedResults.aggregated.analyst1Insights.strengths || 
            computedResults.aggregated.analyst1Insights.weaknesses
          ) && (
            <GlassCard className="p-6" variant="glassBlue" borderGradient="blue">
              <h3 className="card-title">Analyst 1 Insights</h3>
              <div className="space-y-4">
                {computedResults.aggregated.analyst1Insights.insights && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Key Insights</h4>
                    <div className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm max-w-none">
                      <ReactMarkdown>{computedResults.aggregated.analyst1Insights.insights}</ReactMarkdown>
                    </div>
                  </div>
                )}
                {computedResults.aggregated.analyst1Insights.strengths && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Strengths</h4>
                    <div className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm max-w-none">
                      <ReactMarkdown>{computedResults.aggregated.analyst1Insights.strengths}</ReactMarkdown>
                    </div>
                  </div>
                )}
                {computedResults.aggregated.analyst1Insights.weaknesses && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Weaknesses</h4>
                    <div className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm max-w-none">
                      <ReactMarkdown>{computedResults.aggregated.analyst1Insights.weaknesses}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          )}

          {/* Analyst 2 Insights */}
          {computedResults.aggregated.analyst2Insights && (
            computedResults.aggregated.analyst2Insights.insights || 
            computedResults.aggregated.analyst2Insights.strengths || 
            computedResults.aggregated.analyst2Insights.weaknesses
          ) && (
            <GlassCard className="p-6" variant="glassBlue" borderGradient="blue">
              <h3 className="card-title">Analyst 2 Insights</h3>
              <div className="space-y-4">
                {computedResults.aggregated.analyst2Insights.insights && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Key Insights</h4>
                    <div className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm max-w-none">
                      <ReactMarkdown>{computedResults.aggregated.analyst2Insights.insights}</ReactMarkdown>
                    </div>
                  </div>
                )}
                {computedResults.aggregated.analyst2Insights.strengths && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Strengths</h4>
                    <div className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm max-w-none">
                      <ReactMarkdown>{computedResults.aggregated.analyst2Insights.strengths}</ReactMarkdown>
                    </div>
                  </div>
                )}
                {computedResults.aggregated.analyst2Insights.weaknesses && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Weaknesses</h4>
                    <div className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm max-w-none">
                      <ReactMarkdown>{computedResults.aggregated.analyst2Insights.weaknesses}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {/* Full Metrics (collapsible) */}
      <MetricsDisplayTable
        scores={computedResults.aggregated}
        mode="full"
        showDefinitions={true}
      />

      {/* Pathology Report */}
      <PathologyReport pathologies={computedResults.aggregated.pathologies} />

      {/* Technical Details (collapsible) */}
      <TechnicalDetails
        metrics={computedResults.metrics}
        draftData={draftData}
        arOverride={arOverride}
      />

      {/* Save & Export Options */}
      <ExportActions
        draftData={draftData}
        results={computedResults}
        onSaveInsight={handleSaveInsight}
      />

      {/* Navigation */}
      <div className="flex justify-between pt-4 pb-6 border-t border-gray-200 dark:border-gray-700">
        <button onClick={() => onNavigateHome()} className="btn-secondary">
          ← Back to Analysis
        </button>
        <button
          onClick={handleSaveInsight}
          className="btn-primary"
        >
          Save to Library →
        </button>
      </div>
    </div>
  );
};

export default DetectorResults;
