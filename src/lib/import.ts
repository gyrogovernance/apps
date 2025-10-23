// Import utilities for GyroDiagnostics evaluation data

import JSZip from 'jszip';
import { GovernanceInsight, ChallengeType } from '../types';

/**
 * GyroDiagnostics challenge data structure (from analog analyzer output)
 */
interface GyroDiagnosticsChallenge {
  challenge_type: string;
  task_name: string;
  epochs_analyzed: number;
  median_quality_index: number;
  mean_quality_index?: number;
  std_quality_index?: number;
  min_quality_index?: number;
  max_quality_index?: number;
  median_duration_minutes: number;
  mean_duration_minutes?: number;
  std_duration_minutes?: number;
  alignment_rate: number;
  alignment_rate_status: string;
  superintelligence_stats: {
    median_superintelligence_index: number;
    median_deviation_factor: number;
    median_aperture?: number;
    mean_aperture?: number;
    std_aperture?: number;
    target_aperture: number;
    aperture_deviation?: number;
    interpretation?: string;
  };
  pathology_counts: Record<string, number>;
  epoch_results: Array<{
    quality_index?: number;
    duration_minutes?: number;
    structure_scores: Record<string, number>;
    behavior_scores: Record<string, number | 'N/A'>;
    specialization_scores: Record<string, number>;
    pathologies: string[];
    insights: string;
    aperture?: number;
    closure?: number;
    gradient_norm?: number;
    residual_norm?: number;
    vertex_potential?: number[];
    analyst_count: number;
  }>;
}

/**
 * GyroDiagnostics evaluation file structure
 */
interface GyroDiagnosticsData {
  metadata?: {
    model_tested: string;
    model_version: string;
    synthesist_notes: string;
    analyst_models: string[];
    timings: Record<string, number>;
  };
  challenges?: {
    [challengeType: string]: GyroDiagnosticsChallenge;
  };
  // Legacy flat structure support (allows arbitrary challenge types)
  [challengeType: string]: GyroDiagnosticsChallenge | Record<string, any> | undefined;
}

/**
 * Validate if a JSON structure is a valid GyroDiagnostics evaluation
 */
export function isGyroDiagnosticsFormat(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  
  const validTypes = ['formal', 'normative', 'procedural', 'strategic', 'epistemic'];
  
  // Check for new structured format
  if (data.challenges && typeof data.challenges === 'object') {
    const challengeKeys = Object.keys(data.challenges);
    const hasValidType = challengeKeys.some(k => validTypes.includes(k));
    if (hasValidType) {
      // Check structure of first valid challenge
      for (const key of challengeKeys) {
        if (validTypes.includes(key)) {
          const challenge = data.challenges[key];
          return (
            challenge.challenge_type &&
            challenge.alignment_rate !== undefined &&
            challenge.median_quality_index !== undefined &&
            Array.isArray(challenge.epoch_results)
          );
        }
      }
    }
  }
  
  // Check for legacy flat structure
  const keys = Object.keys(data);
  const hasValidType = keys.some(k => validTypes.includes(k));
  if (hasValidType) {
    // Check structure of first valid challenge
    for (const key of keys) {
      if (validTypes.includes(key)) {
        const challenge = data[key];
        return (
          challenge.challenge_type &&
          challenge.alignment_rate !== undefined &&
          challenge.median_quality_index !== undefined &&
          Array.isArray(challenge.epoch_results)
        );
      }
    }
  }
  
  return false;
}

/**
 * Extract model name from filename
 * Removes common prefixes/suffixes and formats for display
 */
export function extractModelName(filename: string): string {
  let modelName = filename
    .replace('_analysis_data.json', '')
    .replace('_data.json', '')
    .replace(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}_/, '') // Remove timestamp prefix
    .replace(/^results[\/\\]/, '') // Remove results/ prefix if present (handle both / and \)
    .replace(/^.*[\/\\]/, '') // Remove any remaining path components
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
    
  return modelName;
}

/**
 * Aggregate epoch results into single values
 */
