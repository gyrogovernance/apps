// Robust transcript parsing for real-world AI conversations
// Supports multiple export formats from ChatGPT, Claude, etc.

import { Turn, TranscriptParseResult } from '../types';

interface ParseResult {
  turns: Turn[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  method: 'turn_markers' | 'alternating' | 'paragraphs' | 'manual';
}

/**
 * Parse transcript into turns using multiple detection methods
 * 
 * Tries multiple parsing strategies in order of preference:
 * 1. {Turn N} markers (existing format)
 * 2. Turn N: patterns (common in exports)
 * 3. Speaker labels (User:/Assistant:) - collapse alternations
 * 4. Fallback: split paragraphs into 3-6 balanced turns
 * 
 * @param text - Raw transcript text
 * @returns Parsed turns with confidence and method used
 */
export function segmentTranscript(text: string): TranscriptParseResult {
  const strategies = [
    parseByTurnMarker,    // {Turn 1} User: ...
    parseByTurnLabel,     // Turn 1: User: ...
    parseBySpeaker,       // User: ... Assistant: ...
    parseByParagraph      // Fallback chunking
  ];

  for (const strategy of strategies) {
    const result = strategy(text);
    if (result.turns.length >= 3 && result.turns.length <= 10) {
      return {
        ...result,
        suggestions: generateSuggestions(result)
      };
    }
  }

  // Final fallback
  const result = parseByParagraph(text);
  return {
    ...result,
    suggestions: generateSuggestions(result)
  };
}

/**
 * Parse using {Turn N} markers (existing format)
 */
function parseByTurnMarker(text: string): ParseResult {
  const turnRegex = /\{Turn\s+(\d+)\}\s*(.*?)(?=\{Turn\s+\d+\}|$)/gs;
  const matches = Array.from(text.matchAll(turnRegex));
  
  if (matches.length === 0) {
    return { turns: [], confidence: 'LOW', method: 'turn_markers' };
  }

  const turns: Turn[] = matches.map((match, index) => {
    const turnNumber = parseInt(match[1]) as 1 | 2 | 3 | 4 | 5 | 6;
    const content = match[2].trim();
    const wordCount = content.split(/\s+/).length;
    
    return {
      number: turnNumber,
      content,
      word_count: wordCount,
      captured_at: new Date().toISOString(),
      confidence: 'high'
    };
  });

  return {
    turns,
    confidence: turns.length >= 3 ? 'HIGH' : 'MEDIUM',
    method: 'turn_markers'
  };
}

/**
 * Parse using "Turn N:" patterns (common in exports)
 */
function parseByTurnLabel(text: string): ParseResult {
  const turnRegex = /^Turn\s+(\d+):\s*(.*?)(?=^Turn\s+\d+:|$)/gms;
  const matches = Array.from(text.matchAll(turnRegex));
  
  if (matches.length === 0) {
    return { turns: [], confidence: 'LOW', method: 'turn_markers' };
  }

  const turns: Turn[] = matches.map((match, index) => {
    const turnNumber = parseInt(match[1]) as 1 | 2 | 3 | 4 | 5 | 6;
    const content = match[2].trim();
    const wordCount = content.split(/\s+/).length;
    
    return {
      number: turnNumber,
      content,
      word_count: wordCount,
      captured_at: new Date().toISOString(),
      confidence: 'high'
    };
  });

  return {
    turns,
    confidence: turns.length >= 3 ? 'HIGH' : 'MEDIUM',
    method: 'turn_markers'
  };
}

/**
 * Parse using alternating speaker labels (User:/Assistant:)
 */
function parseBySpeaker(text: string): ParseResult {
  const speakerRegex = /^(User|Assistant|Human|AI|Bot):\s*(.*?)(?=^(User|Assistant|Human|AI|Bot):|$)/gms;
  const matches = Array.from(text.matchAll(speakerRegex));
  
  if (matches.length === 0) {
    return { turns: [], confidence: 'LOW', method: 'alternating' };
  }

  // Group consecutive messages from same speaker
  const grouped: { speaker: string; content: string }[] = [];
  let currentSpeaker = '';
  let currentContent = '';

  for (const match of matches) {
    const speaker = match[1];
    const content = match[2].trim();
    
    if (speaker === currentSpeaker) {
      currentContent += '\n\n' + content;
    } else {
      if (currentSpeaker) {
        grouped.push({ speaker: currentSpeaker, content: currentContent });
      }
      currentSpeaker = speaker;
      currentContent = content;
    }
  }
  
  if (currentSpeaker) {
    grouped.push({ speaker: currentSpeaker, content: currentContent });
  }

  const turns: Turn[] = grouped.map((group, index) => {
    const turnNumber = (index + 1) as 1 | 2 | 3 | 4 | 5 | 6;
    const wordCount = group.content.split(/\s+/).length;
    
    return {
      number: turnNumber,
      content: `${group.speaker}: ${group.content}`,
      word_count: wordCount,
      captured_at: new Date().toISOString(),
      confidence: 'high'
    };
  });

  return {
    turns,
    confidence: turns.length >= 3 ? 'HIGH' : 'MEDIUM',
    method: 'alternating'
  };
}

/**
 * Fallback: split paragraphs into balanced turns
 */
function parseByParagraph(text: string): ParseResult {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
  
  if (paragraphs.length === 0) {
    return { turns: [], confidence: 'LOW', method: 'paragraphs' };
  }

  // Target 3-6 turns, balance content
  const targetTurns = Math.min(6, Math.max(3, Math.ceil(paragraphs.length / 2)));
  const turns: Turn[] = [];
  
  for (let i = 0; i < targetTurns; i++) {
    const startIdx = Math.floor((i * paragraphs.length) / targetTurns);
    const endIdx = Math.floor(((i + 1) * paragraphs.length) / targetTurns);
    const content = paragraphs.slice(startIdx, endIdx).join('\n\n');
    const wordCount = content.split(/\s+/).length;
    
    turns.push({
      number: (i + 1) as 1 | 2 | 3 | 4 | 5 | 6,
      content,
      word_count: wordCount,
      captured_at: new Date().toISOString(),
      confidence: 'medium'
    });
  }

  return {
    turns,
    confidence: 'MEDIUM',
    method: 'paragraphs'
  };
}

/**
 * Generate suggestions for manual editing
 */
function generateSuggestions(result: ParseResult): string[] {
  const suggestions: string[] = [];
  
  if (result.turns.length < 3) {
    suggestions.push('Consider adding more content to reach minimum 3 turns');
  }
  
  if (result.turns.length > 6) {
    suggestions.push('Consider consolidating content to stay under 6 turns');
  }
  
  if (result.confidence === 'LOW') {
    suggestions.push('Manual editing recommended - parsing confidence is low');
  }
  
  if (result.method === 'paragraphs') {
    suggestions.push('Consider adding turn markers for better structure');
  }
  
  return suggestions;
}
