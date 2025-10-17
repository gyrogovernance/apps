import React, { useState, useEffect } from 'react';
import { useToast } from '../shared/Toast';
import { useConfirm } from '../shared/Modal';
import { chromeAPI } from '../../lib/chrome-mock';
import { importGyroDiagnostics } from '../../lib/import';
import { insights as insightsStorage } from '../../lib/storage';

interface Settings {
  clipboardMonitoring: boolean;
  autoSaveDrafts: boolean;
  darkMode: 'auto' | 'light' | 'dark';
  defaultPlatform: string;
  showKeyboardShortcuts: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  clipboardMonitoring: true,
  autoSaveDrafts: true,
  darkMode: 'auto',
  defaultPlatform: 'custom',
  showKeyboardShortcuts: true
};

export const SettingsApp: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const toast = useToast();
  const { confirm, ConfirmModal } = useConfirm();

  useEffect(() => {
    // Load settings from storage
    chromeAPI.storage.local.get('app_settings').then((result) => {
      if (result.app_settings) {
        setSettings({ ...DEFAULT_SETTINGS, ...result.app_settings });
      }
    });
  }, []);

  const updateSetting = async (key: keyof Settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await chromeAPI.storage.local.set({ app_settings: newSettings });
    toast.show('Settings saved', 'success');
  };

  const handleExportData = async () => {
    try {
      const allData = await chromeAPI.storage.local.get();
      const json = JSON.stringify(allData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gyro_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.show('Data exported successfully', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      toast.show('Failed to export data', 'error');
    }
  };

  const handleExportInsights = async () => {
    try {
      const result = await chromeAPI.storage.local.get('insights_library');
      const insights = result.insights_library || [];
      
      // Group insights by model name and challenge type to create GyroDiagnostics format
      const modelData: any = {};
      
      insights.forEach((insight: any) => {
        const modelName = insight.metadata?.model_name || 'Unknown Model';
        const challengeType = insight.metadata?.challenge_type || insight.challenge?.type || 'unknown';
        
        if (!modelData[modelName]) {
          modelData[modelName] = {};
        }
        
        // Create GyroDiagnostics challenge structure
        modelData[modelName][challengeType] = {
          challenge_type: challengeType,
          task_name: `${challengeType}_challenge`,
          median_quality_index: insight.quality.quality_index / 100,
          alignment_rate: insight.quality.alignment_rate,
          alignment_rate_status: insight.quality.alignment_rate_category,
          superintelligence_stats: {
            median_superintelligence_index: insight.quality.superintelligence_index,
            median_deviation_factor: insight.quality.si_deviation,
            target_aperture: 0.020701
          },
          median_duration_minutes: insight.quality.duration_minutes,
          pathology_counts: insight.pathology_frequency || {},
          epochs_analyzed: insight.metadata?.epochs_analyzed || 2,
          epoch_results: [
            {
              structure_scores: insight.structure_scores,
              behavior_scores: insight.behavior_scores,
              specialization_scores: insight.specialization_scores,
              pathologies: insight.pathologies || [],
              insights: insight.insights || '',
              analyst_count: 2
            }
          ]
        };
      });
      
      // Export each model as a separate file
      for (const [modelName, data] of Object.entries(modelData)) {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = modelName.toLowerCase().replace(/\s+/g, '_');
        a.download = `${filename}_analysis_data.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
      
      toast.show(`Exported data for ${Object.keys(modelData).length} model(s)`, 'success');
    } catch (error) {
      console.error('Export insights failed:', error);
      toast.show('Failed to export insights', 'error');
    }
  };

  const handleImportGyroDiagnostics = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.zip';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const result = await importGyroDiagnostics(file);
        
        if (!result.success) {
          toast.show(result.error || 'Import failed', 'error');
          return;
        }

        // Add insights to storage
        const insights = result.insights!;
        for (const insight of insights) {
          await insightsStorage.save(insight);
        }
        
        // Show detailed message for ZIP files
        if (file.name.toLowerCase().endsWith('.zip')) {
          const message = `Imported ${insights.length} insight(s) from ${result.filesProcessed}/${result.filesFound} file(s) in ${file.name}`;
          toast.show(message, 'success');
        } else {
          toast.show(`Imported ${insights.length} insight(s) from ${file.name}`, 'success');
        }
      } catch (error) {
        console.error('Import failed:', error);
        toast.show('Failed to import file. Please check the format.', 'error');
      }
    };
    input.click();
  };

  const handleClearAllData = async () => {
    const confirmed = await confirm(
      'Clear All Data?',
      'This will permanently delete all sessions, insights, drafts, and settings. This action cannot be undone.',
      { destructive: true, confirmText: 'Clear Everything' }
    );

    if (confirmed) {
      await chromeAPI.storage.local.clear();
      setSettings(DEFAULT_SETTINGS);
      toast.show('All data cleared', 'info');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          ⚙️ Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your AI-Empowered Governance experience
        </p>
      </div>

      <div className="space-y-6">
        {/* Smart Paste Detection */}
        <div className="p-5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Smart Paste Detection (Experimental)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Automatically detect when you copy AI responses or analyst JSON from your clipboard
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                ⚠️ Requires clipboard read permission. May not work in all browsers.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={settings.clipboardMonitoring}
                onChange={(e) => updateSetting('clipboardMonitoring', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Auto-save Drafts */}
        <div className="p-5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Auto-save Drafts
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatically save your work as you type to prevent data loss
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={settings.autoSaveDrafts}
                onChange={(e) => updateSetting('autoSaveDrafts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="p-5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            ⌨️ Keyboard Shortcuts
          </h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Go to Challenges</span>
              <kbd className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded font-mono text-xs">
                Cmd/Ctrl + N
              </kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Go to Journal</span>
              <kbd className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded font-mono text-xs">
                Cmd/Ctrl + J
              </kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Go to Insights</span>
              <kbd className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded font-mono text-xs">
                Cmd/Ctrl + I
              </kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Go to Home</span>
              <kbd className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded font-mono text-xs">
                Cmd/Ctrl + H
              </kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Show Help</span>
              <kbd className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded font-mono text-xs">
                Cmd/Ctrl + /
              </kbd>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="p-5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            💾 Data Management
          </h3>
          <div className="space-y-3">
            <button 
              onClick={handleImportGyroDiagnostics}
              className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <span>📤</span>
              <span>Import GyroDiagnostics (JSON/ZIP)</span>
            </button>
            <button 
              onClick={handleExportInsights}
              className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <span>📥</span>
              <span>Export GyroDiagnostics JSON</span>
            </button>
            <button 
              onClick={handleExportData}
              className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <span>📥</span>
              <span>Export All Data (Full Backup)</span>
            </button>
            <button 
              onClick={handleClearAllData}
              className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <span>🗑️</span>
              <span>Clear All Data</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            💡 Tip: Import JSON files (e.g., model_analysis_data.json) or ZIP archives containing multiple *data.json files
          </p>
        </div>

        {/* About */}
        <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            📖 About GyroDiagnostics
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            AI-Empowered Governance Apps v0.1.1
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Open-source framework for evaluating AI models through structured governance challenges.
            All insights are contributed to the public domain under CC0 license.
          </p>
        </div>
      </div>

      {ConfirmModal}
    </div>
  );
};

