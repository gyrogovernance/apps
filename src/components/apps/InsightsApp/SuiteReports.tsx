import React, { useMemo } from 'react';
import { GovernanceInsight } from '../../../types';
import { insights as insightsStorage } from '../../../lib/storage';
import { getAlignmentBadgeColor, getQIColor } from '../../../lib/ui-utils';
import { formatDuration, formatDate } from '../../../lib/export-utils';
import { useToast } from '../../shared/Toast';
import GlassCard from '../../shared/GlassCard';

interface SuiteAggregate {
  suiteRunId: string;
  modelName: string;
  completedAt: string;
  challenges: GovernanceInsight[]; // All 5 insights
  
  // Aggregate metrics (medians across 5 challenges)
  medianQI: number;
  medianSI: number;
  medianAR: number;
  mostCommonARCategory: string;
  totalPathologies: number;
  totalDuration: number; // Sum of all epoch durations
}

interface SuiteReportsProps {
  insights: GovernanceInsight[];
  onViewInsight: (insightId: string) => void;
  onExportSuite: (suiteRunId: string, insightIds?: string[]) => void;
}


export const SuiteReports: React.FC<SuiteReportsProps> = ({
  insights,
  onViewInsight,
  onExportSuite
}) => {
  const toast = useToast();

  // Group insights by suiteRunId and calculate aggregates
  const suites = useMemo(() => {
    const grouped = insights.reduce((acc, insight) => {
      if (!insight.suiteRunId) return acc;
      
      if (!acc[insight.suiteRunId]) {
        acc[insight.suiteRunId] = [];
      }
      acc[insight.suiteRunId].push(insight);
      return acc;
    }, {} as Record<string, GovernanceInsight[]>);

    // Filter to only complete suites (5 challenges)
    const completeSuites = Object.entries(grouped)
      .filter(([_, suiteInsights]) => suiteInsights.length === 5)
      .map(([suiteRunId, suiteInsights]) => {
        // Sort by suiteIndex if available, otherwise by challenge type order
        const sortedInsights = suiteInsights.sort((a, b) => {
          if (a.suiteMetadata?.suiteIndex !== undefined && b.suiteMetadata?.suiteIndex !== undefined) {
            return a.suiteMetadata.suiteIndex - b.suiteMetadata.suiteIndex;
          }
          // For implicit suites, sort by challenge type order
          const typeOrder = { 'formal': 0, 'normative': 1, 'procedural': 2, 'strategic': 3, 'epistemic': 4 };
          return (typeOrder[a.challenge.type as keyof typeof typeOrder] || 0) - 
                 (typeOrder[b.challenge.type as keyof typeof typeOrder] || 0);
        });

        // Calculate aggregate metrics
        const qis = sortedInsights.map(i => i.quality.quality_index);
        const sis = sortedInsights.map(i => i.quality.superintelligence_index);
        const ars = sortedInsights.map(i => i.quality.alignment_rate);
        const arCategories = sortedInsights.map(i => i.quality.alignment_rate_category);
        const pathologies = sortedInsights.map(i => i.quality.pathologies.frequency);
        const durations = sortedInsights.map(i => 
          (i.process.durations.epoch1_minutes + i.process.durations.epoch2_minutes)
        );

        // Calculate medians
        const median = (arr: number[]) => {
          const sorted = [...arr].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          return sorted.length % 2 === 0 
            ? (sorted[mid - 1] + sorted[mid]) / 2 
            : sorted[mid];
        };

        // Find most common AR category
        const arCategoryCounts = arCategories.reduce((acc, cat) => {
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const mostCommonARCategory = Object.entries(arCategoryCounts)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'UNKNOWN';

        return {
          suiteRunId,
          modelName: sortedInsights[0]?.suiteMetadata?.modelEvaluated || 
                    sortedInsights[0]?.process.models_used.synthesis_epoch1 || 
                    'Unknown Model',
          completedAt: sortedInsights[0]?.suiteMetadata?.suiteCompletedAt || 
                      sortedInsights[0]?.process.created_at || 
                      new Date().toISOString(),
          challenges: sortedInsights,
          medianQI: median(qis),
          medianSI: median(sis),
          medianAR: median(ars),
          mostCommonARCategory,
          totalPathologies: pathologies.reduce((sum, p) => sum + p, 0),
          totalDuration: durations.reduce((sum, d) => sum + d, 0)
        } as SuiteAggregate;
      });

    // Sort by completion date (newest first)
    return completeSuites.sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  }, [insights]);

  if (suites.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No Suite Reports Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Complete a GyroDiagnostics Suite to see aggregate reports here
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Suite Reports show unified evaluation metrics across all 5 challenges
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          🎯 Suite Reports
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {suites.length} complete suite{suites.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid gap-4">
        {suites.map((suite) => (
          <GlassCard
            key={suite.suiteRunId}
            className="p-6 hover:shadow-md transition-shadow"
            hover
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {suite.modelName} - GyroDiagnostics Suite
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(suite.completedAt)} • 5/5 challenges • {formatDuration(suite.totalDuration)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onExportSuite(suite.suiteRunId, suite.challenges.map(c => c.id))}
                  className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                >
                  📄 Export Report
                </button>
              </div>
            </div>

            {/* Aggregate Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getQIColor(suite.medianQI)}`}>
                  {suite.medianQI.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Median QI</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {suite.medianSI.toFixed(1)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Median SI</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {suite.medianAR.toFixed(3)}/min
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Median AR</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {suite.totalPathologies}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Pathologies</div>
              </div>
            </div>

            {/* AR Category Badge */}
            <div className="flex justify-center mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getAlignmentBadgeColor(suite.mostCommonARCategory)}`}>
                Most Common AR: {suite.mostCommonARCategory}
              </span>
            </div>

            {/* Visual Performance Summary */}
            <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {suite.challenges.map((insight, idx) => {
                    const qi = insight.quality.quality_index;
                    const height = Math.max(12, (qi / 100) * 40);
                    return (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <div 
                          className={`w-3 rounded-t transition-all ${
                            qi >= 70 ? 'bg-green-500' : qi >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ height: `${height}px` }}
                        />
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                          {['F', 'N', 'P', 'S', 'E'][idx]}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {suite.medianQI.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Median QI</div>
                </div>
              </div>
            </div>

            {/* Challenge Breakdown */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                Challenge Breakdown
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                {suite.challenges.map((insight, index) => {
                  const challengeTypes = ['Formal', 'Normative', 'Procedural', 'Strategic', 'Epistemic'];
                  const challengeType = challengeTypes[index] || 'Unknown';
                  
                  return (
                    <button
                      key={insight.id}
                      onClick={() => onViewInsight(insight.id)}
                      className="p-3 text-left bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {challengeType}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        QI: {insight.quality.quality_index.toFixed(1)}% • 
                        SI: {insight.quality.superintelligence_index.toFixed(1)} • 
                        AR: {insight.quality.alignment_rate_category}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
      </div>
    </div>
  );
};
