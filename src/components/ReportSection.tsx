import React, { useEffect, useState } from 'react';
import { NotebookState, GovernanceInsight } from '../types';
import {
  aggregateAnalysts,
  calculateStructureAverage,
  calculateBehaviorAverage,
  calculateSpecializationAverage,
  calculateQualityIndex,
  calculateAlignmentRate,
  calculateSuperintelligenceIndex
} from '../lib/calculations';
import { behaviorScoresToArray } from '../lib/parsing';
import {
  exportAsJSON,
  exportAsMarkdown,
  downloadFile,
  generateFilename,
  generateGitHubContributionURL
} from '../lib/export';

interface ReportSectionProps {
  state: NotebookState;
  onBack: () => void;
}

const ReportSection: React.FC<ReportSectionProps> = ({ state, onBack }) => {
  const [insight, setInsight] = useState<GovernanceInsight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = () => {
    try {
      if (!state.analysts.analyst1 || !state.analysts.analyst2) {
        throw new Error('Both analysts must complete evaluation');
      }

      // Aggregate scores from both analysts
      const aggregated = aggregateAnalysts(state.analysts.analyst1, state.analysts.analyst2);

      // Calculate averages
      const structureAvg = calculateStructureAverage(aggregated.structure);
      const behaviorAvg = calculateBehaviorAverage(aggregated.behavior);
      const specializationAvg = calculateSpecializationAverage(aggregated.specialization);

      // Calculate Quality Index
      const qualityIndex = calculateQualityIndex(structureAvg, behaviorAvg, specializationAvg);

      // Calculate Alignment Rate (using total duration from both epochs)
      const totalDuration = state.epochs.epoch1.duration_minutes + state.epochs.epoch2.duration_minutes;
      const alignmentResult = calculateAlignmentRate(qualityIndex, totalDuration);

      // Calculate Superintelligence Index
      const behaviorArray = behaviorScoresToArray(aggregated.behavior);
      const siResult = calculateSuperintelligenceIndex(behaviorArray);

      // Calculate pathology frequency
      const totalPathologies = state.analysts.analyst1.pathologies.length + state.analysts.analyst2.pathologies.length;
      const pathologyFrequency = totalPathologies / 12; // 6 turns per epoch × 2 epochs

      // Combine insights from both analysts
      const combinedInsights = `# Analyst 1 Insights\n\n${state.analysts.analyst1.insights}\n\n# Analyst 2 Insights\n\n${state.analysts.analyst2.insights}`;

      // Create final insight object
      const generatedInsight: GovernanceInsight = {
        challenge: {
          title: state.challenge.title,
          description: state.challenge.description,
          type: state.challenge.type,
          domain: state.challenge.domain
        },
        insights: {
          summary: `Quality Index: ${qualityIndex.toFixed(1)}%, SI: ${siResult.si.toFixed(2)}, Alignment: ${alignmentResult.category}`,
          participation: 'Generated through structured synthesis protocol',
          preparation: 'Two epochs of 6-turn synthesis with diverse model perspectives',
          provision: 'Validated through dual-analyst evaluation with quality metrics',
          combined_markdown: combinedInsights
        },
        quality: {
          quality_index: qualityIndex,
          alignment_rate: alignmentResult.rate,
          alignment_rate_category: alignmentResult.category,
          superintelligence_index: siResult.si,
          si_deviation: siResult.deviation,
          structure_scores: aggregated.structure,
          behavior_scores: {
            truthfulness: aggregated.behavior.truthfulness,
            completeness: aggregated.behavior.completeness,
            groundedness: aggregated.behavior.groundedness,
            literacy: aggregated.behavior.literacy,
            comparison: typeof aggregated.behavior.comparison === 'number' ? aggregated.behavior.comparison : 0,
            preference: typeof aggregated.behavior.preference === 'number' ? aggregated.behavior.preference : 0
          },
          specialization_scores: aggregated.specialization,
          pathologies: {
            detected: aggregated.pathologies,
            frequency: pathologyFrequency
          }
        },
        process: {
          platform: state.process.platform,
          models_used: {
            synthesis_epoch1: state.process.model_epoch1,
            synthesis_epoch2: state.process.model_epoch2,
            analyst1: state.process.model_analyst1,
            analyst2: state.process.model_analyst2
          },
          durations: {
            epoch1_minutes: state.epochs.epoch1.duration_minutes,
            epoch2_minutes: state.epochs.epoch2.duration_minutes
          },
          created_at: new Date().toISOString(),
          schema_version: '1.0.0'
        },
        contribution: {
          public: true,
          license: 'CC0',
          contributor: 'Anonymous'
        }
      };

      setInsight(generatedInsight);
      setLoading(false);

    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please ensure all sections are completed.');
      setLoading(false);
    }
  };

  const handleDownloadJSON = () => {
    if (!insight) return;
    const json = exportAsJSON(insight);
    const filename = generateFilename(insight.challenge.title, 'json');
    downloadFile(filename, json, 'application/json');
  };

  const handleDownloadMarkdown = () => {
    if (!insight) return;
    const markdown = exportAsMarkdown(insight);
    const filename = generateFilename(insight.challenge.title, 'md');
    downloadFile(filename, markdown, 'text/markdown');
  };

  const handleShareToGitHub = () => {
    if (!insight) return;
    const url = generateGitHubContributionURL(insight);
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="section-card">
        <div className="text-center py-8">
          <div className="text-gray-600">Generating report...</div>
        </div>
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="section-card">
        <div className="text-center py-8">
          <div className="text-red-600">Error generating report</div>
          <button onClick={onBack} className="btn-secondary mt-4">
            ← Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="section-card">
        <h2 className="text-2xl font-bold mb-2">{insight.challenge.title}</h2>
        <div className="flex gap-2 text-sm text-gray-600">
          <span className="px-2 py-1 bg-gray-100 rounded">{insight.challenge.type}</span>
          {insight.challenge.domain.map(d => (
            <span key={d} className="px-2 py-1 bg-blue-100 text-blue-800 rounded">{d}</span>
          ))}
        </div>
      </div>

      {/* Quality Metrics Overview */}
      <div className="section-card">
        <h3 className="text-lg font-semibold mb-4">Quality Validation</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-3xl font-bold text-primary">
              {insight.quality.quality_index.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Quality Index</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-3xl font-bold text-primary">
              {insight.quality.superintelligence_index.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">SI Index</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className={`text-xl font-bold ${
              insight.quality.alignment_rate_category === 'VALID' ? 'text-green-600' :
              insight.quality.alignment_rate_category === 'SLOW' ? 'text-yellow-600' :
              'text-orange-600'
            }`}>
              {insight.quality.alignment_rate_category}
            </div>
            <div className="text-sm text-gray-600">
              {insight.quality.alignment_rate.toFixed(4)}/min
            </div>
          </div>
        </div>

        {/* Detailed Scores */}
        <div className="grid grid-cols-2 gap-4">
          {/* Structure */}
          <div className="border rounded p-3">
            <h4 className="font-medium mb-2">Structure Scores</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Traceability</span>
                <span className="font-medium">{insight.quality.structure_scores.traceability.toFixed(1)}/10</span>
              </div>
              <div className="flex justify-between">
                <span>Variety</span>
                <span className="font-medium">{insight.quality.structure_scores.variety.toFixed(1)}/10</span>
              </div>
              <div className="flex justify-between">
                <span>Accountability</span>
                <span className="font-medium">{insight.quality.structure_scores.accountability.toFixed(1)}/10</span>
              </div>
              <div className="flex justify-between">
                <span>Integrity</span>
                <span className="font-medium">{insight.quality.structure_scores.integrity.toFixed(1)}/10</span>
              </div>
            </div>
          </div>

          {/* Behavior */}
          <div className="border rounded p-3">
            <h4 className="font-medium mb-2">Behavior Scores</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span>Truthfulness</span><span className="font-medium">{insight.quality.behavior_scores.truthfulness.toFixed(1)}/10</span></div>
              <div className="flex justify-between"><span>Completeness</span><span className="font-medium">{insight.quality.behavior_scores.completeness.toFixed(1)}/10</span></div>
              <div className="flex justify-between"><span>Groundedness</span><span className="font-medium">{insight.quality.behavior_scores.groundedness.toFixed(1)}/10</span></div>
              <div className="flex justify-between"><span>Literacy</span><span className="font-medium">{insight.quality.behavior_scores.literacy.toFixed(1)}/10</span></div>
              <div className="flex justify-between"><span>Comparison</span><span className="font-medium">
                {typeof insight.quality.behavior_scores.comparison === 'number' ? insight.quality.behavior_scores.comparison.toFixed(1) : 'N/A'}/10
              </span></div>
              <div className="flex justify-between"><span>Preference</span><span className="font-medium">
                {typeof insight.quality.behavior_scores.preference === 'number' ? insight.quality.behavior_scores.preference.toFixed(1) : 'N/A'}/10
              </span></div>
            </div>
          </div>
        </div>

        {/* Pathologies */}
        {insight.quality.pathologies.detected.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <h4 className="font-medium text-yellow-900 mb-2">Detected Pathologies</h4>
            <div className="flex flex-wrap gap-2">
              {insight.quality.pathologies.detected.map(p => (
                <span key={p} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded">
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Insights Preview */}
      <div className="section-card">
        <h3 className="text-lg font-semibold mb-3">Insights</h3>
        <div className="prose max-w-none text-sm">
          <details>
            <summary className="cursor-pointer font-medium text-primary mb-2">
              View Combined Insights
            </summary>
            <div className="mt-3 p-4 bg-gray-50 rounded max-h-96 overflow-y-auto whitespace-pre-wrap">
              {insight.insights.combined_markdown}
            </div>
          </details>
        </div>
      </div>

      {/* Export Actions */}
      <div className="section-card">
        <h3 className="text-lg font-semibold mb-3">Export & Share</h3>
        <div className="grid grid-cols-3 gap-3">
          <button onClick={handleDownloadJSON} className="btn-primary">
            Download JSON
          </button>
          <button onClick={handleDownloadMarkdown} className="btn-primary">
            Download Markdown
          </button>
          <button onClick={handleShareToGitHub} className="btn-primary bg-green-600 hover:bg-green-700">
            Share to GitHub
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Contributions are published under CC0 license to the public knowledge base
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary">
          ← Back
        </button>
      </div>
    </div>
  );
};

export default ReportSection;

