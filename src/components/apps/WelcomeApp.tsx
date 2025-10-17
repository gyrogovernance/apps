import React from 'react';
import { NotebookState } from '../../types';
import AppCard from '../shared/AppCard';

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
  const activeSessions = state.sessions.filter(s => s.status === 'active' || s.status === 'paused');
  const completedInsightsCount = state.sessions.filter(s => s.status === 'complete').length;
  const hasActiveSession = activeSessions.length > 0;

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

              {/* Smart Paste Detection */}
              <div className="p-3 bg-white/60 dark:bg-gray-800/40 rounded border border-green-200 dark:border-green-800">
                <div className="font-semibold text-green-800 dark:text-green-200 mb-1 flex items-center gap-1">
                  <span>📋</span>
                  <span>Smart Paste Detection (Enabled by Default)</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Automatically detects when you paste AI responses or analyst JSON. To enable clipboard permissions in Chrome:
                </p>
                <ol className="list-decimal list-inside text-gray-600 dark:text-gray-400 space-y-1 ml-2 text-xs">
                  <li>Click the extension icon in your toolbar</li>
                  <li>When prompted, grant clipboard read permission</li>
                  <li>Or manually: Right-click extension → "This can read and change site data" → "When you click the extension"</li>
                </ol>
                <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                  💡 <strong>Don't want it?</strong> Disable in Settings → Smart Paste Detection
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


      {/* Help Section */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Getting Started
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
              The GyroDiagnostics framework helps you evaluate AI models through structured challenges across 5 domains: 
              Formal, Normative, Procedural, Strategic, and Epistemic.
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
              <li>• <strong>Participation:</strong> Select or create a challenge</li>
              <li>• <strong>Preparation:</strong> Run 2 synthesis epochs (6 turns each)</li>
              <li>• <strong>Provision:</strong> Evaluate with 2 analyst perspectives</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeApp;

