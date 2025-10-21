import React from 'react';
import { NotebookState } from '../../types';
import AppCard from '../shared/AppCard';
import { importGyroDiagnostics } from '../../lib/import';
import { insights as insightsStorage } from '../../lib/storage';
import { useToast } from '../shared/Toast';

interface WelcomeAppProps {
  state: NotebookState;
  onNavigate: (app: 'challenges' | 'journal' | 'insights' | 'settings') => void;
  onQuickStart: () => void;
  onResume: () => void;
}

const WelcomeApp: React.FC<WelcomeAppProps> = ({ 
  state, 
  onNavigate, 
  onQuickStart,
  onResume 
}) => {
  const [isGuideOpen, setIsGuideOpen] = React.useState(true);
  const [isImporting, setIsImporting] = React.useState(false);
  const toast = useToast();
  const activeSessions = state.sessions.filter(s => s.status === 'active' || s.status === 'paused');
  const completedInsightsCount = state.sessions.filter(s => s.status === 'complete').length;
  const hasActiveSession = activeSessions.length > 0;
  
  // Get proper URL for extension assets
  const stampUrl = typeof chrome !== 'undefined' && chrome.runtime?.getURL 
    ? chrome.runtime.getURL('icons/gyrogovernance_stamp.png')
    : 'dist/icons/gyrogovernance_stamp.png';

  // Load guide state from localStorage on mount
  React.useEffect(() => {
    const savedState = localStorage.getItem('welcome_guide_open');
    if (savedState !== null) {
      setIsGuideOpen(savedState === 'true');
    }
  }, []);

  // Save guide state to localStorage when it changes
  const handleToggleGuide = () => {
    const newState = !isGuideOpen;
    setIsGuideOpen(newState);
    localStorage.setItem('welcome_guide_open', String(newState));
  };

  // Import official GyroDiagnostics results
  const handleImportOfficialResults = async () => {
    if (isImporting) return;
    
    setIsImporting(true);
    try {
      // Get the results.zip file from the public folder
      const response = await fetch('results.zip');
      if (!response.ok) {
        throw new Error('Failed to fetch results.zip');
      }
      
      const blob = await response.blob();
      const file = new File([blob], 'results.zip', { type: 'application/zip' });
      
      const result = await importGyroDiagnostics(file);
      
      if (!result.success) {
        toast.show(result.error || 'Import failed', 'error');
        return;
      }

      // Refresh insights count
      const insights = await insightsStorage.getAll();
      const message = `Imported ${insights.length} insight(s) from ${result.filesProcessed}/${result.filesFound} file(s) in official results`;
      toast.show(message, 'success');
      
      // Navigate to insights to show the imported data
      onNavigate('insights');
    } catch (error) {
      console.error('Import failed:', error);
      toast.show('Failed to import official results. Please try again.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-gray-700 dark:text-gray-300 text-base font-semibold">
          Transform AI conversations into validated governance insights using the GyroDiagnostics framework.
        </p>
      </div>

      {/* App Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <AppCard
          icon="📋"
          title="Challenges"
          description="Select or create governance challenges to evaluate AI models"
          onClick={() => onNavigate('challenges')}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800"
        />
        <AppCard
          icon="📓"
          title="Journal"
          description="Active synthesis sessions with structured evaluation"
          badge={hasActiveSession ? `${activeSessions.length} Active` : undefined}
          onClick={() => onNavigate('journal')}
          className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800"
        />
        <AppCard
          icon="💡"
          title="Insights"
          description="Browse governance challenge solutions from AI models"
          badge={completedInsightsCount > 0 ? `${completedInsightsCount}` : undefined}
          onClick={() => onNavigate('insights')}
          className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800"
        />
        <AppCard
          icon="⚙️"
          title="Settings"
          description="Preferences, templates, and configuration"
          onClick={() => onNavigate('settings')}
          className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/20 dark:to-slate-800/20 border-gray-200 dark:border-gray-700"
        />
      </div>

      {/* Quick Start Guide */}
      <div className="mb-6">
        <div 
          className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 rounded-lg border border-green-200 dark:border-green-800 cursor-pointer"
          onClick={handleToggleGuide}
        >
          <div className="font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <span>🚀</span>
              <span>Quick Start Guide</span>
            </div>
            <span className="text-gray-500 dark:text-gray-400 text-lg">
              {isGuideOpen ? '▼' : '▶'}
            </span>
          </div>
          
          {isGuideOpen && (
            <div className="mt-3 space-y-3 text-sm" onClick={(e) => e.stopPropagation()}>
              {/* The Four Apps */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-white/40 dark:bg-gray-800/30 rounded text-xs">
                  <div className="font-semibold text-blue-700 dark:text-blue-300 mb-0.5">📋 Challenges</div>
                  <div className="text-gray-600 dark:text-gray-400">Choose from 5 governance domains or create custom challenges</div>
                </div>
                <div className="p-2 bg-white/40 dark:bg-gray-800/30 rounded text-xs">
                  <div className="font-semibold text-purple-700 dark:text-purple-300 mb-0.5">📓 Journal</div>
                  <div className="text-gray-600 dark:text-gray-400">Manage sessions with 2 synthesis epochs (6 turns each)</div>
                </div>
                <div className="p-2 bg-white/40 dark:bg-gray-800/30 rounded text-xs">
                  <div className="font-semibold text-green-700 dark:text-green-300 mb-0.5">💡 Insights</div>
                  <div className="text-gray-600 dark:text-gray-400">Browse governance solutions generated by AI models</div>
                </div>
                <div className="p-2 bg-white/40 dark:bg-gray-800/30 rounded text-xs">
                  <div className="font-semibold text-gray-700 dark:text-gray-300 mb-0.5">⚙️ Settings</div>
                  <div className="text-gray-600 dark:text-gray-400">Import/export data, customize preferences, view shortcuts</div>
                </div>
              </div>

              {/* Official Results Import */}
              <div className="p-3 bg-white/60 dark:bg-gray-800/40 rounded border border-blue-200 dark:border-blue-800">
                <div className="font-semibold text-blue-800 dark:text-blue-200 mb-1 flex items-center gap-1">
                  <span>📊</span>
                  <span>Official GyroDiagnostics Results</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Import the latest official evaluation results from the <a 
                    href="https://github.com/gyrogovernance/diagnostics" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    GyroDiagnostics repository
                  </a> to explore benchmark data and compare your models.
                </p>
                <button
                  onClick={handleImportOfficialResults}
                  disabled={isImporting}
                  className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {isImporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <span>📥</span>
                      <span>Import Official Results</span>
                    </>
                  )}
                </button>
                <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                  💡 <strong>What's included:</strong> Pre-evaluated insights from frontier models (GPT-4o, Claude Sonnet 4.5, Grok-4)
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <button 
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickStart();
                  }}
                >
                  <span>🚀</span>
                  <span>Start New Evaluation</span>
                </button>
                {hasActiveSession && (
                  <button 
                    className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onResume();
                    }}
                  >
                    <span>▶️</span>
                    <span>Resume Session</span>
                  </button>
                )}
              </div>

              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsGuideOpen(false);
                    localStorage.setItem('welcome_guide_open', 'false');
                  }}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full transition-colors"
                >
                  Close Guide
                </button>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* GyroGovernance Promo */}
      <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
        <div className="text-center">
          {/* Stamp at top */}
          <img 
            src={stampUrl}
            alt="GyroGovernance" 
            className="w-16 h-16 opacity-70 dark:opacity-60 mx-auto mb-3"
          />
          
          {/* Description */}
          <p className="text-sm text-indigo-800 dark:text-indigo-200 mb-3">
            Explore the full GyroDiagnostics framework and connect with the governance research community.
          </p>
          
          {/* Compact buttons */}
          <div className="flex gap-2">
            <a 
              href="https://gyrogovernance.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 px-2 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded transition-colors duration-200 flex items-center justify-center gap-1"
            >
              <span>🌐</span>
              <span>Website</span>
            </a>
            <a 
              href="https://github.com/gyrogovernance/apps" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 px-2 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 text-xs font-medium rounded transition-colors duration-200 flex items-center justify-center gap-1"
            >
              <span>📂</span>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeApp;

