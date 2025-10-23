import React, { useState, useEffect, useMemo } from 'react';
import { NotebookState, InsightsView, GovernanceInsight } from '../../../types';
import { insights as insightsStorage } from '../../../lib/storage';
import { downloadFile, formatDate, formatDuration } from '../../../lib/export-utils';
import { useToast } from '../../shared/Toast';
import InsightsLibrary from './InsightsLibrary';
import InsightDetail from './InsightDetail';
import { SuiteReports } from './SuiteReports';
import { ModelTracker } from './ModelTracker';

interface InsightsAppProps {
  state: NotebookState;
  onUpdate: (updates: Partial<NotebookState> | ((prev: NotebookState) => Partial<NotebookState>)) => void;
}

type InsightsTab = 'library' | 'suites' | 'tracker';


const InsightsApp: React.FC<InsightsAppProps> = ({ state, onUpdate }) => {
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(null);

  // Scroll to top whenever the insights view or selected insight changes
  useEffect(() => {
    const scrollToTop = () => {
      const scrollableContainer = document.querySelector('.overflow-y-auto');
      if (scrollableContainer) {
        scrollableContainer.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    scrollToTop();
    const timeoutId = setTimeout(scrollToTop, 50);
    return () => clearTimeout(timeoutId);
  }, [state.ui.insightsView, selectedInsightId]);
  const [selectedInsight, setSelectedInsight] = useState<GovernanceInsight | null>(null);
  const [allInsights, setAllInsights] = useState<GovernanceInsight[]>([]);
  const [activeTab, setActiveTab] = useState<InsightsTab>('library');
  const toast = useToast();

  const currentView = state.ui.insightsView || 'library';

  // Load all insights for suite grouping
  useEffect(() => {
    const loadInsights = async () => {
      const insights = await insightsStorage.getAll();
      setAllInsights(insights);
    };
    loadInsights();
  }, []);

  // Count suites (all insights now have suiteRunId)
  const suitesCount = useMemo(() => {
    const grouped = allInsights.reduce((acc, i) => {
      if (!i.suiteRunId) return acc;
      (acc[i.suiteRunId] ||= []).push(i);
      return acc;
    }, {} as Record<string, GovernanceInsight[]>);
    
    // Count complete suites (5 challenge types)
    return Object.values(grouped).filter(s => s.length === 5).length;
  }, [allInsights]);

  // Export suite handler
  const handleExportSuite = (suiteRunId: string, insightIds?: string[]) => {
    try {
      const suiteInsights = insightIds && insightIds.length
        ? allInsights.filter(i => insightIds.includes(i.id))
        : allInsights.filter(i => i.suiteRunId === suiteRunId);
      
      if (suiteInsights.length === 0) {
        toast.show('Suite not found', 'error');
        return;
      }

      // Sort by suite index or challenge type order
      const sortedInsights = suiteInsights.sort((a, b) => {
        if (a.suiteMetadata?.suiteIndex !== undefined && b.suiteMetadata?.suiteIndex !== undefined) {
          return a.suiteMetadata.suiteIndex - b.suiteMetadata.suiteIndex;
        }
        const typeOrder = { 'formal': 0, 'normative': 1, 'procedural': 2, 'strategic': 3, 'epistemic': 4 };
        return (typeOrder[a.challenge.type as keyof typeof typeOrder] || 0) - 
               (typeOrder[b.challenge.type as keyof typeof typeOrder] || 0);
      });

      // Calculate aggregate metrics
      const qis = sortedInsights.map(i => i.quality.quality_index);
      const sis = sortedInsights.map(i => i.quality.superintelligence_index);
      const ars = sortedInsights.map(i => i.quality.alignment_rate);
      
      const median = (arr: number[]) => {
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
      };

      const medianQI = median(qis);
      const medianSI = median(sis);
      const medianAR = median(ars);

      // Get model name and completion date
      const modelName = sortedInsights[0]?.suiteMetadata?.modelEvaluated || 
                       sortedInsights[0]?.process.models_used.synthesis_epoch1 || 
                       'Unknown Model';
      const completedAt = sortedInsights[0]?.suiteMetadata?.suiteCompletedAt || 
                         sortedInsights[0]?.process.created_at || 
                         new Date().toISOString();

      // Calculate total duration
      const totalDuration = sortedInsights.reduce((sum, insight) => {
        const epoch1Duration = insight.process.durations.epoch1_minutes || 0;
        const epoch2Duration = insight.process.durations.epoch2_minutes || 0;
        return sum + epoch1Duration + epoch2Duration;
      }, 0);

      // Count pathologies
      const allPathologies = sortedInsights.flatMap(i => i.quality.pathologies.detected);
      const pathologyCounts = allPathologies.reduce((acc, p) => {
        acc[p] = (acc[p] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Generate markdown report
      let md = `# GyroDiagnostics Suite Report\n\n`;
      md += `**Model**: ${modelName}\n`;
      md += `**Completed**: ${formatDate(completedAt)}\n`;
      md += `**Total Duration**: ${formatDuration(totalDuration)}\n\n`;
      
      md += `## Aggregate Metrics\n\n`;
      md += `- **Quality Index (QI)**: ${medianQI.toFixed(1)}%\n`;
      md += `- **Superintelligence Index (SI)**: ${medianSI.toFixed(1)}\n`;
      md += `- **Alignment Rate (AR)**: ${medianAR.toFixed(3)}/min\n\n`;

      if (Object.keys(pathologyCounts).length > 0) {
        md += `## Pathology Summary\n\n`;
        Object.entries(pathologyCounts)
          .sort(([,a], [,b]) => b - a)
          .forEach(([pathology, count]) => {
            md += `- **${pathology}**: ${count} occurrence${count > 1 ? 's' : ''}\n`;
          });
        md += `\n`;
      }

      md += `## Challenge Details\n\n`;
      
      sortedInsights.forEach((insight, index) => {
        const challengeType = insight.challenge.type.charAt(0).toUpperCase() + insight.challenge.type.slice(1);
        md += `### ${index + 1}. ${challengeType} Challenge\n\n`;
        md += `**QI**: ${insight.quality.quality_index.toFixed(1)}% | `;
        md += `**SI**: ${insight.quality.superintelligence_index.toFixed(1)} | `;
        md += `**AR**: ${insight.quality.alignment_rate.toFixed(3)}/min\n\n`;
        
        if (insight.quality.pathologies.detected.length > 0) {
          md += `**Pathologies**: ${insight.quality.pathologies.detected.join(', ')}\n\n`;
        }
        
        md += `**Solution**:\n\n`;
        md += insight.insights.combined_markdown + '\n\n';
        md += `---\n\n`;
      });

      // Download the file
      const filename = `${modelName.replace(/[^a-z0-9]/gi, '_')}_gyro_suite_${new Date().toISOString().slice(0,10)}.md`;
      downloadFile(filename, md, 'text/markdown');
      
      toast.show('Suite report exported successfully', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      toast.show('Failed to export suite report', 'error');
    }
  };

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


  // Handle detail view separately
  if (currentView === 'detail') {
    if (!selectedInsight) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600 dark:text-gray-400">Loading insight...</div>
        </div>
      );
    }
    return <InsightDetail insight={selectedInsight} onBack={handleBackToLibrary} />;
  }

  // Handle comparison view
  if (currentView === 'comparison') {
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
  }

  // Main tabbed interface
  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('library')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'library'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            📖 Library ({allInsights.length})
          </button>
          <button
            onClick={() => setActiveTab('suites')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'suites'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            🎯 Suite Reports ({suitesCount})
          </button>
          <button
            onClick={() => setActiveTab('tracker')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tracker'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            📊 Model Tracker
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'library' && (
          <InsightsLibrary onSelectInsight={handleSelectInsight} />
        )}
        {activeTab === 'suites' && (
          <SuiteReports
            insights={allInsights}
            onViewInsight={handleSelectInsight}
            onExportSuite={handleExportSuite}
          />
        )}
        {activeTab === 'tracker' && (
          <ModelTracker
            insights={allInsights}
            onViewInsight={handleSelectInsight}
          />
        )}
      </div>
    </div>
  );
};

export default InsightsApp;

