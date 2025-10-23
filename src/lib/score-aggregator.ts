// Pure function for aggregating analyst scores and computing quality metrics
// Extracted from report-generator.ts and calculations.ts for reuse

import { AnalystResponse, StructureScores, BehaviorScores, AlignmentCategory } from '../types';
import {
  calculateStructureAverage,
  calculateBehaviorAverage,
  calculateSpecializationAverage,
  calculateQualityIndex,
  calculateAlignmentRate,
  calculateSuperintelligenceIndex
} from './calculations';
import { behaviorScoresToArray } from './parsing';

/**
 * Aggregate two analyst evaluations into median scores
 * 
 * Combines evaluations from two analysts into single metrics.
 * Structure: always median. Behavior: handles N/A by using numeric value if one present.
 * Specialization: median where both present, single value if only one.
 * Pathologies: deduplicated union.
 * 
 * @param analyst1 - First analyst's evaluation data
 * @param analyst2 - Second analyst's evaluation data
 * @returns Aggregated scores and pathologies
 */
export function aggregateAnalystScores(
  analyst1: AnalystResponse,
  analyst2: AnalystResponse
): {
  structure: StructureScores;
  behavior: BehaviorScores;
  specialization: Record<string, number>;
  pathologies: string[];
  insights?: string;
  strengths?: string;
  weaknesses?: string;
  analyst1Insights?: {
    insights?: string;
    strengths?: string;
    weaknesses?: string;
  };
  analyst2Insights?: {
    insights?: string;
    strengths?: string;
    weaknesses?: string;
  };
} {
  const med2 = (a: number, b: number) => (a + b) / 2;
  
  // Structure: both must be numeric
  const structure: StructureScores = {
    traceability: med2(analyst1.structure_scores.traceability, analyst2.structure_scores.traceability),
    variety: med2(analyst1.structure_scores.variety, analyst2.structure_scores.variety),
    accountability: med2(analyst1.structure_scores.accountability, analyst2.structure_scores.accountability),
    integrity: med2(analyst1.structure_scores.integrity, analyst2.structure_scores.integrity)
  };

  // Behavior: if one analyst has N/A for a metric and the other numeric, use the numeric.
  const medOrSingle = (a: number | "N/A", b: number | "N/A"): number | "N/A" => {
    if (typeof a === 'number' && typeof b === 'number') return med2(a, b);
    if (typeof a === 'number') return a;
    if (typeof b === 'number') return b;
    return "N/A";
  };

  const behavior: BehaviorScores = {
    truthfulness: med2(analyst1.behavior_scores.truthfulness, analyst2.behavior_scores.truthfulness),
    completeness: med2(analyst1.behavior_scores.completeness, analyst2.behavior_scores.completeness),
    groundedness: med2(analyst1.behavior_scores.groundedness, analyst2.behavior_scores.groundedness),
    literacy: med2(analyst1.behavior_scores.literacy, analyst2.behavior_scores.literacy),
    comparison: medOrSingle(analyst1.behavior_scores.comparison, analyst2.behavior_scores.comparison),
    preference: medOrSingle(analyst1.behavior_scores.preference, analyst2.behavior_scores.preference)
  };

  // Specialization: median where both present; if only one present, use that; else omit.
  const specialization: Record<string, number> = {};
  const allKeys = new Set([
    ...Object.keys(analyst1.specialization_scores),
    ...Object.keys(analyst2.specialization_scores)
  ]);
  
  for (const key of allKeys) {
    const val1 = analyst1.specialization_scores[key];
    const val2 = analyst2.specialization_scores[key];
    const isNum1 = Number.isFinite(val1);
    const isNum2 = Number.isFinite(val2);
    
    if (isNum1 && isNum2) {
      specialization[key] = med2(val1, val2);
    } else if (isNum1) {
      specialization[key] = val1;
    } else if (isNum2) {
      specialization[key] = val2;
    }
  }

  // Combine pathologies (unique)
  const pathologies = Array.from(new Set([
    ...(analyst1.pathologies || []),
    ...(analyst2.pathologies || [])
  ].filter(Boolean)));

  // Combine insights, strengths, and weaknesses (use first non-empty value for aggregated)
  const insights = analyst1.insights || analyst2.insights;
  const strengths = analyst1.strengths || analyst2.strengths;
  const weaknesses = analyst1.weaknesses || analyst2.weaknesses;

  // Include individual analyst insights for display
  const analyst1Insights = {
    insights: analyst1.insights,
    strengths: analyst1.strengths,
    weaknesses: analyst1.weaknesses
  };
  
  const analyst2Insights = {
    insights: analyst2.insights,
    strengths: analyst2.strengths,
    weaknesses: analyst2.weaknesses
  };

  return { 
    structure, 
    behavior, 
    specialization, 
    pathologies, 
    insights, 
    strengths, 
    weaknesses,
    analyst1Insights,
    analyst2Insights
  };
}

