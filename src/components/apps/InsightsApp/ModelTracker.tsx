import React, { useMemo, useState } from 'react';
import { GovernanceInsight } from '../../../types';
import { getAlignmentColor, getQIColor } from '../../../lib/ui-utils';
import { formatDuration, formatDate } from '../../../lib/export-utils';
import GlassCard from '../../shared/GlassCard';

interface SuiteAggregate {
  suiteRunId: string;
  modelName: string;
  completedAt: string;
  medianQI: number;
  medianSI: number;
  medianAR: number;
  mostCommonARCategory: string;
  totalPathologies: number;
  totalDuration: number;
}

interface ModelTrackerProps {
  insights: GovernanceInsight[];
  onViewInsight: (insightId: string) => void;
}


export const ModelTracker: React.FC<ModelTrackerProps> = ({
  insights,
  onViewInsight
}) => {
  const [selectedModel, setSelectedModel] = useState<string>('');

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

  // Get unique models
  const models = useMemo(() => {
    const uniqueModels = [...new Set(suites.map(s => s.modelName))];
    return uniqueModels.sort();
  }, [suites]);

  // Filter suites by selected model
  const suitesForModel = useMemo(() => {
    if (!selectedModel) return suites;
    return suites.filter(suite => suite.modelName === selectedModel);
  }, [suites, selectedModel]);

  if (suites.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No Model Data Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Complete GyroDiagnostics Suites to track model performance over time
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Model Tracker shows performance evolution and enables comparison across different models
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          📊 Model Tracker
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {suites.length} suite{suites.length !== 1 ? 's' : ''} across {models.length} model{models.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Model Selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Filter by Model:
        </label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Models</option>
          {models.map(model => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
      </div>

      {/* Timeline View */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Performance Timeline
        </h3>
        
        {suitesForModel.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No suites found for selected model
          </div>
        ) : (
          <div className="space-y-3">
            {suitesForModel.map((suite, index) => (
              <GlassCard
                key={suite.suiteRunId}
                className="p-4 hover:shadow-md transition-shadow"
                hover
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {suite.modelName} - Suite #{suitesForModel.length - index}
                  </h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(suite.completedAt)}
                  </span>
                </div>

                {/* Duration and Pathologies */}
                <div className="flex items-center gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Duration: </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatDuration(suite.totalDuration)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Pathologies: </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {suite.totalPathologies}
                    </span>
                  </div>
                </div>

                {/* Progress Rings - Horizontal Row */}
                <div className="flex items-center justify-center gap-6 mb-3">
                  {/* QI Ring */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <svg width="48" height="48" className="transform -rotate-90">
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          className="text-gray-200 dark:text-gray-700"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeDasharray={`${(suite.medianQI / 100) * 125.66} 125.66`}
                          strokeLinecap="round"
                          className={suite.medianQI >= 80 ? 'text-yellow-500' : suite.medianQI >= 60 ? 'text-yellow-500' : suite.medianQI >= 40 ? 'text-orange-500' : 'text-red-500'}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-base font-bold text-gray-700 dark:text-gray-300">
                          {Math.round(suite.medianQI)}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">QI</div>
                  </div>

                  {/* SI Ring */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <svg width="48" height="48" className="transform -rotate-90">
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          className="text-gray-200 dark:text-gray-700"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeDasharray={`${Math.min((suite.medianSI / 15) * 125.66, 125.66)} 125.66`}
                          strokeLinecap="round"
                          className={suite.medianSI >= 12 ? 'text-blue-500' : suite.medianSI >= 8 ? 'text-blue-500' : suite.medianSI >= 4 ? 'text-yellow-500' : 'text-red-500'}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-base font-bold text-gray-700 dark:text-gray-300">
                          {suite.medianSI.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">SI</div>
                  </div>

                  {/* AR Ring */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <svg width="48" height="48" className="transform -rotate-90">
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          className="text-gray-200 dark:text-gray-700"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeDasharray={`${Math.min((suite.medianAR / 0.5) * 125.66, 125.66)} 125.66`}
                          strokeLinecap="round"
                          className={suite.medianAR >= 0.3 ? 'text-yellow-500' : suite.medianAR >= 0.2 ? 'text-yellow-500' : suite.medianAR >= 0.1 ? 'text-yellow-500' : 'text-red-500'}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-base font-bold text-gray-700 dark:text-gray-300">
                          {suite.medianAR.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">AR</div>
                  </div>
                </div>

                {/* AR Category Badge */}
                <div className="flex justify-center">
                  <span className={`px-3 py-1 rounded text-xs font-medium ${getAlignmentColor(suite.mostCommonARCategory)}`}>
                    {suite.mostCommonARCategory} AR
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Comparison Table */}
      {suitesForModel.length > 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Performance Comparison
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Suite
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    QI
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    SI
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    AR
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pathologies
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {suitesForModel.map((suite, index) => (
                  <tr key={suite.suiteRunId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                      #{suitesForModel.length - index}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(suite.completedAt)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`font-medium ${getQIColor(suite.medianQI)}`}>
                        {suite.medianQI.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {suite.medianSI.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {suite.medianAR.toFixed(3)}/min
                      </span>
                      <div className={`inline-block ml-2 px-1 py-0.5 rounded text-xs ${getAlignmentColor(suite.mostCommonARCategory)}`}>
                        {suite.mostCommonARCategory}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {suite.totalPathologies}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {formatDuration(suite.totalDuration)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
