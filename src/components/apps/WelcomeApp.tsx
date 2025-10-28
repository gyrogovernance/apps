import React, { useEffect } from 'react';
import { NotebookState } from '../../types';
import AppCard from '../shared/AppCard';
import GlassCard from '../shared/GlassCard';
import { importGyroDiagnostics } from '../../lib/import';
import { insights as insightsStorage } from '../../lib/storage';
import { useToast } from '../shared/Toast';

interface WelcomeAppProps {
  state: NotebookState;
  onNavigate: (app: 'challenges' | 'journal' | 'insights' | 'settings' | 'gadgets' | 'glossary') => void;
  onQuickStart: () => void;
  onResume: () => void;
}

const WelcomeApp: React.FC<WelcomeAppProps> = ({ 
  state, 
  onNavigate, 
  onQuickStart,
  onResume 
}) => {
  // Scroll to top when welcome app loads
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
  }, []);
  const [isGuideOpen, setIsGuideOpen] = React.useState(true);
  const [isImporting, setIsImporting] = React.useState(false);
  const toast = useToast();
  const activeSessions = state.sessions.filter(s => s.status === 'active' || s.status === 'paused');
  const completedInsightsCount = state.sessions.filter(s => s.status === 'complete').length;
  const hasActiveSession = activeSessions.length > 0;
  
  // Get proper URL for extension assets
  const headerImageUrl = typeof chrome !== 'undefined' && chrome.runtime?.getURL 
    ? chrome.runtime.getURL('icons/ai_inspector_app_top.png')
    : 'icons/ai_inspector_app_top.png';

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
      // Try different URL strategies based on environment
      let resultsUrl: string = '';
      let response: Response;
      
      if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
        // Chrome extension environment
        resultsUrl = chrome.runtime.getURL('results.zip');
        response = await fetch(resultsUrl);
      } else {
        // File:// or web environment - try multiple paths
        const possibleUrls = [
          './results.zip',
          'results.zip',
          '../results.zip',
          '/results.zip'
        ];
        
        let lastError: Error | null = null;
        for (const url of possibleUrls) {
          try {
            response = await fetch(url);
            if (response.ok) {
              resultsUrl = url;
              break;
            }
          } catch (error) {
            lastError = error as Error;
            continue;
          }
        }
        
        if (!response! || !response!.ok) {
          throw new Error(`Failed to fetch results.zip. Tried: ${possibleUrls.join(', ')}. ${lastError ? `Last error: ${lastError.message}` : 'All attempts failed.'}`);
        }
      }
      
      const blob = await response.blob();
      const file = new File([blob], 'results.zip', { type: 'application/zip' });
      
      const result = await importGyroDiagnostics(file);
      
      if (!result.success) {
        console.error('Import failed:', result.error);
        toast.show(result.error || 'Import failed', 'error');
        return;
      }

      // Save the imported insights to storage
      if (result.insights && result.insights.length > 0) {
        for (const insight of result.insights) {
          await insightsStorage.save(insight);
        }
      }

      // Refresh insights count
      const insights = await insightsStorage.getAll();
      const message = `Imported ${result.insights?.length || 0} insight(s) from ${result.filesProcessed}/${result.filesFound} file(s) in official results`;
      toast.show(message, 'success');
      
      // Navigate to insights to show the imported data
      onNavigate('insights');
    } catch (error) {
      console.error('Import failed:', error);
      
      // Provide helpful error message for file:// protocol issues
      const errorMessage = error instanceof Error && error.message.includes('fetch')
        ? 'Import failed due to browser security restrictions. For file:// testing, please use a local web server or load as a Chrome extension.'
        : 'Failed to import official results. Please try again.';
        
      toast.show(errorMessage, 'error');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[linear-gradient(180deg,#dbeafe_0%,#93c5fd_50%,#bfdbfe_100%)] dark:bg-[linear-gradient(180deg,#0f1d2d_0%,#1b2c44_50%,#0f1d2d_100%)]"
      style={{ minHeight: '100vh' }}
    >
      {/* Header Image - Slightly smaller */}
      <div className="flex justify-center  pb-2">
        <img 
          src={headerImageUrl}
          alt="AI Inspector" 
          className="h-auto block"
          style={{width: '90%', maxWidth: '500px'}}
        />
      </div>

      <div className="px-6 pb-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <p className="text-gray-800 dark:text-gray-200 text-sm font-semibold">
            Inspect AI outputs for truth, alignment, and governance quality using mathematical assessment.
          </p>
        </div>

        {/* App Cards Grid */}
        <div className="space-y-4 mb-8 flex flex-col items-center">
          {/* First Row - Gadgets and Challenges */}
          <div className="flex gap-9 justify-center">
            <AppCard
              icon="🛠️"
              title="Gadgets"
              description=""
              onClick={() => onNavigate('gadgets')}
            />
            <AppCard
              icon="📋"
              title="Challenges"
              description=""
              onClick={() => onNavigate('challenges')}
              badge={hasActiveSession ? `${activeSessions.length} active` : undefined}
            />
          </div>
          
          {/* Second Row - Journal and Insights */}
          <div className="flex gap-9 justify-center">
            <AppCard
              icon="📓"
              title="Journal"
              description=""
              onClick={() => onNavigate('journal')}
              badge={hasActiveSession ? `${activeSessions.length} active` : undefined}
            />
            <AppCard
              icon="💡"
              title="Insights"
              description=""
              onClick={() => onNavigate('insights')}
              badge={completedInsightsCount > 0 ? `${completedInsightsCount} insights` : undefined}
            />
          </div>
          
          {/* Third Row - Glossary and Settings */}
          <div className="flex gap-9 justify-center">
            <AppCard
              icon="📖"
              title="Glossary"
              description=""
              onClick={() => onNavigate('glossary')}
            />
            <AppCard
              icon="⚙️"
              title="Settings"
              description=""
              onClick={() => onNavigate('settings')}
            />
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="mb-6">
          <GlassCard hover onClick={handleToggleGuide}>
            <div className="font-semibold text-gray-900 dark:text-white flex items-center justify-between select-none p-4">
              <div className="flex items-center gap-2">
                <span>🚀</span>
                <span>Quick Start Guide</span>
              </div>
              <span className="text-gray-500 dark:text-gray-400">
                {isGuideOpen ? '▼' : '▶'}
              </span>
            </div>
            
            {isGuideOpen && (
              <div className="mt-3 space-y-3 text-sm p-4 pt-0" onClick={(e) => e.stopPropagation()}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-white/40 dark:bg-gray-800/60 rounded text-xs">
                    <div className="font-semibold text-blue-700 dark:text-blue-300 mb-0.5">📋 Challenges</div>
                    <div className="text-gray-600 dark:text-gray-300">Choose from 5 governance domains or create custom challenges</div>
                  </div>
                  <div className="p-2 bg-white/40 dark:bg-gray-800/60 rounded text-xs">
                    <div className="font-semibold text-purple-700 dark:text-purple-300 mb-0.5">📓 Journal</div>
                    <div className="text-gray-600 dark:text-gray-300">Manage sessions with 2 synthesis epochs (6 turns each)</div>
                  </div>
                  <div className="p-2 bg-white/40 dark:bg-gray-800/60 rounded text-xs">
                    <div className="font-semibold text-green-700 dark:text-green-300 mb-0.5">💡 Insights</div>
                    <div className="text-gray-600 dark:text-gray-300">Browse governance solutions generated by AI models</div>
                  </div>
                  <div className="p-2 bg-white/40 dark:bg-gray-800/60 rounded text-xs">
                    <div className="font-semibold text-red-700 dark:text-red-300 mb-0.5">🛠️ Gadgets</div>
                    <div className="text-gray-600 dark:text-gray-300">Quick AI assessment tools (Detector, Policy, Treatment)</div>
                  </div>
                </div>

                {/* Official Results Import */}
                <div className="p-3 bg-white/60 dark:bg-gray-800/90 rounded border border-blue-200 dark:border-blue-800">
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
                      className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
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
              </div>
            )}
          </GlassCard>
        </div>

        {/* Footer */}
          <div className="text-center">
            {/* GyroGovernance Stamp Logo - Bigger for text readability */}
            <div className="mb-3 flex justify-center">
              <img 
                src={typeof chrome !== 'undefined' && chrome.runtime?.getURL 
                  ? chrome.runtime.getURL('icons/gyrogovernance_stamp.png')
                  : 'icons/gyrogovernance_stamp.png'
                }
                alt="GyroGovernance" 
                className="h-24 w-auto opacity-60"
              />
            </div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 opacity-80">
              GYRO GOVERNANCE LAB
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 opacity-70">
            AI-Empowered Participatory Governance
            </p>
            <div className="flex gap-2 justify-center">
              <a 
                href="https://gyrogovernance.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded transition-colors duration-200 flex items-center gap-1"
              >
                <span>gyrogovernance.com</span>
              </a>
              <a 
                href="https://github.com/gyrogovernance/apps" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 text-xs font-medium rounded transition-colors duration-200 flex items-center gap-1"
              >
                <span>AI Inspector Repo</span>
              </a>
            </div>
          </div>
      </div>
    </div>
  );
};

export default WelcomeApp;