// Gadget Selector View - Choose which gadget to use

import React from 'react';
import { NotebookState, GadgetType, GadgetView } from '../../../types';
import GlassCard from '../../shared/GlassCard';

interface GadgetSelectorProps {
  state: NotebookState;
  onUpdate: (updates: Partial<NotebookState>) => void;
  onNavigateHome: () => void;
  navigateToView: (view: GadgetView) => void;
}

import { GADGETS as GADGET_MAP } from '../../../lib/gadgets';

const ANALYSIS_GADGETS = (
  Object.entries(GADGET_MAP)
    .filter(([, g]) => g.isAnalysis)
    .map(([id, g]) => ({ id: id as GadgetType, icon: g.icon, title: g.title, description: g.description }))
);

const TREATMENT_GADGETS = (
  Object.entries(GADGET_MAP)
    .filter(([, g]) => !g.isAnalysis)
    .map(([id, g]) => ({ id: id as GadgetType, icon: g.icon, title: g.title, description: g.description }))
);

const GadgetSelector: React.FC<GadgetSelectorProps> = ({
  state,
  onUpdate,
  onNavigateHome,
  navigateToView
}) => {
  const handleSelectGadget = (gadgetType: GadgetType) => {

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

      {/* Analysis Gadgets */}
      <div className="px-1 mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Analysis
      </div>
      <div className="space-y-3">
        {ANALYSIS_GADGETS.map(gadget => (
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

      {/* Treatments Label and List */}
      {TREATMENT_GADGETS.length > 0 && (
        <div className="mt-5">
          <div className="px-1 mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Treatments
          </div>
          <div className="space-y-3">
            {TREATMENT_GADGETS.map(gadget => (
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
        </div>
      )}

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

