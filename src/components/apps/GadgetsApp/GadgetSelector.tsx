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
    id: 'rapid-test',
    icon: '🔬',
    title: 'Rapid Test',
    description: 'Quick GyroDiagnostics metric computation'
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
            className="cursor-pointer transition-transform hover:scale-[1.01] hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md"
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

      {/* Divider: Gyro Governance Reports */}
      <div className="mt-6 mb-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Gyro Governance Reports</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>

      {/* Reports preview image in a glass card */}
      <a 
        href="https://gyrogovernance.com/articles/?category=reports" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block"
      >
        <GlassCard className="mt-3 group" hover density="dense">
          <div className="rounded-xl overflow-hidden -m-2">
            <img
              src={typeof chrome !== 'undefined' && chrome.runtime?.getURL
                ? chrome.runtime.getURL('assets/media/aie_reports.png')
                : 'assets/media/aie_reports.png'}
              alt="Gyro Governance Reports Overview"
              className="w-full h-auto block transition-opacity duration-200 group-hover:opacity-90"
            />
          </div>
        </GlassCard>
      </a>

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

