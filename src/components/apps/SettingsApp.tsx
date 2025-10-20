import React, { useState, useEffect } from 'react';
import { useToast } from '../shared/Toast';
import { useConfirm } from '../shared/Modal';
import { chromeAPI } from '../../lib/chrome-mock';
import { importGyroDiagnostics } from '../../lib/import';
import { insights as insightsStorage } from '../../lib/storage';

interface Settings {
  autoSaveDrafts: boolean;
  darkMode: 'auto' | 'light' | 'dark';
  defaultPlatform: string;
  showKeyboardShortcuts: boolean;
}

const DEFAULT_SETTINGS: Settings = {
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
        const modelName = insight.process?.models_used?.synthesis_epoch1
                       || insight.process?.models_used?.synthesis_epoch2
                       || insight.metadata?.model_name
                       || 'Unknown Model';
        const challengeType = insight.challenge?.type || insight.metadata?.challenge_type || 'custom';
        
        if (!modelData[modelName]) {
          modelData[modelName] = {};
        }
        
        // Build pathology counts from detected names
        const counts: Record<string, number> = {};
        (insight.quality?.pathologies?.detected || []).forEach((p: string) => {
          counts[p] = (counts[p] || 0) + 1;
        });
        
        const qiNorm = (insight.quality?.quality_index || 0) / 100;
        const d1 = insight.process?.durations?.epoch1_minutes || 0;
        const d2 = insight.process?.durations?.epoch2_minutes || 0;
        const medianDuration = [d1, d2].sort((a: number, b: number) => a - b)[Math.floor([d1, d2].length / 2)];
        
        // Create GyroDiagnostics challenge structure
        modelData[modelName][challengeType] = {
          challenge_type: challengeType,
          task_name: `${challengeType}_challenge`,
          median_quality_index: qiNorm,
          median_duration_minutes: medianDuration,
          alignment_rate: insight.quality?.alignment_rate || 0,
          alignment_rate_status: insight.quality?.alignment_rate_category || 'SLOW',
          superintelligence_stats: {
            median_superintelligence_index: insight.quality?.superintelligence_index ?? NaN,
            median_deviation_factor: insight.quality?.si_deviation ?? NaN,
            target_aperture: 0.020701
          },
          pathology_counts: counts,
          epochs_analyzed: insight.metadata?.epochs_analyzed || 2,
          epoch_results: [
            {
              structure_scores: insight.quality?.structure_scores || {},
              behavior_scores: insight.quality?.behavior_scores || {},
              specialization_scores: insight.quality?.specialization_scores || {},
              pathologies: insight.quality?.pathologies?.detected || [],
              insights: insight.insights?.combined_markdown || '',
              analyst_count: 2
            }
          ]
        };
      });
      
      // Export each model as a separate file
      for (const [modelName, data] of Object.entries(modelData)) {
        if (!modelName) continue; // Skip undefined model names
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = (modelName || 'unknown_model').toLowerCase().replace(/\s+/g, '_');
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
            AI-Empowered Governance Apps v0.2.1
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

