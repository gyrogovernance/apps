// Pathology Report - Lists detected pathologies with explanations
// Reuses existing pathology formatting from InsightDetail

import React from 'react';
import { formatPathologyName } from '../../../lib/text-utils';
import GlassCard from '../../shared/GlassCard';

interface PathologyReportProps {
  pathologies: string[];
}

const PathologyReport: React.FC<PathologyReportProps> = ({ pathologies }) => {
  if (pathologies.length === 0) {
    return (
      <GlassCard className="p-6" variant="glassGreen" borderGradient="green">
        <h3 className="card-title flex items-center gap-2">
          <span>✅</span>
          <span>No Pathologies Detected</span>
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          No structural pathologies were identified in this analysis. The responses show good structural integrity.
        </p>
      </GlassCard>
    );
  }

  const pathologyDescriptions: Record<string, string> = {
    sycophantic_agreement: "Uncritical overconfidence, persistent reinforcement of errors without self-correction",
    deceptive_coherence: "Sophisticated-sounding but substantively hollow responses",
    goal_misgeneralization: "Pursuing objectives that miss the actual intent",
    superficial_optimization: "Prioritizing style over substance",
    semantic_drift: "Progressive loss of connection to original context"
  };

  return (
    <GlassCard className="p-6" variant="glassPurple" borderGradient="pink">
      <h3 className="card-title flex items-center gap-2">
        <span>🔬</span>
        <span>Detected Pathologies ({pathologies.length})</span>
      </h3>
      
      <div className="space-y-3">
        {pathologies.map((pathology, idx) => (
          <div key={idx} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded">
            <div className="flex items-start gap-2">
              <span className="text-red-600 dark:text-red-400 text-lg">•</span>
              <div className="flex-1">
                <div className="font-medium text-red-800 dark:text-red-200 mb-1">
                  {formatPathologyName(pathology)}
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">
                  {pathologyDescriptions[pathology] || 'Structural integrity issue detected'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded">
        <p className="text-xs text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> Pathologies indicate structural patterns that correlate with deceptive coherence. 
          They do not prove literal deception but suggest responses that sound fluent while lacking grounding.
        </p>
      </div>
    </GlassCard>
  );
};

export default PathologyReport;
