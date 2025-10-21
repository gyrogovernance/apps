import React, { useMemo, useState } from 'react';
import { GovernanceInsight } from '../../../types';

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

// Detect implicit suites from existing GyroDiagnostics insights (robust version)
const detectImplicitSuites = (insights: GovernanceInsight[]): Record<string, GovernanceInsight[]> => {
  const implicitSuites: Record<string, GovernanceInsight[]> = {};
  
  // Filter to GyroDiagnostics insights without suiteRunId (broader detection)
  const isGD = (i: GovernanceInsight) =>
    i.suiteRunId ||
    i.metadata?.evaluation_method === 'GyroDiagnostics' ||
    (i.tags && i.tags.includes('gyroDiagnostics')) ||
    (i.challenge?.domain && i.challenge.domain.map(d => d.toLowerCase()).includes('gyrodiagnostics')) ||
    (i.challenge?.title && i.challenge.title.toLowerCase().includes('gyrodiagnostics'));

  const gyroInsights = insights
    .filter(i => !i.suiteRunId && isGD(i))
    .sort((a, b) => new Date(a.process.created_at).getTime() - new Date(b.process.created_at).getTime());

  // Group by model (normalize name) with time window check
  const modelGroups: Record<string, GovernanceInsight[]> = {};
  
  gyroInsights.forEach(insight => {
    // Normalize model name (remove common suffixes like -thinking-32k)
    let model = insight.process.models_used.synthesis_epoch1 || 'Unknown';
    model = model.replace(/-thinking.*$|-instruct.*$|-flash.*$/i, '').trim();
    
    if (!modelGroups[model]) {
      modelGroups[model] = [];
    }
    modelGroups[model].push(insight);
  });

  // For each model group, find clusters within 24-hour windows
  Object.entries(modelGroups).forEach(([model, modelInsights]) => {
    let currentCluster: GovernanceInsight[] = [];
    let clusterStartTime: number | null = null;
    
    modelInsights.forEach(insight => {
      const time = new Date(insight.process.created_at).getTime();
      
      if (clusterStartTime === null || time - clusterStartTime > 24 * 60 * 60 * 1000) {
        // Start new cluster if >24h from previous
        if (currentCluster.length >= 5) {
          processCluster(model, currentCluster, implicitSuites);
        }
        currentCluster = [insight];
        clusterStartTime = time;
      } else {
        currentCluster.push(insight);
      }
    });
    
    // Process final cluster
    if (currentCluster.length >= 5) {
      processCluster(model, currentCluster, implicitSuites);
    }
  });

  return implicitSuites;
};

// Helper to process a potential cluster
const processCluster = (
  model: string,
  cluster: GovernanceInsight[],
  implicitSuites: Record<string, GovernanceInsight[]>
) => {
  // Check for exactly 5 unique challenge types (case-insensitive)
  const uniqueTypes = [...new Set(cluster.map(i => i.challenge.type.toLowerCase()))];
  const expectedTypes = new Set(['epistemic', 'formal', 'normative', 'procedural', 'strategic']);
  
  if (uniqueTypes.length === 5 && uniqueTypes.every(t => expectedTypes.has(t))) {
    // Generate implicit ID based on model + start time
    const startDate = new Date(cluster[0].process.created_at).toISOString().slice(0,10);
    const suiteRunId = `implicit_${model.replace(/[^a-z0-9]/gi, '_')}_${startDate}`;
    implicitSuites[suiteRunId] = cluster;
  }
};

export const ModelTracker: React.FC<ModelTrackerProps> = ({
  insights,
  onViewInsight
}) => {
  const [selectedModel, setSelectedModel] = useState<string>('');

  // Group insights by suiteRunId and calculate aggregates (same logic as SuiteReports)
  const suites = useMemo(() => {
    // First, group by explicit suiteRunId
    const explicitGrouped = insights.reduce((acc, insight) => {
      if (!insight.suiteRunId) return acc;
      
      if (!acc[insight.suiteRunId]) {
        acc[insight.suiteRunId] = [];
      }
      acc[insight.suiteRunId].push(insight);
      return acc;
    }, {} as Record<string, GovernanceInsight[]>);

    // Then, detect implicit suites (retroactive grouping for existing data)
    const implicitSuites = detectImplicitSuites(insights);

    // Combine both explicit and implicit suites
    const grouped = { ...explicitGrouped, ...implicitSuites };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getQIColor = (qi: number) => {
    if (qi >= 70) return 'text-green-600 dark:text-green-400';
    if (qi >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getARCategoryColor = (category: string) => {
    switch (category) {
      case 'VALID': return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200';
      case 'SUPERFICIAL': return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200';
      case 'SLOW': return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

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
              <div
                key={suite.suiteRunId}
                className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                {/* Timeline indicator with progress ring */}
                <div className="flex flex-col items-center relative">
                  <svg width="24" height="24" className="transform -rotate-90">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={`${(suite.medianQI / 100) * 62.83} 62.83`}
                      className={suite.medianQI >= 70 ? 'text-green-500' : suite.medianQI >= 50 ? 'text-yellow-500' : 'text-red-500'}
                    />
                  </svg>
                  {index < suitesForModel.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600 mt-2"></div>
                  )}
                </div>

                {/* Suite info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {suite.modelName} - Suite #{suitesForModel.length - index}
                    </h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(suite.completedAt)}
                    </span>
                  </div>
                  
                  {/* Metrics */}
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">QI: </span>
                      <span className={`font-medium ${getQIColor(suite.medianQI)}`}>
                        {suite.medianQI.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">SI: </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {suite.medianSI.toFixed(1)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">AR: </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {suite.medianAR.toFixed(3)}/min
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Duration: </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatDuration(suite.totalDuration)}
                      </span>
                    </div>
                  </div>

                  {/* AR Category */}
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getARCategoryColor(suite.mostCommonARCategory)}`}>
                      {suite.mostCommonARCategory} AR
                    </span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {suite.totalPathologies} pathologies
                    </span>
                  </div>
                </div>
              </div>
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
                      <div className={`inline-block ml-2 px-1 py-0.5 rounded text-xs ${getARCategoryColor(suite.mostCommonARCategory)}`}>
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
