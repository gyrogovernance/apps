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

/**
 * Get the next incomplete step for a session
 */
export function getNextIncompleteStep(session: Session): 'epoch1' | 'epoch2' | 'analyst1_epoch1' | 'analyst1_epoch2' | 'analyst2_epoch1' | 'analyst2_epoch2' | 'complete' {
  if (!session.epochs.epoch1.completed) return 'epoch1';
  // After Epoch 1, complete both analyst evaluations for Epoch 1
  if (!session.analysts.epoch1.analyst1.data) return 'analyst1_epoch1';
  if (!session.analysts.epoch1.analyst2.data) return 'analyst2_epoch1';
  // Then move to Epoch 2
  if (!session.epochs.epoch2.completed) return 'epoch2';
  // After Epoch 2, complete both analyst evaluations for Epoch 2
  if (!session.analysts.epoch2.analyst1.data) return 'analyst1_epoch2';
  if (!session.analysts.epoch2.analyst2.data) return 'analyst2_epoch2';
  return 'complete';
}

/**
 * Check if a session can be resumed
 */
export function canResumeSession(session: Session): boolean {
  return session.status !== 'complete' && getNextIncompleteStep(session) !== 'complete';
}

/**
 * Get human-readable status message for a session
 */
export function getSessionStatusMessage(session: Session): string {
  const nextStep = getNextIncompleteStep(session);
  
  switch (nextStep) {
    case 'epoch1':
      return 'Ready to start Epoch 1';
    case 'epoch2':
      return 'Ready to start Epoch 2';
    case 'analyst1_epoch1':
      return 'Ready for Analyst 1 - Epoch 1 evaluation';
    case 'analyst1_epoch2':
      return 'Ready for Analyst 1 - Epoch 2 evaluation';
    case 'analyst2_epoch1':
      return 'Ready for Analyst 2 - Epoch 1 evaluation';
    case 'analyst2_epoch2':
      return 'Ready for Analyst 2 - Epoch 2 evaluation';
    case 'complete':
      return 'Session complete';
  }
}