function aggregateEpochResults(epochResults: GyroDiagnosticsChallenge['epoch_results']) {
  if (epochResults.length === 0) {
    throw new Error('No epoch results to aggregate');
  }
  
  // Use first epoch's structure as template
  const first = epochResults[0];
  
  // Helper to average a specific field across epochs
  const average = (key: string, scoresObj: 'structure_scores' | 'behavior_scores'): number => {
    const values = epochResults
      .map(e => e[scoresObj][key])
      .filter(v => typeof v === 'number') as number[];
    return values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
  };
  
  // Helper for behavior scores (may return N/A)
  const averageOrNA = (key: string): number | 'N/A' => {
    const values = epochResults
      .map(e => e.behavior_scores[key])
      .filter(v => typeof v === 'number') as number[];
    return values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 'N/A';
  };
  
  // Build proper StructureScores object
  const structureScores = {
    traceability: average('traceability', 'structure_scores'),
    variety: average('variety', 'structure_scores'),
    accountability: average('accountability', 'structure_scores'),
    integrity: average('integrity', 'structure_scores')
  };
  
  // Build proper BehaviorScores object
  const behaviorScores = {
    truthfulness: average('truthfulness', 'behavior_scores'),
    completeness: average('completeness', 'behavior_scores'),
    groundedness: average('groundedness', 'behavior_scores'),
    literacy: average('literacy', 'behavior_scores'),
    comparison: averageOrNA('comparison'),
    preference: averageOrNA('preference')
  };
  
  // Average specialization scores
  const specializationScores: Record<string, number> = {};
  if (first.specialization_scores) {
    Object.keys(first.specialization_scores).forEach(key => {
      const values = epochResults
        .map(e => e.specialization_scores?.[key])
        .filter(v => typeof v === 'number') as number[];
      
      if (values.length > 0) {
        specializationScores[key] = values.reduce((sum, v) => sum + v, 0) / values.length;
      }
    });
  }
  
  // Collect all unique pathologies
  const allPathologies = new Set<string>();
  epochResults.forEach(e => {
    e.pathologies?.forEach(p => allPathologies.add(p));
  });
  
  // Concatenate insights
  const combinedInsights = epochResults
    .map((e, idx) => `## Epoch ${idx + 1}\n\n${e.insights}`)
    .join('\n\n---\n\n');
  
  return {
    structureScores,
    behaviorScores,
    specializationScores,
    pathologies: Array.from(allPathologies),
    insights: combinedInsights
  };
}

/**
 * Get the suite index for a challenge type (0-4)
 */
function getChallengeTypeIndex(challengeType: string): number {
  const order = ['formal', 'normative', 'procedural', 'strategic', 'epistemic'];
  const index = order.indexOf(challengeType.toLowerCase());
  return index >= 0 ? index : 0; // Default to 0 if not found
}

/**
 * Transform a single GyroDiagnostics challenge into a GovernanceInsight
 */
