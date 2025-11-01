// Export Actions - Download JSON, Markdown, and navigate to InsightsApp
// Uses detector export utilities in lib/detector-export

import React from 'react';
import { exportRapidTestAsMarkdown, exportRapidTestAsJSON } from '../../../lib/detector-export';
import { useToast } from '../../shared/Toast';
import GlassCard from '../../shared/GlassCard';

interface ExportActionsProps {
  draftData: any;
  results: {
    aggregated: any;
    metrics: any;
  };
  onSaveInsight: () => void;
}

const ExportActions: React.FC<ExportActionsProps> = ({
  draftData,
  results,
  onSaveInsight
}) => {
  const toast = useToast();

  const handleExportJSON = () => {
    const json = exportRapidTestAsJSON(draftData, { aggregated: results.aggregated, metrics: results.metrics });
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapid_test_analysis_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.show('JSON exported successfully', 'success');
  };

  const handleExportMarkdown = () => {
    const markdown = exportRapidTestAsMarkdown(draftData, { aggregated: results.aggregated, metrics: results.metrics });
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapid_test_report_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.show('Markdown exported successfully', 'success');
  };

  return (
    <GlassCard className="p-6" variant="glassPurple" borderGradient="purple">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Export
      </h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
            Export Analysis
          </h4>
          <div className="space-y-2">
            <button
              onClick={handleExportJSON}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              📊 Export JSON
            </button>
            <button
              onClick={handleExportMarkdown}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              📄 Export Markdown
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
            Save to Library
          </h4>
          <div className="space-y-2">
            <button
              onClick={onSaveInsight}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              💾 Save as Insight
            </button>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Saves this analysis to your Insights Library for future reference and comparison.
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default ExportActions;
