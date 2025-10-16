// Smart clipboard detection for AI responses and JSON
// Helps users by detecting what they've copied and suggesting actions

/**
 * Request clipboard read permission (requires user gesture)
 */
export async function requestClipboardPermission(): Promise<boolean> {
  try {
    const result = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
    return result.state === 'granted' || result.state === 'prompt';
  } catch {
    // Clipboard API not fully supported, try direct read
    return false;
  }
}

/**
 * Detect clipboard content (requires permission)
 */
export async function detectClipboardContent(): Promise<string | null> {
  try {
    const text = await navigator.clipboard.readText();
    return text;
  } catch {
    // Permission denied or clipboard empty
    return null;
  }
}

/**
 * Heuristic: Does this look like an AI-generated response?
 */
export function looksLikeAIResponse(text: string): boolean {
  if (!text || text.length < 50) return false;
  
  // Heuristics for AI-generated content
  const hasStructure = /\n\n/.test(text); // Multiple paragraphs
  const hasLength = text.length > 200;
  const hasNoCodeFence = !text.startsWith('```'); // Not a code block
  const hasNoUrls = !/https?:\/\//.test(text); // Less likely to be copied from web
  const hasPunctuation = /[.!?]/.test(text); // Proper sentences
  
  return hasStructure && hasLength && hasNoCodeFence && hasNoUrls && hasPunctuation;
}

/**
 * Heuristic: Does this look like analyst JSON response?
 */
export function looksLikeAnalystJSON(text: string): boolean {
  const trimmed = text.trim();
  
  // Check for JSON structure
  const startsWithBrace = trimmed.startsWith('{');
  const hasJsonFence = trimmed.includes('```json');
  
  // Check for required fields
  const hasStructureScores = trimmed.includes('structure_scores');
  const hasBehaviorScores = trimmed.includes('behavior_scores');
  const hasPathologies = trimmed.includes('pathologies');
  
  return (startsWithBrace || hasJsonFence) && hasStructureScores && hasBehaviorScores;
}

/**
 * Extract JSON from markdown code fence if present
 */
export function extractJSONFromFence(text: string): string {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }
  return text.trim();
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

