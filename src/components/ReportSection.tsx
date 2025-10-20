import React, { useEffect, useState } from 'react';
import { NotebookState, GovernanceInsight } from '../types';
import { insights as insightsStorage, sessions } from '../lib/storage';
import { useToast } from './shared/Toast';
import { getActiveSession } from '../lib/session-helpers';
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
  onUpdate: (updates: Partial<NotebookState> | ((prev: NotebookState) => Partial<NotebookState>)) => void;
  onBack: () => void;
  onNavigateToSection?: (section: 'epoch1' | 'epoch2' | 'analyst1_epoch1' | 'analyst1_epoch2' | 'analyst2_epoch1' | 'analyst2_epoch2' | 'report') => void;
}

const ReportSection: React.FC<ReportSectionProps> = ({ state, onUpdate, onBack, onNavigateToSection }) => {
  const [insight, setInsight] = useState<GovernanceInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuiteProgress, setShowSuiteProgress] = useState(false);
  const toast = useToast();

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    try {
      const session = getActiveSession(state);
      if (!session) {
        throw new Error('No active session');
      }

      // Helper for median calculation
      const median = (arr: number[]) => {
        const sorted = arr.slice().sort((a, b) => a - b);
        return sorted[Math.floor(sorted.length / 2)];
      };

      // Validate per-epoch analyst data
      const a1e1 = session.analysts.epoch1.analyst1?.data;
      const a2e1 = session.analysts.epoch1.analyst2?.data;
      const a1e2 = session.analysts.epoch2.analyst1?.data;
      const a2e2 = session.analysts.epoch2.analyst2?.data;

      if (!a1e1 || !a2e1 || !a1e2 || !a2e2) {
        throw new Error('All analysts must complete evaluation for both epochs');
      }

      // Aggregate and calculate QI per epoch
      const agg1 = aggregateAnalysts(a1e1, a2e1);
      const s1 = calculateStructureAverage(agg1.structure);
      const b1 = calculateBehaviorAverage(agg1.behavior);
      const sp1 = calculateSpecializationAverage(agg1.specialization);
      const QI1 = calculateQualityIndex(s1, b1, sp1); // 0..100

      const agg2 = aggregateAnalysts(a1e2, a2e2);
      const s2 = calculateStructureAverage(agg2.structure);
      const b2 = calculateBehaviorAverage(agg2.behavior);
      const sp2 = calculateSpecializationAverage(agg2.specialization);
      const QI2 = calculateQualityIndex(s2, b2, sp2);

      // Compute medians for AR (spec-compliant)
      const medianQI = median([QI1, QI2]);
      const d1 = session.epochs.epoch1.duration_minutes;
      const d2 = session.epochs.epoch2.duration_minutes;
      const medianDuration = median([d1, d2]);
      const alignmentResult = calculateAlignmentRate(medianQI, medianDuration);

      // Compute SI per epoch and use median (optional but recommended)
      let si1Result = { si: NaN, aperture: NaN, deviation: NaN };
      let si2Result = { si: NaN, aperture: NaN, deviation: NaN };
      try {
        const behaviorArray1 = behaviorScoresToArray(agg1.behavior);
        si1Result = calculateSuperintelligenceIndex(behaviorArray1);
      } catch (e) {
        console.warn('SI unavailable for epoch 1:', e);
      }
      try {
        const behaviorArray2 = behaviorScoresToArray(agg2.behavior);
        si2Result = calculateSuperintelligenceIndex(behaviorArray2);
      } catch (e) {
        console.warn('SI unavailable for epoch 2:', e);
      }

      // Use median SI if both are valid, otherwise use what's available
      const validSIs = [si1Result.si, si2Result.si].filter(v => Number.isFinite(v));
      const siResult = validSIs.length > 0 
        ? { 
            si: validSIs.length === 2 ? median(validSIs) : validSIs[0],
            aperture: si1Result.aperture, // Use epoch 1 for details
            deviation: si1Result.deviation
          }
        : { si: NaN, aperture: NaN, deviation: NaN };

      // Use aggregate of both epochs for display purposes (combine insights, etc.)
      const aggregated = aggregateAnalysts(a1e1, a2e1); // Using epoch 1 for structure display
      const structureAvg = s1;
      const behaviorAvg = b1;
      const specializationAvg = sp1;
      const qualityIndex = medianQI; // Use median QI

      // Calculate pathology frequency across all analysts
      const totalPathologies = a1e1.pathologies.length + a2e1.pathologies.length + 
                               a1e2.pathologies.length + a2e2.pathologies.length;
      const pathologyFrequency = totalPathologies / 12; // 6 turns per epoch × 2 epochs

      // Combine insights from all analyst evaluations
      const combinedInsights = `# Epoch 1 - Analyst 1\n\n${a1e1.insights}\n\n# Epoch 1 - Analyst 2\n\n${a2e1.insights}\n\n# Epoch 2 - Analyst 1\n\n${a1e2.insights}\n\n# Epoch 2 - Analyst 2\n\n${a2e2.insights}`;

      // Extract raw transcripts for auditability
      const transcripts = {
        epoch1: session.epochs.epoch1.turns.map(t => t.content),
        epoch2: session.epochs.epoch2.turns.map(t => t.content)
      };

      // Create final insight object
      const insightId = `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const generatedInsight: GovernanceInsight = {
        id: insightId,
        sessionId: session.id,
        challenge: session.challenge,
        insights: {
          summary: `Quality Index: ${qualityIndex.toFixed(1)}%, SI: ${isNaN(siResult.si) ? 'N/A' : siResult.si.toFixed(2)}, Alignment: ${alignmentResult.category}`,
          participation: 'Generated through structured synthesis protocol',
          preparation: 'Two epochs of 6-turn synthesis with diverse model perspectives',
          provision: 'Validated through dual-analyst evaluation with quality metrics',
          combined_markdown: combinedInsights
        },
        transcripts,
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
            comparison: aggregated.behavior.comparison,   // Preserve N/A
            preference: aggregated.behavior.preference    // Preserve N/A
          },
          specialization_scores: aggregated.specialization,
          pathologies: {
            detected: aggregated.pathologies,
            frequency: pathologyFrequency
          }
        },
        process: {
          platform: session.process.platform,
          models_used: {
            synthesis_epoch1: session.process.model_epoch1,
            synthesis_epoch2: session.process.model_epoch2,
            analyst1: session.process.model_analyst1,
            analyst2: session.process.model_analyst2
          },
          durations: {
            epoch1_minutes: session.epochs.epoch1.duration_minutes,
            epoch2_minutes: session.epochs.epoch2.duration_minutes
          },
          created_at: new Date().toISOString(),
          schema_version: '1.0.0'
        },
        contribution: {
          public: true,
          license: 'CC0',
          contributor: 'Anonymous'
        },
        tags: session.challenge.domain,
        starred: false,
        notes: ''
      };

      setInsight(generatedInsight);
      setLoading(false);

      // Check for existing insight from same session
      const allInsights = await insightsStorage.getAll();
      const existingInsight = session.id 
        ? allInsights.find(i => i.sessionId === session.id)
        : null;

      if (existingInsight) {
        // Update existing insight instead of creating duplicate
        const updatedInsight = {
          ...generatedInsight,
          id: existingInsight.id // Preserve original ID
        };
        await insightsStorage.save(updatedInsight);
        toast.show('Insight updated in library', 'success');
      } else {
        // Save new insight
        await insightsStorage.save(generatedInsight);
        toast.show('Insight saved to library', 'success');
      }

      // Update state results for progress tracking
      onUpdate({ results: generatedInsight });

      // Mark session as complete if there's an active session
      if (state.activeSessionId) {
        await sessions.update(state.activeSessionId, { status: 'complete' });
      }

      // Check if this is part of Gyro Suite
      if (state.gyroSuiteSessionIds && state.gyroSuiteCurrentIndex !== undefined) {
        setShowSuiteProgress(true);
      }

    } catch (error) {
      console.error('Error generating report:', error);
      toast.show('Error generating report. Please ensure all sections are completed.', 'error');
      setLoading(false);
    }
  };

  const handleNextChallenge = async () => {
    if (!state.gyroSuiteSessionIds || state.gyroSuiteCurrentIndex === undefined) return;

    const nextIndex = state.gyroSuiteCurrentIndex + 1;
    if (nextIndex >= state.gyroSuiteSessionIds.length) {
      // Suite complete!
      toast.show('🎉 GyroDiagnostics Suite Complete! All 5 challenges finished.', 'success');
      onUpdate({
        gyroSuiteSessionIds: undefined,
        gyroSuiteCurrentIndex: undefined,
        activeSessionId: undefined,
        ui: {
          ...state.ui,
          currentApp: 'insights',
          currentSection: 'setup'
        }
      });
      return;
    }

    // Load next session
    const nextSessionId = state.gyroSuiteSessionIds[nextIndex];
    const nextSession = await sessions.getById(nextSessionId);
    if (!nextSession) {
      toast.show('Error loading next challenge', 'error');
      return;
    }

    toast.show(`Starting challenge ${nextIndex + 1}/5`, 'info');

    onUpdate({
      challenge: nextSession.challenge,
      process: nextSession.process,
      activeSessionId: nextSessionId,
      gyroSuiteCurrentIndex: nextIndex,
      epochs: nextSession.epochs,
      analysts: {
        analyst1: null,
        analyst2: null
      },
      results: null,
      ui: {
        ...state.ui,
        currentSection: 'epoch1'
      }
    });

    if (onNavigateToSection) {
      onNavigateToSection('epoch1');
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
          <div className="text-gray-600 dark:text-gray-400">Generating report...</div>
        </div>
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="section-card">
        <div className="text-center py-8">
          <div className="text-red-600 dark:text-red-400">Error generating report</div>
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
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">{insight.challenge.title}</h2>
        <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded">{insight.challenge.type}</span>
          {insight.challenge.domain.map(d => (
            <span key={d} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">{d}</span>
          ))}
        </div>
      </div>

      {/* Quality Metrics Overview */}
      <div className="section-card">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Quality Validation</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Quality Index */}
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700 shadow-sm">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {insight.quality.quality_index.toFixed(1)}%
            </div>
            <div className="text-sm font-medium text-blue-800 dark:text-blue-300">Quality Index</div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Overall performance score
            </div>
          </div>
          
          {/* Superintelligence Index */}
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-700 shadow-sm">
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {isNaN(insight.quality.superintelligence_index) ? 'N/A' : insight.quality.superintelligence_index.toFixed(2)}
            </div>
            <div className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-3">SI Index</div>
            <details className="text-xs">
              <summary className="cursor-pointer text-purple-600 dark:text-purple-400 hover:underline font-medium">
                Technical Details
              </summary>
              <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-purple-200 dark:border-purple-600 text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Target Aperture:</span>
                  <span className="font-mono text-gray-900 dark:text-gray-100">0.020701 (K=4)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Deviation:</span>
                  <span className="font-mono text-gray-900 dark:text-gray-100">
                    {isNaN(insight.quality.si_deviation) ? 'N/A' : `${insight.quality.si_deviation.toFixed(2)}×`}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-600">
                  {isNaN(insight.quality.superintelligence_index) 
                    ? 'SI requires all 6 behavior metrics to be numeric (no N/A values)'
                    : 'Measures behavior score spread via K4 spherical geometry'}
                </div>
              </div>
            </details>
          </div>
          
          {/* Alignment Rate */}
          <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-lg border border-emerald-200 dark:border-emerald-700 shadow-sm">
            <div className={`text-3xl font-bold mb-2 ${
              insight.quality.alignment_rate_category === 'VALID' ? 'text-emerald-600 dark:text-emerald-400' :
              insight.quality.alignment_rate_category === 'SLOW' ? 'text-amber-600 dark:text-amber-400' :
              'text-orange-600 dark:text-orange-400'
            }`}>
              {insight.quality.alignment_rate_category}
            </div>
            <div className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-1">
              {insight.quality.alignment_rate.toFixed(4)}/min
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400">
              Quality points per minute
            </div>
          </div>
        </div>

        {/* Detailed Scores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Structure */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/30 border border-slate-200 dark:border-slate-600 rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold mb-3 text-slate-900 dark:text-slate-100 flex items-center">
              <div className="w-2 h-2 bg-slate-500 dark:bg-slate-400 rounded-full mr-2"></div>
              Structure Scores
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-700 dark:text-slate-300">Traceability</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                  {insight.quality.structure_scores.traceability.toFixed(1)}/10
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-700 dark:text-slate-300">Variety</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                  {insight.quality.structure_scores.variety.toFixed(1)}/10
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-700 dark:text-slate-300">Accountability</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                  {insight.quality.structure_scores.accountability.toFixed(1)}/10
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-700 dark:text-slate-300">Integrity</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                  {insight.quality.structure_scores.integrity.toFixed(1)}/10
                </span>
              </div>
            </div>
          </div>

          {/* Behavior */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/20 border border-indigo-200 dark:border-indigo-600 rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold mb-3 text-indigo-900 dark:text-indigo-100 flex items-center">
              <div className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full mr-2"></div>
              Behavior Scores
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-indigo-700 dark:text-indigo-300">Truthfulness</span>
                <span className="font-semibold text-indigo-900 dark:text-indigo-100 bg-indigo-100 dark:bg-indigo-800 px-2 py-1 rounded">
                  {insight.quality.behavior_scores.truthfulness.toFixed(1)}/10
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-indigo-700 dark:text-indigo-300">Completeness</span>
                <span className="font-semibold text-indigo-900 dark:text-indigo-100 bg-indigo-100 dark:bg-indigo-800 px-2 py-1 rounded">
                  {insight.quality.behavior_scores.completeness.toFixed(1)}/10
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-indigo-700 dark:text-indigo-300">Groundedness</span>
                <span className="font-semibold text-indigo-900 dark:text-indigo-100 bg-indigo-100 dark:bg-indigo-800 px-2 py-1 rounded">
                  {insight.quality.behavior_scores.groundedness.toFixed(1)}/10
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-indigo-700 dark:text-indigo-300">Literacy</span>
                <span className="font-semibold text-indigo-900 dark:text-indigo-100 bg-indigo-100 dark:bg-indigo-800 px-2 py-1 rounded">
                  {insight.quality.behavior_scores.literacy.toFixed(1)}/10
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-indigo-700 dark:text-indigo-300">Comparison</span>
                <span className="font-semibold text-indigo-900 dark:text-indigo-100 bg-indigo-100 dark:bg-indigo-800 px-2 py-1 rounded">
                  {typeof insight.quality.behavior_scores.comparison === 'number' ? insight.quality.behavior_scores.comparison.toFixed(1) : 'N/A'}/10
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-indigo-700 dark:text-indigo-300">Preference</span>
                <span className="font-semibold text-indigo-900 dark:text-indigo-100 bg-indigo-100 dark:bg-indigo-800 px-2 py-1 rounded">
                  {typeof insight.quality.behavior_scores.preference === 'number' ? insight.quality.behavior_scores.preference.toFixed(1) : 'N/A'}/10
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pathologies */}
        {insight.quality?.pathologies?.detected && insight.quality.pathologies.detected.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded">
            <h4 className="font-medium text-yellow-900 dark:text-yellow-200 mb-2">Detected Pathologies</h4>
            <div className="flex flex-wrap gap-2">
              {insight.quality.pathologies.detected.map(p => (
                <span key={p} className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm rounded">
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Insights Preview */}
      <div className="section-card">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Insights</h3>
        <div className="prose max-w-none text-sm">
          <details>
            <summary className="cursor-pointer font-medium text-primary dark:text-blue-400 mb-2">
              View Combined Insights
            </summary>
            <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded max-h-96 overflow-y-auto whitespace-pre-wrap text-gray-900 dark:text-gray-100">
              {insight.insights.combined_markdown}
            </div>
          </details>
        </div>
      </div>

      {/* Gyro Suite Progress */}
      {showSuiteProgress && state.gyroSuiteSessionIds && state.gyroSuiteCurrentIndex !== undefined && (
        <div className="section-card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl">🎯</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                GyroDiagnostics Suite Progress
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Challenge {state.gyroSuiteCurrentIndex + 1} of {state.gyroSuiteSessionIds.length} complete
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${((state.gyroSuiteCurrentIndex + 1) / state.gyroSuiteSessionIds.length) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
              {['Formal', 'Normative', 'Procedural', 'Strategic', 'Epistemic'].map((name, i) => (
                <span key={name} className={i <= (state.gyroSuiteCurrentIndex || 0) ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''}>
                  {name}
                </span>
              ))}
            </div>
          </div>

          {state.gyroSuiteCurrentIndex + 1 < state.gyroSuiteSessionIds.length ? (
            <button
              onClick={handleNextChallenge}
              className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-lg"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleNextChallenge}
              className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors text-lg"
            >
              🎉 Complete Suite & View All Results
            </button>
          )}
        </div>
      )}

      {/* Export Actions */}
      <div className="section-card">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Export & Share</h3>
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
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Contributions are published under CC0 license to the public knowledge base
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary">
          ← Back
        </button>
        {!showSuiteProgress && (
          <button 
            onClick={() => onUpdate({ 
              ui: { 
                ...state.ui, 
                currentApp: 'insights',
                insightsView: 'library' // Explicitly set to library view
              } 
            })}
            className="btn-primary"
          >
            View in Insights →
          </button>
        )}
      </div>
    </div>
  );
};

export default ReportSection;

