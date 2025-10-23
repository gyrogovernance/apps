import React, { useState, useEffect } from 'react';
import { GovernanceInsight, ChallengeType, AlignmentCategory } from '../../../types';
import { insights as insightsStorage } from '../../../lib/storage';
import { getQIColor, getAlignmentColor } from '../../../lib/ui-utils';
import { exportAsJSON, exportAsMarkdown, downloadFile, generateFilename } from '../../../lib/export';
import { useToast } from '../../shared/Toast';
import { SmartTooltip } from '../../shared/SmartTooltip';
import { Z_INDEX } from '../../../lib/constants';
import GlassCard from '../../shared/GlassCard';

interface InsightsLibraryProps {
  onSelectInsight: (insightId: string) => void;
}

interface Filters {
  search: string;
  challengeType: ChallengeType | 'all';
  synthesizer: string;
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
    synthesizer: 'all',
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

  // Get unique synthesizer models for filter dropdown
  const uniqueSynthesizers = React.useMemo(() => {
    const models = new Set<string>();
    allInsights.forEach(insight => {
      const model = insight.process?.models_used?.synthesis_epoch1 || 
                   insight.process?.models_used?.synthesis_epoch2;
      if (model) models.add(model);
    });
    return Array.from(models).sort();
  }, [allInsights]);

  // Filter insights (memoized to avoid recalculation on every render)
  const filteredInsights = React.useMemo(() => {
    return allInsights.filter(insight => {
      // Safely access challenge and quality properties
      const title = insight.challenge?.title || '';
      const type = insight.challenge?.type || 'custom';
      const alignmentCategory = insight.quality?.alignment_rate_category;
      const qualityIndex = insight.quality?.quality_index || 0;
      const synthesizer = insight.process?.models_used?.synthesis_epoch1 || 
                          insight.process?.models_used?.synthesis_epoch2 || '';
      
      if (filters.search && !title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.challengeType !== 'all' && type !== filters.challengeType) {
        return false;
      }
      if (filters.synthesizer !== 'all' && synthesizer !== filters.synthesizer) {
        return false;
      }
      if (filters.alignmentCategory !== 'all' && alignmentCategory !== filters.alignmentCategory) {
        return false;
      }
      if (qualityIndex < filters.minQI) {
        return false;
      }
      return true;
    });
  }, [allInsights, filters]);

  // Sort by date (most recent first) - memoized
  const sortedInsights = React.useMemo(() => {
    return [...filteredInsights].sort((a, b) => {
      const dateA = a.process?.created_at ? new Date(a.process.created_at).getTime() : 0;
      const dateB = b.process?.created_at ? new Date(b.process.created_at).getTime() : 0;
      return dateB - dateA;
    });
  }, [filteredInsights]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading insights...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header - Fixed */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>💡</span>
          <span>Insights Library</span>
        </h1>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {sortedInsights.length} of {allInsights.length} evaluations
        </p>
      </div>

      <GlassCard className="flex-1 flex flex-col overflow-hidden">
      {/* Filters - Fixed at top */}
      <div className="p-4 pb-3 space-y-2">
        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Search..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* Filter Selects - Stacked vertically for sidebar */}
        <div className="space-y-2">
          <select
            value={filters.synthesizer}
            onChange={(e) => setFilters({ ...filters, synthesizer: e.target.value })}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Models</option>
            {uniqueSynthesizers.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>

          <select
            value={filters.challengeType}
            onChange={(e) => setFilters({ ...filters, challengeType: e.target.value as ChallengeType | 'all' })}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Challenges</option>
            <option value="formal">Formal</option>
            <option value="normative">Normative</option>
            <option value="procedural">Procedural</option>
            <option value="strategic">Strategic</option>
            <option value="epistemic">Epistemic</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(filters.search || filters.challengeType !== 'all' || filters.synthesizer !== 'all' || filters.alignmentCategory !== 'all' || filters.minQI > 0) && (
          <button
            onClick={() => setFilters({ search: '', challengeType: 'all', synthesizer: 'all', alignmentCategory: 'all', minQI: 0 })}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            ✕ Clear filters
          </button>
        )}
      </div>

