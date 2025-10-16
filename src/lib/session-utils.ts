// Session utility functions for progress tracking and formatting

import { Session } from '../types';

/**
 * Calculate session progress
 */
export const getSessionProgress = (session: Session): { current: number; total: number; label: string } => {
  const epoch1Done = session.epochs.epoch1.completed;
  const epoch2Done = session.epochs.epoch2.completed;
  const analyst1Done = session.analysts.analyst1.status === 'complete';
  const analyst2Done = session.analysts.analyst2.status === 'complete';

  if (!epoch1Done) return { current: 0, total: 4, label: 'Epoch 1' };
  if (!epoch2Done) return { current: 1, total: 4, label: 'Epoch 2' };
  if (!analyst1Done) return { current: 2, total: 4, label: 'Analyst 1' };
  if (!analyst2Done) return { current: 3, total: 4, label: 'Analyst 2' };
  return { current: 4, total: 4, label: 'Complete' };
};

/**
 * Format session duration in human-readable format
 */
export const formatSessionDuration = (session: Session): string => {
  const total = session.epochs.epoch1.duration_minutes + session.epochs.epoch2.duration_minutes;
  if (total === 0) return 'Not started';
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return `${hours}h ${mins > 0 ? ` ${mins}m` : ''}`;
};

/**
 * Get next target section for a session based on progress
 */
export const getNextSection = (session: Session): 'epoch1' | 'epoch2' | 'analyst1' | 'analyst2' | 'report' => {
  const epoch1Done = session.epochs.epoch1.completed;
  const epoch2Done = session.epochs.epoch2.completed;
  const analyst1Done = session.analysts.analyst1.status === 'complete';
  const analyst2Done = session.analysts.analyst2.status === 'complete';

  if (!epoch1Done) return 'epoch1';
  if (!epoch2Done) return 'epoch2';
  if (!analyst1Done) return 'analyst1';
  if (!analyst2Done) return 'analyst2';
  return 'report';
};

/**
 * Check if session is in a valid state
 */
export const isSessionValid = (session: Session): boolean => {
  return !!(session.id && session.challenge.title && session.createdAt);
};

