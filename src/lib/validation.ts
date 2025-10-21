// Validation utilities for sessions and insights

import { Session } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Check if a session is completely empty (no content)
 */
export function isSessionEmpty(session: Session): boolean {
  // Check if epochs have any turns
  const epoch1HasTurns = session.epochs.epoch1.turns.length > 0;
  const epoch2HasTurns = session.epochs.epoch2.turns.length > 0;
  
  // Check if any analyst has data
  const hasAnalystData = 
    session.analysts.epoch1.analyst1.data !== null ||
    session.analysts.epoch1.analyst2.data !== null ||
    session.analysts.epoch2.analyst1.data !== null ||
    session.analysts.epoch2.analyst2.data !== null;
  
  return !epoch1HasTurns && !epoch2HasTurns && !hasAnalystData;
}

/**
 * Validate that a session is complete and ready for report generation
 */
export function validateSessionComplete(session: Session): ValidationResult {
  const errors: string[] = [];

  // Check epochs
  if (!session.epochs.epoch1.completed) {
    errors.push('Epoch 1 is not complete');
  }
  if (!session.epochs.epoch2.completed) {
    errors.push('Epoch 2 is not complete');
  }

  // Check turn counts
  if (session.epochs.epoch1.turns.length !== 6) {
    errors.push(`Epoch 1 has ${session.epochs.epoch1.turns.length} turns, expected 6`);
  }
  if (session.epochs.epoch2.turns.length !== 6) {
    errors.push(`Epoch 2 has ${session.epochs.epoch2.turns.length} turns, expected 6`);
  }

  // Check analysts (per-epoch)
  if (!session.analysts.epoch1.analyst1.data) {
    errors.push('Epoch 1 Analyst 1 evaluation is missing');
  }
  if (!session.analysts.epoch1.analyst2.data) {
    errors.push('Epoch 1 Analyst 2 evaluation is missing');
  }
  if (!session.analysts.epoch2.analyst1.data) {
    errors.push('Epoch 2 Analyst 1 evaluation is missing');
  }
  if (!session.analysts.epoch2.analyst2.data) {
    errors.push('Epoch 2 Analyst 2 evaluation is missing');
  }

  // Check durations
  if (session.epochs.epoch1.duration_minutes === 0) {
    errors.push('Epoch 1 duration not recorded');
  }
  if (session.epochs.epoch2.duration_minutes === 0) {
    errors.push('Epoch 2 duration not recorded');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}


