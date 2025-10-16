import React, { useState, useEffect } from 'react';
import { NotebookState, InsightsView, GovernanceInsight } from '../../../types';
import { insights as insightsStorage } from '../../../lib/storage';
import InsightsLibrary from './InsightsLibrary';
import InsightDetail from './InsightDetail';

interface InsightsAppProps {
  state: NotebookState;
  onUpdate: (updates: Partial<NotebookState> | ((prev: NotebookState) => Partial<NotebookState>)) => void;
}

const InsightsApp: React.FC<InsightsAppProps> = ({ state, onUpdate }) => {
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<GovernanceInsight | null>(null);

  const currentView = state.ui.insightsView || 'library';

  // Clear selection when returning to library view
  useEffect(() => {
    if (currentView === 'library') {
      setSelectedInsightId(null);
      setSelectedInsight(null);
    }
  }, [currentView]);

  useEffect(() => {
    if (selectedInsightId) {
      loadInsight(selectedInsightId);
    }
  }, [selectedInsightId]);

  const loadInsight = async (insightId: string) => {
    const insight = await insightsStorage.getById(insightId);
    setSelectedInsight(insight);
    navigateToView('detail');
  };

  const navigateToView = (view: InsightsView) => {
    onUpdate(prev => ({
      ui: { ...prev.ui, insightsView: view }
    }));
  };

  const handleSelectInsight = (insightId: string) => {
    setSelectedInsightId(insightId);
  };

  const handleBackToLibrary = () => {
    setSelectedInsightId(null);
    setSelectedInsight(null);
    navigateToView('library');
  };

  // Render current view
  switch (currentView) {
    case 'library':
      return <InsightsLibrary onSelectInsight={handleSelectInsight} />;

    case 'detail':
      if (!selectedInsight) {
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600 dark:text-gray-400">Loading insight...</div>
          </div>
        );
      }
      return <InsightDetail insight={selectedInsight} onBack={handleBackToLibrary} />;

    case 'comparison':
      return (
        <div className="max-w-6xl mx-auto p-6">
          <div className="p-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              🚧 Comparison View (Coming Soon)
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Compare multiple insights side-by-side
            </p>
            <button
              onClick={handleBackToLibrary}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Back to Library
            </button>
          </div>
        </div>
      );

    default:
      return <InsightsLibrary onSelectInsight={handleSelectInsight} />;
  }
};

export default InsightsApp;