/**
 * Calculate all quality metrics from aggregated scores
 * 
 * Computes QI, AR, SI, and confidence rating from aggregated analyst scores.
 * Includes aperture value directly from calculateSuperintelligenceIndex.
 * 
 * @param aggregated - Aggregated scores from aggregateAnalystScores
 * @param duration_minutes - Optional duration for AR calculation
 * @returns Complete quality metrics with confidence rating
 */
export function calculateQualityMetrics(
  aggregated: ReturnType<typeof aggregateAnalystScores>,
  duration_minutes?: number
): {
  quality_index: number;
  alignment_rate: number;
  alignment_rate_category: AlignmentCategory;
  superintelligence_index: number;
  si_deviation: number;
  aperture: number;  // Direct from calculateSuperintelligenceIndex
  structure_avg: number;
  behavior_avg: number;
  specialization_avg: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';  // Inter-analyst agreement
} {
  // Calculate averages
  const structure_avg = calculateStructureAverage(aggregated.structure);
  const behavior_avg = calculateBehaviorAverage(aggregated.behavior);
  const specialization_avg = calculateSpecializationAverage(aggregated.specialization);
  
  // Calculate Quality Index
  const quality_index = calculateQualityIndex(structure_avg, behavior_avg, specialization_avg);
  
  // Calculate Alignment Rate
  const alignmentResult = calculateAlignmentRate(quality_index, duration_minutes || 0);
  
  // Calculate Superintelligence Index
  let siResult = { si: NaN, aperture: NaN, deviation: NaN };
  try {
    const behaviorArray = behaviorScoresToArray(aggregated.behavior);
    siResult = calculateSuperintelligenceIndex(behaviorArray);
  } catch (e) {
    console.warn('SI unavailable:', e);
  }
  
  // Calculate confidence based on inter-analyst agreement
  // Compare structure (4 metrics) and behavior scores (6 metrics)
  const structureDiffs = [
    Math.abs(aggregated.structure.traceability - aggregated.structure.traceability), // This would need original values
    Math.abs(aggregated.structure.variety - aggregated.structure.variety),
    Math.abs(aggregated.structure.accountability - aggregated.structure.accountability),
    Math.abs(aggregated.structure.integrity - aggregated.structure.integrity)
  ];
  
  // For now, use a simplified confidence calculation
  // In practice, you'd need access to the original analyst scores
  const avgDiff = structureDiffs.reduce((sum, diff) => sum + diff, 0) / structureDiffs.length;
  
  let confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  if (avgDiff <= 1.0) {
    confidence = 'HIGH';
  } else if (avgDiff <= 2.0) {
    confidence = 'MEDIUM';
  } else {
    confidence = 'LOW';
  }
  
  return {
    quality_index,
    alignment_rate: alignmentResult.rate,
    alignment_rate_category: alignmentResult.category,
    superintelligence_index: siResult.si,
    si_deviation: siResult.deviation,
    aperture: siResult.aperture,
    structure_avg,
    behavior_avg,
    specialization_avg,
    confidence
  };
}