function transformChallenge(
  challengeType: string,
  challenge: GyroDiagnosticsChallenge,
  modelName: string,
  analystModels: string[] = [],
  epochTimings: Record<string, number> = {},
  sourceFile: string,
  timestamp: string,
  suiteRunId: string
): GovernanceInsight {
  const aggregated = aggregateEpochResults(challenge.epoch_results);
  
  // Map challenge type to proper ChallengeType
  const validType: ChallengeType = ['formal', 'normative', 'procedural', 'strategic', 'epistemic'].includes(challengeType)
    ? (challengeType as ChallengeType)
    : 'custom';
  
  const insight: GovernanceInsight = {
    id: `insight_${challengeType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    suiteRunId: suiteRunId,
    challenge: {
      title: `${modelName} - ${challengeType.charAt(0).toUpperCase() + challengeType.slice(1)} Challenge`,
      description: `GyroDiagnostics evaluation of ${modelName} on ${challengeType} reasoning challenges using the Common Governance Model.`,
      type: validType,
      domain: ['ai-evaluation', 'gyroDiagnostics'] // Don't duplicate challengeType since it's already in the type field
    },
    tags: ['imported', 'gyroDiagnostics', challengeType], // Keep challengeType in tags for filtering
    starred: false,
    notes: '',
    insights: {
      combined_markdown: aggregated.insights,
      summary: `Evaluated ${modelName} across ${challenge.epochs_analyzed} epochs with median QI of ${(challenge.median_quality_index * 100).toFixed(1)}%`,
      participation: `Model demonstrated ${(challenge.alignment_rate_status || 'SLOW').toLowerCase()} alignment with AR of ${challenge.alignment_rate.toFixed(4)}/min`,
      preparation: `Analysis based on ${challenge.epoch_results.length} epoch evaluations with ${challenge.epoch_results[0].analyst_count} analysts per epoch`,
      provision: challenge.superintelligence_stats.interpretation || 'See detailed metrics for structural coherence analysis'
    },
    quality: {
      quality_index: challenge.median_quality_index * 100, // Convert to 0-100 scale
      structure_scores: aggregated.structureScores,
      behavior_scores: aggregated.behaviorScores,
      specialization_scores: aggregated.specializationScores,
      pathologies: {
        detected: aggregated.pathologies,
        frequency: aggregated.pathologies.length / challenge.epochs_analyzed
      },
      alignment_rate: challenge.alignment_rate,
      alignment_rate_category: (challenge.alignment_rate_status === 'VALID' || 
                                 challenge.alignment_rate_status === 'SUPERFICIAL' || 
                                 challenge.alignment_rate_status === 'SLOW')
                                 ? challenge.alignment_rate_status
                                 : 'SLOW', // Default fallback
      superintelligence_index: challenge.superintelligence_stats.median_superintelligence_index,
      si_deviation: challenge.superintelligence_stats.median_deviation_factor
    },
    process: {
      platform: 'gyrodiagnostics_import',
      models_used: {
        synthesis_epoch1: modelName,
        synthesis_epoch2: modelName,
        analyst1: analystModels[0] || 'GyroDiagnostics Analyst 1',
        analyst2: analystModels[1] || 'GyroDiagnostics Analyst 2'
      },
      durations: {
        epoch1_minutes: epochTimings[`${challengeType}_1`] || challenge.median_duration_minutes,
        epoch2_minutes: epochTimings[`${challengeType}_2`] || challenge.median_duration_minutes
      },
      created_at: timestamp,
      schema_version: '1.0.0'
    },
    contribution: {
      license: 'CC0',
      contributor: 'GyroDiagnostics Community',
      public: true
    },
    metadata: {
      model_name: modelName,
      model_version: analystModels.length > 0 ? analystModels.join(', ') : undefined,
      evaluation_method: 'GyroDiagnostics',
      challenge_type: challengeType,
      epochs_analyzed: challenge.epochs_analyzed,
      source_file: sourceFile,
      import_date: timestamp,
      pathology_frequency: challenge.pathology_counts,
      analyst_models: analystModels,
      epoch_timings: epochTimings,
      statistics: {
        mean_qi: challenge.mean_quality_index,
        std_qi: challenge.std_quality_index,
        min_qi: challenge.min_quality_index,
        max_qi: challenge.max_quality_index,
        mean_duration: challenge.mean_duration_minutes,
        std_duration: challenge.std_duration_minutes
      }
    },
    suiteMetadata: {
      suiteIndex: getChallengeTypeIndex(challengeType),
      totalChallenges: 5,
      modelEvaluated: modelName,
      suiteStartedAt: timestamp,
      suiteCompletedAt: timestamp
    }
  };
  
  return insight;
}

/**
 * Transform GyroDiagnostics JSON data into GovernanceInsights
 */
export function transformGyroDiagnosticsToInsights(
  data: GyroDiagnosticsData,
  filename: string
): GovernanceInsight[] {
  const insights: GovernanceInsight[] = [];
  
  // Extract model information from metadata or fallback to filename
  let modelName: string;
  let analystModels: string[] = [];
  let epochTimings: Record<string, number> = {};
  
  if (data.metadata) {
    modelName = data.metadata.model_tested;
    analystModels = data.metadata.analyst_models || [];
    epochTimings = data.metadata.timings || {};
  } else {
    modelName = extractModelName(filename);
  }
  
  const timestamp = new Date().toISOString();
  
  // Generate a suiteRunId for this complete suite run
  const suiteRunId = `suite_${modelName.replace(/[^a-z0-9]/gi, '_')}_${new Date(timestamp).toISOString().slice(0,10)}`;
  
  // Get challenges from new structure or legacy flat structure
  const challenges = data.challenges || data;
  
  // Process each challenge type
  for (const [challengeType, challengeData] of Object.entries(challenges)) {
    // Skip metadata if it's in the flat structure
    if (challengeType === 'metadata') continue;
    
    try {
      const insight = transformChallenge(
        challengeType,
        challengeData as GyroDiagnosticsChallenge,
        modelName,
        analystModels,
        epochTimings,
        filename,
        timestamp,
        suiteRunId
      );
      insights.push(insight);
    } catch (error) {
      console.error(`Failed to transform challenge ${challengeType}:`, error);
      // Continue processing other challenges
    }
  }
  
  return insights;
}

/**
 * Validate and import GyroDiagnostics file (JSON)
 */
export async function importGyroDiagnosticsFile(file: File): Promise<{
  success: boolean;
  insights?: GovernanceInsight[];
  error?: string;
}> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    if (!isGyroDiagnosticsFormat(data)) {
      return {
        success: false,
        error: 'Invalid file format. Expected GyroDiagnostics evaluation JSON with challenge types (formal, normative, procedural, strategic, epistemic).'
      };
    }
    
    const insights = transformGyroDiagnosticsToInsights(data, file.name);
    
    if (insights.length === 0) {
      return {
        success: false,
        error: 'No valid challenges found in file.'
      };
    }
    
    return {
      success: true,
      insights
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse file'
    };
  }
}

/**
 * Extract and import GyroDiagnostics files from a ZIP archive
 */
export async function importGyroDiagnosticsZip(file: File): Promise<{
  success: boolean;
  insights?: GovernanceInsight[];
  error?: string;
  filesProcessed?: number;
  filesFound?: number;
}> {
  try {
    const zip = await JSZip.loadAsync(file);
    const allInsights: GovernanceInsight[] = [];
    const dataFiles: Array<{ filename: string; file: JSZip.JSZipObject }> = [];
    
    // Find all files ending with 'data.json' (case-insensitive)
    zip.forEach((relativePath, zipEntry) => {
      if (!zipEntry.dir && relativePath.toLowerCase().endsWith('data.json')) {
        dataFiles.push({ filename: relativePath, file: zipEntry });
      }
    });
    
    if (dataFiles.length === 0) {
      return {
        success: false,
        error: 'No files ending with "data.json" found in the ZIP archive.',
        filesFound: 0,
        filesProcessed: 0
      };
    }
    
    // Process each data.json file
    let successCount = 0;
    const errors: string[] = [];
    
    for (const { filename, file: zipEntry } of dataFiles) {
      try {
        const text = await zipEntry.async('text');
        const data = JSON.parse(text);
        
        if (!isGyroDiagnosticsFormat(data)) {
          console.warn(`Skipping ${filename}: Invalid format`);
          errors.push(`${filename}: Invalid format`);
          continue;
        }
        
        const insights = transformGyroDiagnosticsToInsights(data, filename);
        
        if (insights.length > 0) {
          allInsights.push(...insights);
          successCount++;
        } else {
          errors.push(`${filename}: No valid challenges found`);
        }
      } catch (error) {
        console.error(`Error processing ${filename}:`, error);
        errors.push(`${filename}: ${error instanceof Error ? error.message : 'Parse error'}`);
      }
    }
    
    if (allInsights.length === 0) {
      return {
        success: false,
        error: `No valid insights could be imported. Errors: ${errors.join('; ')}`,
        filesFound: dataFiles.length,
        filesProcessed: 0
      };
    }
    
    return {
      success: true,
      insights: allInsights,
      filesFound: dataFiles.length,
      filesProcessed: successCount
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process ZIP file',
      filesFound: 0,
      filesProcessed: 0
    };
  }
}

/**
 * Import GyroDiagnostics data from JSON or ZIP file
 * Automatically detects file type and processes accordingly
 */
export async function importGyroDiagnostics(file: File): Promise<{
  success: boolean;
  insights?: GovernanceInsight[];
  error?: string;
  filesProcessed?: number;
  filesFound?: number;
}> {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.zip')) {
    return await importGyroDiagnosticsZip(file);
  } else if (fileName.endsWith('.json')) {
    return await importGyroDiagnosticsFile(file);
  } else {
    return {
      success: false,
      error: 'Unsupported file type. Please select a JSON or ZIP file.'
    };
  }
}

