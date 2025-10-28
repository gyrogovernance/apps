// Technical Details - Collapsible card showing technical information
// Includes aperture value, SI deviation, inter-analyst agreement, AR calculation details

import React from 'react';
import GlassCard from '../../shared/GlassCard';
import { CopyableDetails } from '../../shared/CopyableDetails';

interface TechnicalDetailsProps {
  metrics: {
    superintelligence_index: number;
    si_deviation: number;
    aperture: number;
  };
  draftData: any;
  arOverride: number | null;
}

const TechnicalDetails: React.FC<TechnicalDetailsProps> = ({
  metrics,
  draftData,
  arOverride
}) => {
  return (
    <GlassCard className="p-6" variant="glassBlue" borderGradient="blue">
      <details className="group">
        <summary className="cursor-pointer text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 hover:text-blue-600 dark:hover:text-blue-400 list-none [&::-webkit-details-marker]:hidden [&::marker]:hidden flex items-center gap-2">
          <span className="text-gray-500 dark:text-gray-400 group-open:rotate-90 transition-transform">▶</span>
          <span>Technical Details</span>
        </summary>
        
        <div className="space-y-4 mt-4">
          {/* Key Metrics Explained */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Key Metrics Explained
                  </h4>
                  <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <div>
                      <strong>SI:</strong> Structural coherence measure
                    </div>
                    <div>
                      <strong>Pathologies:</strong> Failure modes detected
                    </div>
                    <div>
                      <strong>Aperture:</strong> Balance metric (target 0.02070)
                    </div>
                    <div>
                      <strong>Gap:</strong> Surface quality vs. foundations
                    </div>
                  </div>
                </div>

          {/* Aperture and SI Information */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Structural Coherence Analysis
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Aperture Value
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {metrics.aperture.toFixed(5)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Target: 0.02070 (K=4)
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Deviation: {isNaN(metrics.si_deviation) ? 'N/A' : `${metrics.si_deviation.toFixed(2)}×`} from target
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SI Deviation
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {isNaN(metrics.si_deviation) ? 'N/A' : `${metrics.si_deviation.toFixed(2)}×`}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  From target aperture
                </div>
              </div>
            </div>
            
            {isNaN(metrics.superintelligence_index) && (
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>⚠️ SI Unavailable:</strong> Superintelligence Index could not be computed (requires all behavior metrics to be numeric).
                  This reduces confidence in the structural analysis but DRS calculation continues with base components.
                </p>
              </div>
            )}
          </div>

          {/* AR Calculation Details */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Alignment Rate Calculation
            </h4>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                <strong>Duration Estimate:</strong> {arOverride ? `${arOverride} minutes (user override)` : `${draftData?.parsedResult?.turns?.length || 0} turns × 1.5 min/turn = ${(draftData?.parsedResult?.turns?.length || 0) * 1.5} minutes`}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                AR = Quality Index / Duration (in minutes)
              </div>
            </div>
          </div>

          {/* Raw Values */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Raw Values
            </h4>
            <CopyableDetails
              title="View Raw Metrics"
              content={JSON.stringify({
                superintelligence_index: metrics.superintelligence_index,
                si_deviation: metrics.si_deviation,
                aperture: metrics.aperture,
                transcript_turns: draftData?.parsedResult?.turns?.length || 0,
                parsing_method: draftData?.parsedResult?.method || 'unknown',
                analyst_models: {
                  analyst1: draftData?.model_analyst1 || 'Unknown',
                  analyst2: draftData?.model_analyst2 || 'Unknown'
                }
              }, null, 2)}
              rows={8}
            />
          </div>
        </div>
      </details>
    </GlassCard>
  );
};

export default TechnicalDetails;
