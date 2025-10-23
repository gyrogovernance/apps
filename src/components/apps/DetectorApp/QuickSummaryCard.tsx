// Quick Summary Card - Shows DRS interpretation in plain language
// Includes confidence rating and AR estimation with user override

import React, { useState } from 'react';
import GlassCard from '../../shared/GlassCard';

interface QuickSummaryCardProps {
  drs: {
    score: number;
    category: 'LOW' | 'MODERATE' | 'HIGH';
    factors: Record<string, number>;
  };
  metrics: {
    quality_index: number;
    alignment_rate: number;
    alignment_rate_category: string;
    superintelligence_index: number;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  arOverride: number | null;
  onArOverride: (value: number | null) => void;
}

const QuickSummaryCard: React.FC<QuickSummaryCardProps> = ({
  drs,
  metrics,
  arOverride,
  onArOverride
}) => {

  const getKeyFinding = () => {
    if (drs.category === 'HIGH') {
      if (drs.factors.deceptive_coherence > 0) {
        return "Scoring imbalance detected: high fluency scores mask low truthfulness/groundedness - classic deceptive coherence pattern";
      }
      if (drs.factors.pathology_count > 20) {
        return "Multiple scoring pathologies detected through pattern analysis - significant integrity issues";
      }
      return "Significant scoring imbalances detected - high risk of deceptive coherence";
    }
    if (drs.category === 'MODERATE') {
      return "Some scoring imbalances detected - monitor for consistency across evaluation criteria";
    }
    return "Balanced scoring across evaluation criteria - structurally sound responses";
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'HIGH': return 'text-green-600 dark:text-green-400';
      case 'MEDIUM': return 'text-yellow-600 dark:text-yellow-400';
      case 'LOW': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <GlassCard className="p-6" variant="glassGreen" borderGradient="green">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
            Summary
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This transcript shows <strong>{drs.category}</strong> risk of deceptive coherence patterns 
            based on scoring imbalance analysis across 12 evaluation criteria.
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600 dark:text-gray-400">Risk Level</div>
          <div className={`text-lg font-bold ${
            drs.category === 'HIGH' ? 'text-red-600 dark:text-red-400' :
            drs.category === 'MODERATE' ? 'text-yellow-600 dark:text-yellow-400' :
            'text-green-600 dark:text-green-400'
          }`}>
            {drs.category}
          </div>
        </div>
      </div>

      {/* Key Finding */}
      <div className="mb-4 p-3 bg-white/50 dark:bg-gray-900/30 rounded border border-gray-200 dark:border-gray-700">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          Key Finding
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {getKeyFinding()}
        </div>
      </div>

      {/* Quick Metrics with Progress Rings */}
      <div className="flex justify-center gap-8 mb-4">
        {/* QI Ring */}
        <div className="flex flex-col items-center">
          <div className="relative mb-2">
            <svg width="48" height="48" className="transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="24"
                cy="24"
                r="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${(metrics.quality_index / 100) * 113.1} 113.1`}
                strokeLinecap="round"
                className={metrics.quality_index >= 80 ? 'text-green-500' : metrics.quality_index >= 60 ? 'text-yellow-500' : metrics.quality_index >= 40 ? 'text-orange-500' : 'text-red-500'}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {Math.round(metrics.quality_index)}
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">QI</div>
        </div>

        {/* SI Ring */}
        <div className="flex flex-col items-center">
          <div className="relative mb-2">
            <svg width="48" height="48" className="transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="24"
                cy="24"
                r="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${Math.min((metrics.superintelligence_index / 15) * 113.1, 113.1)} 113.1`}
                strokeLinecap="round"
                className={metrics.superintelligence_index >= 12 ? 'text-purple-500' : metrics.superintelligence_index >= 8 ? 'text-blue-500' : metrics.superintelligence_index >= 4 ? 'text-yellow-500' : 'text-red-500'}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {isNaN(metrics.superintelligence_index) ? 'N/A' : metrics.superintelligence_index.toFixed(1)}
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">SI</div>
        </div>

        {/* AR Ring */}
        <div className="flex flex-col items-center">
          <div className="relative mb-2">
            <svg width="48" height="48" className="transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="24"
                cy="24"
                r="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${Math.min((metrics.alignment_rate / 0.5) * 113.1, 113.1)} 113.1`}
                strokeLinecap="round"
                className={metrics.alignment_rate >= 0.3 ? 'text-emerald-500' : metrics.alignment_rate >= 0.2 ? 'text-green-500' : metrics.alignment_rate >= 0.1 ? 'text-yellow-500' : 'text-red-500'}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {metrics.alignment_rate.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">AR</div>
        </div>
      </div>

      {/* AR Category Badge */}
      <div className="flex justify-center mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
          metrics.alignment_rate_category === 'VALID' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200' :
          metrics.alignment_rate_category === 'SUPERFICIAL' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200' :
          'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
        }`}>
          {metrics.alignment_rate_category} AR
        </span>
      </div>
    </GlassCard>
  );
};

export default QuickSummaryCard;
