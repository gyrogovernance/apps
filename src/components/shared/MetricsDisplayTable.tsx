// Reusable metrics display component
// Extracted from InsightDetail.tsx for reuse in Detector and Insights

import React from 'react';
import { StructureScores, BehaviorScores } from '../../types';
import { getScoreColor } from '../../lib/ui-utils';
import { STRUCTURE_METRICS, BEHAVIOR_METRICS, METRIC_CATEGORIES } from '../../lib/metric-definitions';
import { MetricCard, MetricSectionHeader } from './MetricCard';
import GlassCard from './GlassCard';

interface MetricsDisplayTableProps {
  scores: {
    structure?: StructureScores;
    behavior?: BehaviorScores;
    specialization?: Record<string, number>;
  };
  mode: 'compact' | 'full';
  showDefinitions?: boolean;
}

const MetricsDisplayTable: React.FC<MetricsDisplayTableProps> = ({
  scores,
  mode,
  showDefinitions = false
}) => {
  return (
    <div className="space-y-6">
      {/* Structure Metrics */}
      {scores.structure && (
        <div>
          <MetricSectionHeader 
            title="Structure Metrics"
            definition={METRIC_CATEGORIES.structure}
            emoji="🏗️"
          />
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(scores.structure).map(([key, value]) => (
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

      {/* Behavior Metrics */}
      {scores.behavior && (
        <div>
          <MetricSectionHeader 
            title="Behavior Metrics"
            definition={METRIC_CATEGORIES.behavior}
            emoji="🧠"
          />
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {Object.entries(scores.behavior).map(([key, value]) => (
              <MetricCard
                key={key}
                label={key}
                value={value}
                valueColor={typeof value === 'number' ? getScoreColor(value) : 'text-gray-500 dark:text-gray-400'}
                definition={BEHAVIOR_METRICS[key as keyof typeof BEHAVIOR_METRICS]}
              />
            ))}
          </div>
          {showDefinitions && (
            <GlassCard className="p-4" variant="glassBlue" borderGradient="blue">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>ℹ️ N/A Handling:</strong> Behavior metrics must be fully scored (6/6) to compute SI. 
                If any metric is N/A, SI is not computed. N/A metrics are excluded from QI normalization.
              </p>
            </GlassCard>
          )}
        </div>
      )}

      {/* Specialization Metrics */}
      {scores.specialization && Object.keys(scores.specialization).length > 0 && (
        <div>
          <MetricSectionHeader 
            title="Specialization Metrics"
            definition={METRIC_CATEGORIES.specialization}
            emoji="🎯"
          />
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {Object.entries(scores.specialization).map(([key, value]) => (
              <div key={key} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-0.5 capitalize">
                      {key}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Domain-specific metric
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ml-3 ${getScoreColor(value)}`}>
                    {value.toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty specialization state */}
      {scores.specialization && Object.keys(scores.specialization).length === 0 && showDefinitions && (
        <div>
          <MetricSectionHeader 
            title="Specialization Metrics"
            definition={METRIC_CATEGORIES.specialization}
            emoji="🎯"
          />
          <GlassCard className="p-4" variant="glassPurple" borderGradient="pink">
            <p className="text-gray-700 dark:text-gray-300">
              ℹ️ <strong>No specialization scores recorded.</strong> When empty, specialization contributes 0 to Quality Index (per GyroDiagnostics spec).
            </p>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default MetricsDisplayTable;
