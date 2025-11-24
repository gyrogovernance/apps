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
  calculateSuperintelligenceIndex,
  A_STAR
} from './calculations';
import { behaviorScoresToArray } from './parsing';
import { GADGET_CONSTANTS } from './constants';

/**
 * Generate a complete GovernanceInsight from a finished session.
 * 
 * Primary report generation function that transforms a completed session
 * into a shareable GovernanceInsight. Performs metric calculations,
 * aggregations, and data transformations.
 * 
 * Process: Validates 4 analyst evaluations, calculates QI/AR/SI per epoch,
 * takes medians, aggregates pathologies, combines insights, packages into schema.
 * 
 * Requires both epochs completed (6 turns each) and all 4 analyst slots filled.
 * SI computation is optional (returns NaN if any behavior score is N/A).
 * 
 * @param session - The completed evaluation session
 * @returns Complete GovernanceInsight ready for export or library storage
 * @throws Error if any epoch incomplete or analyst evaluation missing
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

  // Build detailed error message for missing analysts with status info
  const missingAnalysts: string[] = [];
  const statusDetails: string[] = [];
  
  if (!a1e1) {
    missingAnalysts.push('Epoch 1 - Analyst 1');
    statusDetails.push(`Epoch 1 - Analyst 1: status=${session.analysts.epoch1.analyst1?.status || 'missing'}`);
  }
  if (!a2e1) {
    missingAnalysts.push('Epoch 1 - Analyst 2');
    statusDetails.push(`Epoch 1 - Analyst 2: status=${session.analysts.epoch1.analyst2?.status || 'missing'}`);
  }
  if (!a1e2) {
    missingAnalysts.push('Epoch 2 - Analyst 1');
    statusDetails.push(`Epoch 2 - Analyst 1: status=${session.analysts.epoch2.analyst1?.status || 'missing'}`);
  }
  if (!a2e2) {
    missingAnalysts.push('Epoch 2 - Analyst 2');
    statusDetails.push(`Epoch 2 - Analyst 2: status=${session.analysts.epoch2.analyst2?.status || 'missing'}`);
  }

  if (missingAnalysts.length > 0) {
    const debugInfo = statusDetails.length > 0 ? ` (${statusDetails.join(', ')})` : '';
    throw new Error(`Missing analyst evaluations: ${missingAnalysts.join(', ')}${debugInfo}. Please complete all analyst evaluations before generating the report.`);
  }

  if (!session.epochs.epoch1.completed || !session.epochs.epoch2.completed) {
    const missingEpochs: string[] = [];
    if (!session.epochs.epoch1.completed) missingEpochs.push('Epoch 1');
    if (!session.epochs.epoch2.completed) missingEpochs.push('Epoch 2');
    throw new Error(`Missing epochs: ${missingEpochs.join(', ')}. Please complete all epochs before generating the report.`);
  }

  // At this point, all analyst evaluations are guaranteed to be non-null
  // TypeScript needs explicit assertions after the validation checks
  const a1e1NonNull = a1e1!;
  const a2e1NonNull = a2e1!;
  const a1e2NonNull = a1e2!;
  const a2e2NonNull = a2e2!;

  // Aggregate and calculate QI per epoch
  const agg1 = aggregateAnalysts(a1e1NonNull, a2e1NonNull);
  const s1 = calculateStructureAverage(agg1.structure);
  const b1 = calculateBehaviorAverage(agg1.behavior);
  const sp1 = calculateSpecializationAverage(agg1.specialization);
  const QI1 = calculateQualityIndex(s1, b1, sp1);

  const agg2 = aggregateAnalysts(a1e2NonNull, a2e2NonNull);
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

  // Compute SI per epoch and use medians across all SI metrics
  const siEpochs: Array<{ si: number; aperture: number; deviation: number }> = [];
  try {
    const behaviorArray1 = behaviorScoresToArray(agg1.behavior);
    siEpochs.push(calculateSuperintelligenceIndex(behaviorArray1));
  } catch (e) {
    console.warn('SI unavailable for epoch 1:', e);
  }
  try {
    const behaviorArray2 = behaviorScoresToArray(agg2.behavior);
    siEpochs.push(calculateSuperintelligenceIndex(behaviorArray2));
  } catch (e) {
    console.warn('SI unavailable for epoch 2:', e);
  }

  // Helper to compute median of numeric values
  const pickMedian = (arr: number[]) => {
    const a = arr.filter(Number.isFinite).sort((x, y) => x - y);
    if (a.length === 0) return NaN;
    return a.length % 2 ? a[(a.length - 1) / 2] : a[Math.floor(a.length / 2)];
  };

  // Compute medians for si, aperture, and deviation independently
  const siResult = siEpochs.length
    ? {
        si: pickMedian(siEpochs.map(r => r.si)),
        aperture: pickMedian(siEpochs.map(r => r.aperture)),
        deviation: pickMedian(siEpochs.map(r => r.deviation))
      }
    : { si: NaN, aperture: NaN, deviation: NaN };

  // Use aggregated data for display
  const aggregated = agg1; // Using epoch 1 for structure display
  const qualityIndex = medianQI;

  // Union pathologies across all 4 analyst evaluations
  const allDetected = Array.from(new Set([
    ...a1e1NonNull.pathologies, ...a2e1NonNull.pathologies, ...a1e2NonNull.pathologies, ...a2e2NonNull.pathologies
  ]));
  const totalPathologies = a1e1NonNull.pathologies.length + a2e1NonNull.pathologies.length +
                           a1e2NonNull.pathologies.length + a2e2NonNull.pathologies.length;
  const pathologyFrequency = totalPathologies / 4; // per-evaluation average

  // Combine insights from all analyst evaluations
  const combinedInsights = `# Epoch 1 - Analyst 1\n\n${a1e1NonNull.insights}\n\n# Epoch 1 - Analyst 2\n\n${a2e1NonNull.insights}\n\n# Epoch 2 - Analyst 1\n\n${a1e2NonNull.insights}\n\n# Epoch 2 - Analyst 2\n\n${a2e2NonNull.insights}`;

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
      aperture: siResult.aperture, // Directly from SI calculation
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
        detected: allDetected,
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
      schema_version: '1.0'
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

/**
 * Generate a GovernanceInsight from gadget evaluation data.
 * Simplified version for single-transcript evaluations (RapidTest, Gadgets).
 * 
 * @param draftData - The gadget draft containing transcript and analyst evaluations
 * @param gadgetType - Type of gadget used
 * @param title - Title for the insight
 * @returns Complete GovernanceInsight
 */
