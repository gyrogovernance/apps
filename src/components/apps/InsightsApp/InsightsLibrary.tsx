import React, { useState, useEffect } from 'react';
import { GovernanceInsight, ChallengeType, AlignmentCategory } from '../../../types';
import { insights as insightsStorage } from '../../../lib/storage';
import { getQIColor, getAlignmentColor } from '../../../lib/ui-utils';

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
  const [allInsights, setAllInsights] = useState<GovernanceInsight[]>([]);
  const [loading, setLoading] = useState(true);
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
          {sortedInsights.map((insight) => (
            <button
              key={insight.id}
              onClick={() => onSelectInsight(insight.id)}
              className="w-full p-5 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:shadow-lg transition-all text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {insight.challenge.title}
                  </h3>
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
                    {insight.quality.superintelligence_index.toFixed(1)}
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
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default InsightsLibrary;

