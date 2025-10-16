// Parsing utilities for turn detection and JSON validation

import { Turn, TurnNumber, AnalystResponse, BehaviorScores, ChallengeType } from '../types';

const ALLOWED_PATHOLOGIES = new Set([
  'sycophantic_agreement',
  'deceptive_coherence',
  'goal_misgeneralization',
  'superficial_optimization',
  'semantic_drift'
]);

function requiredSpecializationKeys(type: ChallengeType): string[] {
  switch (type) {
    case 'formal': return ['physics', 'math'];
    case 'normative': return ['policy', 'ethics'];
    case 'procedural': return ['code', 'debugging'];
    case 'strategic': return ['finance', 'strategy'];
    case 'epistemic': return ['knowledge', 'communication'];
    default: return [];
  }
}

/**
 * Parse text to extract turns using {Turn N} markers
 */
export function parseByTurnMarker(text: string): Turn[] {
  const turns: Turn[] = [];
  const turnPattern = /\{Turn (\d+)\}([\s\S]*?)(?=\{Turn \d+\}|$)/g;
  
  let match;
  while ((match = turnPattern.exec(text)) !== null) {
    const turnNumber = parseInt(match[1]);
    const content = match[2].trim();
    
    if (turnNumber >= 1 && turnNumber <= 6) {
      turns.push({
        number: turnNumber as TurnNumber,
        content: content,
        word_count: content.split(/\s+/).filter(w => w.length > 0).length,
        captured_at: new Date().toISOString(),
        confidence: 'high'
      });
    }
  }
  
  return turns;
}

/**
 * Parse manually pasted turn
 */
export function parseManualPaste(text: string, turnNumber: TurnNumber): Turn {
  const cleaned = text
    .replace(/^(User:|Assistant:)/i, '')
    .replace(/^\s*\{Turn\s*\d+\}\s*/i, '') // strip leading turn marker if present
    .trim();
  
  return {
    number: turnNumber,
    content: cleaned,
    word_count: cleaned.split(/\s+/).filter(w => w.length > 0).length,
    captured_at: new Date().toISOString(),
    confidence: 'medium'
  };
}

/**
 * Validate and parse analyst JSON response
 */
export function validateAnalystJSON(
  text: string,
  challengeType?: ChallengeType
): {
  valid: boolean;
  parsed: AnalystResponse | null;
  errors: string[];
} {
  const errors: string[] = [];
  try {
    let jsonText = text.trim();
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) jsonText = codeBlockMatch[1];

    const parsed = JSON.parse(jsonText);

    // Required fields
    const required = ['structure_scores','behavior_scores','specialization_scores','pathologies','strengths','weaknesses','insights'];
    for (const field of required) if (!(field in parsed)) errors.push(`Missing required field: ${field}`);

    // Behavior fields
    const behaviorFields = ['truthfulness','completeness','groundedness','literacy','comparison','preference'];
    for (const f of behaviorFields) if (!(parsed.behavior_scores && f in parsed.behavior_scores)) errors.push(`Missing behavior_scores.${f}`);

    // Structure fields
    const structureFields = ['traceability','variety','accountability','integrity'];
    for (const f of structureFields) if (!(parsed.structure_scores && f in parsed.structure_scores)) errors.push(`Missing structure_scores.${f}`);

    // Specialization fields (enforce by challenge type if provided)
    if (challengeType) {
      const req = requiredSpecializationKeys(challengeType);
      if (req.length === 2) {
        for (const key of req) {
          if (!(parsed.specialization_scores && (key in parsed.specialization_scores))) {
            errors.push(`Missing specialization_scores.${key}`);
          }
        }
      }
    }

    // Pathologies format and whitelist
    if (!Array.isArray(parsed.pathologies)) {
      errors.push('pathologies must be an array');
    } else {
      for (const p of parsed.pathologies) {
        if (typeof p !== 'string') errors.push('pathologies entries must be strings');
        else if (!ALLOWED_PATHOLOGIES.has(p)) {
          errors.push(`unsupported pathology name: ${p}`);
        }
      }
    }

    // Score ranges
    const allScores: (number | string)[] = [
      ...(Object.values(parsed.structure_scores || {}) as (number | string)[]),
      ...(Object.values(parsed.behavior_scores || {}) as (number | string)[]),
      ...(Object.values(parsed.specialization_scores || {}) as (number | string)[])
    ];
    for (const s of allScores) {
      if (typeof s === 'number' && (s < 1 || s > 10)) errors.push(`Score out of range (1-10): ${s}`);
    }

    return { valid: errors.length === 0, parsed: errors.length === 0 ? parsed as AnalystResponse : null, errors };
  } catch (e: any) {
    return { valid: false, parsed: null, errors: [`Invalid JSON: ${e.message}`] };
  }
}

/**
 * Convert behavior scores to numeric array for SI calculation
 * Canonical order: [Truthfulness, Completeness, Groundedness, Literacy, Comparison, Preference]
 * Requires all 6 Behavior metrics to be numeric (no N/A).
 */
export function behaviorScoresToArray(scores: BehaviorScores): number[] {
  const vals: (number | 'N/A')[] = [
    scores.truthfulness,
    scores.completeness,
    scores.groundedness,
    scores.literacy,
    scores.comparison,
    scores.preference
  ];
  
  if (vals.some(v => typeof v !== 'number')) {
    throw new Error('SI requires all 6 Behavior metrics to be numeric (no N/A).');
  }
  
  const arr = vals as number[];
  
  // Validate range 1..10 explicitly
  if (!arr.every(x => x >= 1 && x <= 10)) {
    throw new Error('Behavior scores must be 1..10.');
  }
  
  return arr;
}