export function generateInsightFromGadget(
  draftData: any,
  gadgetType: string,
  title: string
): GovernanceInsight {
  const analyst1 = draftData.analyst1;
  const analyst2 = draftData.analyst2;

  if (!analyst1) {
    throw new Error('Analyst must complete evaluation');
  }

  // Use single analyst or aggregate if both exist (backward compatibility)
  let aggregated;
  if (analyst2) {
    aggregated = aggregateAnalysts(analyst1, analyst2);
  } else {
    // Single analyst: use directly (normalize structure)
    aggregated = {
      structure: analyst1.structure_scores || {},
      behavior: analyst1.behavior_scores || {},
      specialization: analyst1.specialization_scores || {},
      pathologies: analyst1.pathologies || [],
      strengths: analyst1.strengths || '',
      weaknesses: analyst1.weaknesses || '',
      insights: analyst1.insights || ''
    };
  }

  // Calculate component scores from aggregated (note: structure/behavior/specialization keys)
  const structureAvg = calculateStructureAverage(aggregated.structure);
  const behaviorAvg = calculateBehaviorAverage(aggregated.behavior);
  const specializationAvg = calculateSpecializationAverage(aggregated.specialization);

  // Calculate QI
  const qualityIndex = calculateQualityIndex(structureAvg, behaviorAvg, specializationAvg);

  // Calculate AR (coerce duration and avoid falsy 0 → default)
  // For gadgets, default to 6 minutes if not provided or ≤ 0
  const parsedDuration = Number(draftData.durationMinutes);
  const durationMinutes = Number.isFinite(parsedDuration) && parsedDuration > 0 
    ? Math.max(parsedDuration, GADGET_CONSTANTS.DEFAULT_DURATION_MINUTES)
    : GADGET_CONSTANTS.DEFAULT_DURATION_MINUTES;
  const { rate: alignmentRate, category: alignmentCategory } = calculateAlignmentRate(
    qualityIndex,
    durationMinutes
  );

  // Calculate SI (handle N/A gracefully)
  let si = 0;
  let deviation = 0;
  let aperture = A_STAR; // Default to target aperture
  try {
    const behaviorArray = behaviorScoresToArray(aggregated.behavior);
    const result = calculateSuperintelligenceIndex(behaviorArray);
    si = result.si;
    deviation = result.deviation;
    aperture = result.aperture;
  } catch (error) {
    // If SI calculation fails (e.g., due to N/A values), mark as unavailable
    console.warn('SI calculation skipped:', error);
    si = NaN;
    deviation = NaN;
    aperture = A_STAR;
  }

  // Get pathologies
  const pathologies1 = analyst1.pathologies || [];
  const pathologies2 = analyst2?.pathologies || [];
  const allPathologies = [...pathologies1, ...pathologies2];
  const uniquePathologies = Array.from(new Set(allPathologies));

  // Combine insights (if both analysts, otherwise just one)
  const combinedInsights = analyst2 
    ? `${analyst1.insights}\n\n---\n\n${analyst2.insights}`
    : (analyst1.insights || '');

  // Normalize tags helper for consistent style
  const normalizeTags = (tags: string[]): string[] => {
    const singularMap: Record<string, string> = {
      gadgets: 'gadget',
      'policy analysis': 'policy-analysis',
      'policy-analysis': 'policy-analysis'
    };
    return Array.from(new Set(tags.map(t => {
      const raw = (t || '').toString().trim().toLowerCase();
      const kebab = raw.replace(/\s+/g, '-');
      return singularMap[kebab] || kebab;
    })));
  };

  const insight: GovernanceInsight = {
    id: `gadget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    challenge: {
      title,
      description: `Evaluated using ${gadgetType} gadget`,
      type: gadgetType,
      domain: ['Analysis']
    },
    insights: {
      summary: analyst1.strengths || 'Analysis completed',
      participation: 'Gadget-based evaluation',
      preparation: combinedInsights,
      provision: analyst1.weaknesses || 'See detailed analysis',
      combined_markdown: combinedInsights
    },
    // No transcript storage - JSON-only workflow
    transcripts: {
      epoch1: [],
      epoch2: []
    },
    quality: {
      quality_index: qualityIndex,
      alignment_rate: alignmentRate,
      alignment_rate_category: alignmentCategory,
      superintelligence_index: si,
      si_deviation: deviation,
      aperture: aperture, // Directly from SI calculation
      structure_scores: aggregated.structure,
      behavior_scores: aggregated.behavior,
      specialization_scores: aggregated.specialization,
      pathologies: {
        detected: uniquePathologies,
        frequency: uniquePathologies.length
      }
    },
    metadata: {
      created_at: new Date().toISOString(),
      model_name: draftData.model_analyst1 || 'Unknown',
      duration_minutes: durationMinutes,
      version: '1.0'
    },
    process: {
      platform: 'custom',
      models_used: {
        synthesis_epoch1: draftData.model_analyst1 || 'Unknown',
        synthesis_epoch2: draftData.model_analyst2 || draftData.model_analyst1 || 'Unknown',
        analyst1: draftData.model_analyst1 || 'Unknown',
        analyst2: draftData.model_analyst2 || draftData.model_analyst1 || 'Unknown'
      },
      durations: {
        epoch1_minutes: durationMinutes,
        epoch2_minutes: 0
      },
      created_at: new Date().toISOString(),
      schema_version: '1.0'
    },
    contribution: {
      public: true,
      license: 'CC0' as const,
      contributor: 'Anonymous'
    },
    tags: (() => {
      // Simplify: all gadget outputs belong to one library bucket
      return normalizeTags(['policy-analyses']);
    })(),
    starred: false,
    notes: ''
  };

  return insight;
}

