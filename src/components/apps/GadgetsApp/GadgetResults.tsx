// Gadget Results View - Show diagnosis card with metrics
// Reuses Detector results components for consistency

import React, { useMemo } from 'react';
import { NotebookState, GadgetType } from '../../../types';
import { useToast } from '../../shared/Toast';
import { insights as insightsStorage } from '../../../lib/storage';
import { generateInsightFromGadget } from '../../../lib/report-generator';
import { calculateDeceptionRiskScore, A_STAR } from '../../../lib/calculations';
import GlassCard from '../../shared/GlassCard';
import QuickSummaryCard from '../DetectorApp/QuickSummaryCard';
import TruthSpectrumGauge from '../DetectorApp/TruthSpectrumGauge';
import PathologyReport from '../DetectorApp/PathologyReport';
import TechnicalDetails from '../DetectorApp/TechnicalDetails';
import ExportActions from '../DetectorApp/ExportActions';

interface GadgetResultsProps {
  state: NotebookState;
  onUpdate: (updates: Partial<NotebookState>) => void;
  onNavigateHome: () => void;
  draftKey: string | undefined;
}

const GADGET_INFO: Record<GadgetType, { title: string; icon: string }> = {
  'detector': { title: 'Detector', icon: '🔍' },
  'policy-audit': { title: 'Policy Auditing', icon: '📊' },
  'policy-report': { title: 'Policy Reporting', icon: '📋' },
  'sanitize': { title: 'AI Infections Sanitization', icon: '🦠' },
  'immunity-boost': { title: 'Pathologies Immunity Boost', icon: '💊' }
};

const GadgetResults: React.FC<GadgetResultsProps> = ({
  state,
  onUpdate,
  onNavigateHome,
  draftKey
}) => {
  const toast = useToast();

  if (!draftKey || !state.drafts || !state.drafts[draftKey]) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-red-500 dark:text-red-400">
        Error: No gadget data found. Please start over.
        <button onClick={onNavigateHome} className="btn-secondary mt-4">← Home</button>
      </div>
    );
  }

  const draftData = state.drafts[draftKey];
  const gadgetType = state.ui.gadgetType || 'detector';
  const gadgetInfo = GADGET_INFO[gadgetType];

  // Generate insight from gadget data
  const insight = useMemo(() => {
    if (!draftData.analyst1 || !draftData.analyst2) {
      return null;
    }

    return generateInsightFromGadget(
      draftData,
      gadgetType,
      gadgetInfo.title
    );
  }, [draftData, gadgetType, gadgetInfo.title]);

  if (!insight) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <GlassCard className="p-6 text-center">
          <p className="text-red-500 dark:text-red-400 mb-4">
            Missing analyst evaluations. Please complete both analyst steps.
          </p>
          <button onClick={onNavigateHome} className="btn-secondary">
            ← Back to Gadgets
          </button>
        </GlassCard>
      </div>
    );
  }

  // Calculate DRS properly from insight quality metrics
  const drs = useMemo(() => {
    if (!insight.quality.behavior_scores) {
      return {
        score: 0,
        category: 'LOW' as const,
        factors: { foundationPenalty: 0, siRisk: 0, pathologyRisk: 0, gapRisk: 0 }
      };
    }
    
    return calculateDeceptionRiskScore(
      {
        superintelligence_index: insight.quality.superintelligence_index || 0,
        si_deviation: insight.quality.si_deviation || 1,
        aperture: insight.quality.aperture || A_STAR
      },
      {
        behavior: insight.quality.behavior_scores,
        pathologies: insight.quality.pathologies.detected || []
      }
    );
  }, [insight]);

  const metrics = {
    quality_index: insight.quality.quality_index,
    alignment_rate: insight.quality.alignment_rate,
    alignment_rate_category: insight.quality.alignment_rate_category,
    superintelligence_index: insight.quality.superintelligence_index
  };

  const handleSaveAsInsight = async () => {
    try {
      await insightsStorage.save(insight);
      toast.show('Saved to Insights library', 'success');
    } catch (error) {
      console.error('Failed to save insight:', error);
      toast.show('Failed to save insight', 'error');
    }
  };

  const handleNewAnalysis = () => {
    // Reset gadget state
    onUpdate({
      ui: {
        ...state.ui,
        gadgetView: 'selector',
        gadgetType: undefined,
        gadgetDraftKey: undefined
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-5xl mb-3">{gadgetInfo.icon}</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {gadgetInfo.title} — Diagnosis
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Quality assessment complete
        </p>
      </div>

      {/* Truth Spectrum Gauge */}
      <TruthSpectrumGauge drs={drs} />

      {/* Quick Summary */}
      <QuickSummaryCard drs={drs} metrics={metrics} arOverride={null} onArOverride={() => {}} />

      {/* Pathology Report */}
      {insight.quality.pathologies.detected.length > 0 && (
        <PathologyReport pathologies={insight.quality.pathologies.detected} />
      )}

      {/* Technical Details */}
      <TechnicalDetails 
        metrics={{
          superintelligence_index: insight.quality.superintelligence_index,
          si_deviation: insight.quality.si_deviation,
          aperture: insight.quality.aperture || A_STAR
        }}
        draftData={draftData}
        arOverride={null}
      />

      {/* Export Actions */}
      <ExportActions
        draftData={draftData}
        results={{
          aggregated: { strengths: insight.insights.summary, weaknesses: insight.insights.provision },
          metrics,
          drs
        }}
        onSaveInsight={handleSaveAsInsight}
      />

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={onNavigateHome} className="btn-secondary">
          ← Back to Gadgets
        </button>
        <button onClick={handleNewAnalysis} className="btn-primary">
          🔄 New Analysis
        </button>
      </div>
    </div>
  );
};

export default GadgetResults;

