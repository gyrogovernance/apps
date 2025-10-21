// Session utility functions for progress tracking and formatting

import { Session } from '../types';

/**
 * Calculate session progress
 */
export const getSessionProgress = (session: Session): { current: number; total: number; label: string } => {
  const epoch1Done = session.epochs.epoch1.completed;
  const epoch2Done = session.epochs.epoch2.completed;
  const a1e1Done = session.analysts.epoch1.analyst1.status === 'complete';
  const a1e2Done = session.analysts.epoch2.analyst1.status === 'complete';
  const a2e1Done = session.analysts.epoch1.analyst2.status === 'complete';
  const a2e2Done = session.analysts.epoch2.analyst2.status === 'complete';

  if (!epoch1Done) return { current: 0, total: 6, label: 'Epoch 1' };
  if (!a1e1Done) return { current: 1, total: 6, label: 'Analyst 1 - Epoch 1' };
  if (!a2e1Done) return { current: 2, total: 6, label: 'Analyst 2 - Epoch 1' };
  if (!epoch2Done) return { current: 3, total: 6, label: 'Epoch 2' };
  if (!a1e2Done) return { current: 4, total: 6, label: 'Analyst 1 - Epoch 2' };
  if (!a2e2Done) return { current: 5, total: 6, label: 'Analyst 2 - Epoch 2' };
  return { current: 6, total: 6, label: 'Complete' };
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
  return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
};

/**
 * Get next target section for a session based on progress
 */
export const getNextSection = (session: Session): 'epoch1' | 'epoch2' | 'analyst1_epoch1' | 'analyst1_epoch2' | 'analyst2_epoch1' | 'analyst2_epoch2' | 'report' => {
  const epoch1Done = session.epochs.epoch1.completed;
  const epoch2Done = session.epochs.epoch2.completed;
  const a1e1Done = session.analysts.epoch1.analyst1.status === 'complete';
  const a1e2Done = session.analysts.epoch2.analyst1.status === 'complete';
  const a2e1Done = session.analysts.epoch1.analyst2.status === 'complete';
  const a2e2Done = session.analysts.epoch2.analyst2.status === 'complete';

  if (!epoch1Done) return 'epoch1';
  if (!a1e1Done) return 'analyst1_epoch1';
  if (!a2e1Done) return 'analyst2_epoch1';
  if (!epoch2Done) return 'epoch2';
  if (!a1e2Done) return 'analyst1_epoch2';
  if (!a2e2Done) return 'analyst2_epoch2';
  return 'report';
};

/**
 * Check if session is in a valid state
 */
export const isSessionValid = (session: Session): boolean => {
  return !!(session.id && session.challenge.title && session.createdAt);
};

