import React, { useState, useEffect } from 'react';
import { useToast } from '../shared/Toast';
import { useConfirm } from '../shared/Modal';
import { chromeAPI } from '../../lib/chrome-mock';
import { importGyroDiagnostics } from '../../lib/import';
import { insights as insightsStorage } from '../../lib/storage';
import { applyTheme, type ThemeMode } from '../../lib/theme-utils';
import GlassCard from '../shared/GlassCard';

interface Settings {
  autoSaveDrafts: boolean;
  darkMode: ThemeMode;
  defaultPlatform: string;
}

const DEFAULT_SETTINGS: Settings = {
  autoSaveDrafts: true,
  darkMode: 'auto',
  defaultPlatform: 'custom'
};

export const SettingsApp: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const toast = useToast();
  const { confirm, ConfirmModal } = useConfirm();

  // Scroll to top when settings app loads
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

  useEffect(() => {
    // Load settings from storage
    chromeAPI.storage.local.get('app_settings').then((result) => {
      if (result.app_settings) {
        const loadedSettings = { ...DEFAULT_SETTINGS, ...result.app_settings };
        setSettings(loadedSettings);
        // Apply the loaded theme immediately
        applyTheme(loadedSettings.darkMode);
      }
    });
  }, []);

  const updateSetting = async (key: keyof Settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await chromeAPI.storage.local.set({ app_settings: newSettings });
    
    // Apply theme changes immediately
    if (key === 'darkMode') {
      applyTheme(value as ThemeMode);
    }
    
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
      try {
        // Clear ALL storage keys including schema version
        await chromeAPI.storage.local.clear();
        setSettings(DEFAULT_SETTINGS);
        toast.show('All data cleared successfully', 'success');
        
        // Force page reload to reset all state
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error('Clear data failed:', error);
        toast.show('Failed to clear data', 'error');
      }
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
        <GlassCard className="p-5" borderGradient="blue">
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
        </GlassCard>

        {/* Theme Selection */}
        <GlassCard className="p-5" borderGradient="purple">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                🎨 Theme
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Choose your preferred color scheme
              </p>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value="auto"
                    checked={settings.darkMode === 'auto'}
                    onChange={(e) => updateSetting('darkMode', e.target.value)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      System Defined
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Follow your system's dark/light mode setting
                    </div>
                  </div>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={settings.darkMode === 'light'}
                    onChange={(e) => updateSetting('darkMode', e.target.value)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Light Mode
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Always use light theme
                    </div>
                  </div>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={settings.darkMode === 'dark'}
                    onChange={(e) => updateSetting('darkMode', e.target.value)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Dark Mode
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Always use dark theme
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </GlassCard>


        {/* Data Management */}
        <GlassCard className="p-5">
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
        </GlassCard>

        {/* About */}
        <GlassCard className="p-5" variant="glassBlue" borderGradient="blue">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            📖 About
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            AI-Empowered Governance Apps
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Open-source Apps for generating qualitative governance insights through AI-empowered processes.

            All insights are contributed to the public domain under CC0 license.

            Made by <a 
              href="https://gyrogovernance.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Gyro Governance
            </a> - Powered by <a 
              href="https://github.com/gyrogovernance/diagnostics" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              GyroDiagnostics
            </a>.
          </p>
        </GlassCard>
      </div>

      {ConfirmModal}
    </div>
  );
};