      {/* Insights List - Scrollable only */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {sortedInsights.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📭</div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {allInsights.length === 0 ? 'No insights yet' : 'No insights match'}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {allInsights.length === 0 
                ? 'Complete an evaluation first'
                : 'Try adjusting filters'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedInsights.map((insight) => {
              const shortId = insight.id ? insight.id.slice(-8) : 'unknown';
              const synthesizer = insight.process?.models_used?.synthesis_epoch1 || 
                                 insight.process?.models_used?.synthesis_epoch2 || 'Unknown';
              const qi = insight.quality?.quality_index || 0;
              const si = insight.quality?.superintelligence_index;
              const alignment = insight.quality?.alignment_rate_category || 'N/A';
              const pathologyCount = insight.quality?.pathologies?.detected?.length || 0;
              const date = insight.process?.created_at 
                ? new Date(insight.process.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : 'N/A';

              return (
                <div
                  key={insight.id}
                  className="relative p-3 bg-white/60 dark:bg-gray-800/90 rounded border border-blue-200 dark:border-blue-800 hover:bg-white/80 dark:hover:bg-gray-800 transition-all cursor-pointer"
                  onClick={() => onSelectInsight(insight.id)}
                >
                  {/* Title Row */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 flex-1 pr-2">
                      {insight.challenge?.title || 'Untitled'}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === insight.id ? null : insight.id);
                      }}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                    >
                      <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </div>

                  {/* Excellence Badge */}
                  {qi >= 80 && (
                    <div className="absolute top-2 right-2">
                      <span className="text-lg" title="High Quality Result">⭐</span>
                    </div>
                  )}

                  {/* Meta Row */}
                  <div className="flex items-center gap-2 mb-2 text-xs">
                    <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded">
                      {insight.challenge?.type || 'custom'}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">•</span>
                    <span className="text-gray-500 dark:text-gray-400 truncate flex-1" title={synthesizer}>
                      {synthesizer}
                    </span>
                    <span className="text-gray-400 dark:text-gray-500">{date}</span>
                  </div>

                  {/* Metrics Row - Compact Grid */}
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">
                        <SmartTooltip term="QI">
                          <span className="cursor-help">QI</span>
                        </SmartTooltip>
                      </div>
                      <div className={`font-bold ${getQIColor(qi)}`}>
                        {qi.toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">
                        <SmartTooltip term="SI">
                          <span className="cursor-help">SI</span>
                        </SmartTooltip>
                      </div>
                      <div className="font-bold text-gray-900 dark:text-gray-100">
                        {(si == null || isNaN(si)) ? '-' : si.toFixed(1)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">
                        <SmartTooltip term="AR">
                          <span className="cursor-help">AR</span>
                        </SmartTooltip>
                      </div>
                      <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${getAlignmentColor(alignment)}`}>
                        {alignment === 'VALID' ? 'V' : alignment === 'SUPERFICIAL' ? 'S' : 'L'}
                      </span>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">
                        <SmartTooltip term="P">
                          <span className="cursor-help">P</span>
                        </SmartTooltip>
                      </div>
                      <div className="font-bold text-gray-900 dark:text-gray-100">
                        {pathologyCount}
                      </div>
                    </div>
                  </div>

                  {/* Action Menu Dropdown */}
                  {openMenuId === insight.id && (
                    <div 
                      className="absolute right-0 top-10 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
                      style={{ zIndex: Z_INDEX.DROPDOWN }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadJSON(insight);
                          setOpenMenuId(null);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 rounded-t-lg"
                      >
                        <span>📥</span> JSON
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadMarkdown(insight);
                          setOpenMenuId(null);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <span>📄</span> Markdown
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteInsight(insight.id, insight.challenge.title);
                          setOpenMenuId(null);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 rounded-b-lg"
                      >
                        <span>🗑️</span> Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      </GlassCard>
    </div>
  );
};

export default InsightsLibrary;

