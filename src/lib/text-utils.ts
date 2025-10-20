// Text analysis utilities for word and token estimation

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Estimate tokens from word count
 * Uses industry-standard approximation: ~1.3 tokens per word
 * This is a conservative estimate; actual tokenization varies by model
 */
export function estimateTokens(words: number): number {
  return Math.round(words * 1.3);
}

/**
 * Format token count with K suffix for readability
 * e.g., 1234 → "1.2K", 567 → "567"
 */
export function formatTokenCount(tokens: number): string {
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toString();
}

/**
 * Get word and token count from text
 */
export function analyzeText(text: string): { words: number; tokens: number } {
  const words = countWords(text);
  return {
    words,
    tokens: estimateTokens(words)
  };
}

/**
 * Format word/token display
 * e.g., "132 words (~172 tokens)"
 */
export function formatWordTokenCount(words: number): string {
  const tokens = estimateTokens(words);
  return `${words} words (~${formatTokenCount(tokens)} tokens)`;
}

/**
 * Format pathology names from metadata format to human-readable
 * e.g., "sycophantic_agreement" → "Sycophantic Agreement"
 */
export function formatPathologyName(pathology: string): string {
  if (!pathology) return '';
  return pathology
    .split('_')
    .map(word => word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '')
    .filter(word => word.length > 0)
    .join(' ');
}

