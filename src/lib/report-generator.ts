// Extract report generation logic from ReportSection
// Pure business logic - no UI dependencies

import { Session, GovernanceInsight } from '../types';
import {
  aggregateAnalysts,
  calculateStructureAverage,
  calculateBehaviorAverage,
  calculateSpecializationAverage,
  calculateQualityIndex,
  calculateAlignmentRate,
  calculateSuperintelligenceIndex
} from './calculations';
import { behaviorScoresToArray } from './parsing';

/**
 * Generate a complete GovernanceInsight from a finished session
 * @throws Error if session is not complete
 */
export async function generateInsightFromSession(session: Session): Promise<GovernanceInsight> {
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

  if (!session.epochs.epoch1.completed || !session.epochs.epoch2.completed) {
    throw new Error('Both epochs must be completed');
  }

  // Aggregate and calculate QI per epoch
  const agg1 = aggregateAnalysts(a1e1, a2e1);
  const s1 = calculateStructureAverage(agg1.structure);
  const b1 = calculateBehaviorAverage(agg1.behavior);
  const sp1 = calculateSpecializationAverage(agg1.specialization);
  const QI1 = calculateQualityIndex(s1, b1, sp1);

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

  // Compute SI per epoch and use median
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

  // Use median SI if both are valid
  const validSIs = [si1Result.si, si2Result.si].filter(v => Number.isFinite(v));
  const siResult = validSIs.length > 0 
    ? { 
        si: validSIs.length === 2 ? median(validSIs) : validSIs[0],
        aperture: si1Result.aperture,
        deviation: si1Result.deviation
      }
    : { si: NaN, aperture: NaN, deviation: NaN };

  // Use aggregated data for display
  const aggregated = agg1; // Using epoch 1 for structure display
  const qualityIndex = medianQI;

  // Calculate pathology frequency across all analysts
  const totalPathologies = a1e1.pathologies.length + a2e1.pathologies.length + 
                           a1e2.pathologies.length + a2e2.pathologies.length;
  const pathologyFrequency = totalPathologies / 12;

  // Combine insights from all analyst evaluations
  const combinedInsights = `# Epoch 1 - Analyst 1\n\n${a1e1.insights}\n\n# Epoch 1 - Analyst 2\n\n${a2e1.insights}\n\n# Epoch 2 - Analyst 1\n\n${a1e2.insights}\n\n# Epoch 2 - Analyst 2\n\n${a2e2.insights}`;

  // Extract raw transcripts for auditability
  const transcripts = {
    epoch1: session.epochs.epoch1.turns.map(t => t.content),
    epoch2: session.epochs.epoch2.turns.map(t => t.content)
  };

  // Generate unique insight ID
  const insightId = `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Construct final insight object
  const insight: GovernanceInsight = {
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

  return insight;
}

