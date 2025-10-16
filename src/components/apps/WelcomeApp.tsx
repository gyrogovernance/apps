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
  const activeSessions = state.sessions.filter(s => s.status === 'active' || s.status === 'paused');
  const completedInsightsCount = state.sessions.filter(s => s.status === 'complete').length;
  const hasActiveSession = activeSessions.length > 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          🌍 AI-Empowered Governance
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
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
        />
        <AppCard
          icon="📓"
          title="Journal"
          description="Active synthesis sessions with structured evaluation"
          badge={hasActiveSession ? `${activeSessions.length} Active` : undefined}
          onClick={() => onNavigate('journal')}
        />
        <AppCard
          icon="💡"
          title="Insights"
          description="Browse, organize, and share completed evaluations"
          badge={completedInsightsCount > 0 ? `${completedInsightsCount}` : undefined}
          onClick={() => onNavigate('insights')}
        />
        <AppCard
          icon="⚙️"
          title="Settings"
          description="Preferences, templates, and configuration"
          onClick={() => onNavigate('settings')}
        />
      </div>

      {/* Quick Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Quick Start</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            onClick={onQuickStart}
          >
            <span>🚀</span>
            <span>New Evaluation</span>
          </button>
          {hasActiveSession && (
            <button 
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              onClick={onResume}
            >
              <span>▶️</span>
              <span>Resume Session</span>
            </button>
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

