// Shared UI utility functions for consistent styling and formatting

import { AlignmentCategory } from '../types';

/**
 * Get color class for score (1-10 scale)
 */
export const getScoreColor = (score: number): string => {
  if (score >= 8) return 'text-green-600 dark:text-green-400';
  if (score >= 6) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

/**
 * Get color classes for Quality Index (0-100 scale)
 */
export const getQIColor = (qi: number): string => {
  if (qi >= 80) return 'text-green-600 dark:text-green-400';
  if (qi >= 60) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

/**
 * Get badge color classes for Alignment Category
 */
export const getAlignmentBadgeColor = (category: AlignmentCategory): string => {
  const colors = {
    VALID: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700',
    SUPERFICIAL: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700',
    SLOW: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
  };
  return colors[category];
};

/**
 * Get simple color classes for Alignment Category (without border)
 */
export const getAlignmentColor = (category: AlignmentCategory): string => {
  const colors = {
    VALID: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200',
    SUPERFICIAL: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200',
    SLOW: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200'
  };
  return colors[category];
};

/**
 * Tailwind-safe color mapping for challenge types
 */
export const challengeColorMap: Record<string, { bg: string; text: string; border: string }> = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/40',
    text: 'text-blue-800 dark:text-blue-200',
    border: 'border-blue-200 dark:border-blue-800'
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/40',
    text: 'text-green-800 dark:text-green-200',
    border: 'border-green-200 dark:border-green-800'
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/40',
    text: 'text-purple-800 dark:text-purple-200',
    border: 'border-purple-200 dark:border-purple-800'
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/40',
    text: 'text-orange-800 dark:text-orange-200',
    border: 'border-orange-200 dark:border-orange-800'
  },
  pink: {
    bg: 'bg-pink-100 dark:bg-pink-900/40',
    text: 'text-pink-800 dark:text-pink-200',
    border: 'border-pink-200 dark:border-pink-800'
  }
};

