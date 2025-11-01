import { GadgetType } from '../types';
import { POLICY_AUDIT_TASK, POLICY_REPORT_TASK, SANITIZE_TASK, IMMUNITY_BOOST_TASK } from './prompts';

export const GADGETS: Record<GadgetType, {
  title: string;
  icon: string;
  taskPrompt: string;
  isAnalysis: boolean;
  description: string;
}> = {
  'rapid-test': {
    title: 'Rapid Test',
    icon: '🔬',
    description: 'Quick GyroDiagnostics metric computation',
    taskPrompt: '',
    isAnalysis: true
  },
  'policy-audit': {
    title: 'Policy Auditing',
    icon: '📊',
    description: 'Extract claims & evidence from documents',
    taskPrompt: POLICY_AUDIT_TASK,
    isAnalysis: true
  },
  'policy-report': {
    title: 'Policy Reporting',
    icon: '📋',
    description: 'Create executive synthesis with attribution',
    taskPrompt: POLICY_REPORT_TASK,
    isAnalysis: true
  },
  'sanitize': {
    title: 'AI Infection Sanitization',
    icon: '🦠',
    description: 'Remove hidden patterns and normalize text',
    taskPrompt: SANITIZE_TASK,
    isAnalysis: false
  },
  'immunity-boost': {
    title: 'Pathologies Immunity Boost',
    icon: '💊',
    description: 'Enhance content quality across 12 metrics',
    taskPrompt: IMMUNITY_BOOST_TASK,
    isAnalysis: false
  }
};


