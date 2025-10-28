// Gadget Selector View - Choose which gadget to use

import React from 'react';
import { NotebookState, GadgetType, GadgetView } from '../../../types';
import { CopyableDetails } from '../../shared/CopyableDetails';
import GlassCard from '../../shared/GlassCard';
import { POLICY_AUDIT_TASK, POLICY_REPORT_TASK, SANITIZE_TASK, IMMUNITY_BOOST_TASK } from '../../../lib/prompts';

interface GadgetSelectorProps {
  state: NotebookState;
  onUpdate: (updates: Partial<NotebookState>) => void;
  onNavigateHome: () => void;
  navigateToView: (view: GadgetView) => void;
}

const GADGETS: Array<{
  id: GadgetType;
  icon: string;
  title: string;
  description: string;
  isTreatmentCategory?: boolean;
}> = [
  {
    id: 'detector',
    icon: '🔍',
    title: 'Detector',
    description: 'Check AI conversations for deception'
  },
  {
    id: 'policy-audit',
    icon: '📊',
    title: 'Policy Auditing',
    description: 'Extract claims & evidence'
  },
  {
    id: 'policy-report',
    icon: '📋',
    title: 'Policy Reporting',
    description: 'Create executive summary'
  },
  {
    id: 'treatment' as any, // Special case for treatment category
    icon: '💊',
    title: 'Treatment',
    description: 'Improve content quality',
    isTreatmentCategory: true
  }
];

const GadgetSelector: React.FC<GadgetSelectorProps> = ({
  state,
  onUpdate,
  onNavigateHome,
  navigateToView
}) => {
  const handleSelectGadget = (gadgetType: GadgetType | 'treatment') => {
    if (gadgetType === 'treatment') {
      // Navigate to treatment selector
      navigateToView('treatment-selector');
      return;
    }

    // Create a new draft for this gadget run
    const draftTimestamp = Date.now();
    const newDraftKey = `gadget_${gadgetType}_${draftTimestamp}`;

    onUpdate({
      ui: {
        ...state.ui,
        gadgetType,
        gadgetView: 'accordion',
        gadgetDraftKey: newDraftKey
      },
      drafts: {
        ...state.drafts,
        [newDraftKey]: {
          type: gadgetType,
          timestamp: draftTimestamp
        }
      }
    });
  };

  return (
    <div className="w-full px-3 py-4">

      {/* Single column, compact cards */}
      <div className="space-y-3">
        {GADGETS.map(gadget => (
          <GlassCard
            key={gadget.id}
            hover
            onClick={() => handleSelectGadget(gadget.id)}
            className="cursor-pointer"
          >
            <div className="p-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-xl flex-shrink-0">{gadget.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5 leading-tight">
                    {gadget.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                    {gadget.description}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Compact back button */}
      <div className="text-center mt-4">
        <button 
          onClick={onNavigateHome} 
          className="btn-secondary text-xs px-3 py-1.5"
        >
          ←
        </button>
      </div>
    </div>
  );
};

export default GadgetSelector;

