import React, { useState, useEffect } from 'react';
import { GovernanceInsight, ChallengeType, AlignmentCategory } from '../../../types';
import { insights as insightsStorage } from '../../../lib/storage';
import { getQIColor, getAlignmentColor } from '../../../lib/ui-utils';
import { exportAsJSON, exportAsMarkdown, downloadFile, generateFilename } from '../../../lib/export';
import { useToast } from '../../shared/Toast';

interface InsightsLibraryProps {
  onSelectInsight: (insightId: string) => void;
}

interface Filters {
  search: string;
  challengeType: ChallengeType | 'all';
  alignmentCategory: AlignmentCategory | 'all';
  minQI: number;
}

const InsightsLibrary: React.FC<InsightsLibraryProps> = ({ onSelectInsight }) => {
  const toast = useToast();
  const [allInsights, setAllInsights] = useState<GovernanceInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    challengeType: 'all',
    alignmentCategory: 'all',
    minQI: 0
  });

  // Load insights on mount
  useEffect(() => {
    loadInsights();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const loaded = await insightsStorage.getAll();
      setAllInsights(loaded);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInsight = async (insightId: string, title: string) => {
    if (!confirm(`Delete insight "${title}"?`)) return;
    
    try {
      await insightsStorage.delete(insightId);
      toast.show('Insight deleted', 'success');
      await loadInsights();
    } catch (error) {
      console.error('Error deleting insight:', error);
      toast.show('Failed to delete insight', 'error');
    }
  };

  const handleDownloadJSON = (insight: GovernanceInsight) => {
    const json = exportAsJSON(insight);
    const filename = generateFilename(insight.challenge.title, 'json');
    downloadFile(filename, json, 'application/json');
    toast.show('Downloaded as JSON', 'success');
  };

  const handleDownloadMarkdown = (insight: GovernanceInsight) => {
    const md = exportAsMarkdown(insight);
    const filename = generateFilename(insight.challenge.title, 'md');
    downloadFile(filename, md, 'text/markdown');
    toast.show('Downloaded as Markdown', 'success');
  };

  // Filter insights
  const filteredInsights = allInsights.filter(insight => {
    if (filters.search && !insight.challenge.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.challengeType !== 'all' && insight.challenge.type !== filters.challengeType) {
      return false;
    }
    if (filters.alignmentCategory !== 'all' && insight.quality.alignment_rate_category !== filters.alignmentCategory) {
      return false;
    }
    if (insight.quality.quality_index < filters.minQI) {
      return false;
    }
    return true;
  });

  // Sort by date (most recent first)
  const sortedInsights = [...filteredInsights].sort((a, b) => 
    new Date(b.process.created_at).getTime() - new Date(a.process.created_at).getTime()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading insights...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
          <span>💡</span>
          <span>Insights Library</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Browse, organize, and share your completed evaluations
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="🔍 Search insights..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Challenge Type</label>
            <select
              value={filters.challengeType}
              onChange={(e) => setFilters({ ...filters, challengeType: e.target.value as ChallengeType | 'all' })}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Types</option>
              <option value="formal">Formal</option>
              <option value="normative">Normative</option>
              <option value="procedural">Procedural</option>
              <option value="strategic">Strategic</option>
              <option value="epistemic">Epistemic</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Alignment</label>
            <select
              value={filters.alignmentCategory}
              onChange={(e) => setFilters({ ...filters, alignmentCategory: e.target.value as AlignmentCategory | 'all' })}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All</option>
              <option value="VALID">Valid</option>
              <option value="SUPERFICIAL">Superficial</option>
              <option value="SLOW">Slow</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Min QI</label>
            <input
              type="number"
              min="0"
              max="100"
              value={filters.minQI}
              onChange={(e) => setFilters({ ...filters, minQI: Number(e.target.value) })}
              className="w-20 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          {(filters.search || filters.challengeType !== 'all' || filters.alignmentCategory !== 'all' || filters.minQI > 0) && (
            <button
              onClick={() => setFilters({ search: '', challengeType: 'all', alignmentCategory: 'all', minQI: 0 })}
              className="px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {sortedInsights.length} of {allInsights.length} insights
      </div>

      {/* Insights List */}
      {sortedInsights.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {allInsights.length === 0 ? 'No insights yet' : 'No insights match your filters'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {allInsights.length === 0 
              ? 'Complete an evaluation to see insights here'
              : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedInsights.map((insight) => {
            const shortId = insight.id.slice(-8);
            return (
              <div
                key={insight.id}
                className="relative w-full p-5 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:shadow-lg transition-all"
              >
                {/* Main content - clickable */}
                <div 
                  onClick={() => onSelectInsight(insight.id)}
                  className="cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {insight.challenge.title}
                        </h3>
                        <span className="text-xs font-mono text-gray-400 dark:text-gray-500" title={insight.id}>
                          #{shortId}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                          {insight.challenge.type}
                        </span>
                        {insight.challenge.domain.slice(0, 3).map(d => (
                          <span key={d} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                            {d}
                          </span>
                        ))}
                        {insight.challenge.domain.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                            +{insight.challenge.domain.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(insight.process.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Quality Index</div>
                      <div className={`text-xl font-bold ${getQIColor(insight.quality.quality_index)}`}>
                        {insight.quality.quality_index.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">SI</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {(insight.quality.superintelligence_index == null || isNaN(insight.quality.superintelligence_index)) ? 'N/A' : insight.quality.superintelligence_index.toFixed(1)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Alignment</div>
                      <div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAlignmentColor(insight.quality.alignment_rate_category)}`}>
                          {insight.quality.alignment_rate_category}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pathologies</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {insight.quality.pathologies.detected.length}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Models: {insight.process.models_used.synthesis_epoch1}, {insight.process.models_used.analyst1}
                  </div>
                </div>

                {/* Action menu */}
                <div className="absolute top-4 right-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === insight.id ? null : insight.id);
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                  
                  {openMenuId === insight.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadJSON(insight);
                          setOpenMenuId(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <span>📥</span> Download JSON
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadMarkdown(insight);
                          setOpenMenuId(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <span>📄</span> Download Markdown
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteInsight(insight.id, insight.challenge.title);
                          setOpenMenuId(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 rounded-b-lg"
                      >
                        <span>🗑️</span> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InsightsLibrary;

