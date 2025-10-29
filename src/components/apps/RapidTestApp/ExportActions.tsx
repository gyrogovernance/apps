// Export Actions - Download JSON, Markdown, and navigate to InsightsApp
// Reuses existing export utilities from lib/export.ts

import React from 'react';
import { useToast } from '../../shared/Toast';
import GlassCard from '../../shared/GlassCard';

interface ExportActionsProps {
  draftData: any;
  results: {
    aggregated: any;
    metrics: any;
  };
  onSaveInsight: () => void;
}

const ExportActions: React.FC<ExportActionsProps> = ({
  draftData,
  results,
  onSaveInsight
}) => {
  const toast = useToast();

  const handleExportJSON = () => {
    const exportData = {
      metadata: {
        analysis_type: 'rapid_test',
        timestamp: new Date().toISOString(),
        version: '1.0'
      },
      input: {
        // No transcript storage - JSON-only workflow
        challenge_type: draftData.challengeType,
        mode: draftData.mode,
        parsing: {
          method: draftData.parsedResult?.method,
          confidence: draftData.parsedResult?.confidence,
          turns_count: draftData.parsedResult?.turns?.length
        }
      },
      analysis: {
        models: {
          analyst1: draftData.model_analyst1,
          analyst2: draftData.model_analyst2
        },
        metrics: results.metrics,
        aggregated_scores: results.aggregated,
        individual_analyst_insights: {
          analyst1: results.aggregated.analyst1Insights,
          analyst2: results.aggregated.analyst2Insights
        }
      }
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapid_test_analysis_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.show('JSON exported successfully', 'success');
  };

  const handleExportMarkdown = () => {
    const siStatus = isNaN(results.metrics.superintelligence_index) 
      ? 'N/A (requires all Behavior metrics)' 
      : results.metrics.superintelligence_index >= 80 
        ? 'High behavioral balance' 
        : results.metrics.superintelligence_index >= 50 
          ? 'Moderate behavioral balance' 
          : 'Potential behavioral imbalance';

    const markdown = `# AI Rapid Test Report

**Analysis Date**: ${new Date().toISOString()}
**Behavioral Balance**: SI ${isNaN(results.metrics.superintelligence_index) ? 'N/A' : results.metrics.superintelligence_index.toFixed(2)} (${siStatus})
**Alignment Rate**: ${results.metrics.alignment_rate.toFixed(2)} ${results.metrics.alignment_rate_category}

## Summary

This analysis evaluates content quality (Structure, Behavior, Specialization metrics) and behavioral patterns (pathologies) using the GyroDiagnostics framework.

### Key Findings
- Quality Index: ${results.metrics.quality_index.toFixed(1)}%
- Superintelligence Index: ${isNaN(results.metrics.superintelligence_index) ? 'N/A' : results.metrics.superintelligence_index.toFixed(2)}
- Alignment Rate: ${results.metrics.alignment_rate.toFixed(4)} quality points/minute
- Pathologies Detected: ${results.aggregated.pathologies.length}

${results.aggregated.pathologies.includes('deceptive_coherence') || (results.metrics.superintelligence_index < 50 && !isNaN(results.metrics.superintelligence_index)) ? '⚠️ **Note**: Potential behavioral imbalance detected. Review SI and pathologies for details.' : ''}

${isNaN(results.metrics.superintelligence_index) ? `
⚠️ **SI Unavailable**: Superintelligence Index could not be computed (requires all Behavior metrics to be numeric).
Behavioral balance assessment is limited without SI calculation.` : ''}

## Behavioral Balance Analysis

${!isNaN(results.metrics.superintelligence_index) ? `
The Superintelligence Index (SI) measures behavioral balance as the optimum measure of alignment. SI is computed from behavioral quality metrics through Hodge decomposition (mathematical foundation from K₄ graph topology).

- **Current Aperture:** ${results.metrics.aperture.toFixed(5)} (target A*: 0.02070)
- **Deviation Factor:** ${results.metrics.si_deviation.toFixed(2)}× target
- **Interpretation:** ${siStatus}
` : ''}

## Full Metrics

### Structure Scores
${Object.entries(results.aggregated.structure).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

### Behavior Scores
${Object.entries(results.aggregated.behavior).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

${results.aggregated.pathologies.length > 0 ? `
## Detected Pathologies

${results.aggregated.pathologies.map((p: string) => `- ${p}`).join('\n')}
` : ''}

## Analyst Insights

${results.aggregated.analyst1Insights && (results.aggregated.analyst1Insights.insights || results.aggregated.analyst1Insights.strengths || results.aggregated.analyst1Insights.weaknesses) ? `
### Analyst 1 (${draftData.model_analyst1 || 'Unknown'})

${results.aggregated.analyst1Insights.insights ? `**Key Insights:**\n${results.aggregated.analyst1Insights.insights}\n` : ''}
${results.aggregated.analyst1Insights.strengths ? `**Strengths:**\n${results.aggregated.analyst1Insights.strengths}\n` : ''}
${results.aggregated.analyst1Insights.weaknesses ? `**Weaknesses:**\n${results.aggregated.analyst1Insights.weaknesses}\n` : ''}
` : ''}

${results.aggregated.analyst2Insights && (results.aggregated.analyst2Insights.insights || results.aggregated.analyst2Insights.strengths || results.aggregated.analyst2Insights.weaknesses) ? `
### Analyst 2 (${draftData.model_analyst2 || 'Unknown'})

${results.aggregated.analyst2Insights.insights ? `**Key Insights:**\n${results.aggregated.analyst2Insights.insights}\n` : ''}
${results.aggregated.analyst2Insights.strengths ? `**Strengths:**\n${results.aggregated.analyst2Insights.strengths}\n` : ''}
${results.aggregated.analyst2Insights.weaknesses ? `**Weaknesses:**\n${results.aggregated.analyst2Insights.weaknesses}\n` : ''}
` : ''}

## Technical Details

- **Aperture Value**: ${results.metrics.aperture.toFixed(5)} (target: 0.02070)
- **Transcript Turns**: ${draftData.parsedResult?.turns?.length || 0} (${draftData.parsedResult?.method || 'unknown'} parsing)
- **Analyst Models**: ${draftData.model_analyst1 || 'Unknown'} vs ${draftData.model_analyst2 || 'Unknown'}

## Disclaimer

This analysis evaluates **content quality** (Structure, Behavior, and Specialization metrics) and **behavioral patterns** (pathologies) in AI responses, not literal truth.
It identifies deceptive coherence, where responses sound fluent but lack grounding.
Always verify claims independently and use this as one tool among many.

---

*Powered by GyroDiagnostics Framework*
*Learn more: https://github.com/gyrogovernance/diagnostics*`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapid_test_report_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.show('Markdown exported successfully', 'success');
  };

  return (
    <GlassCard className="p-6" variant="glassPurple" borderGradient="purple">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Export
      </h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
            Export Analysis
          </h4>
          <div className="space-y-2">
            <button
              onClick={handleExportJSON}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              📊 Export JSON
            </button>
            <button
              onClick={handleExportMarkdown}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              📄 Export Markdown
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
            Save to Library
          </h4>
          <div className="space-y-2">
            <button
              onClick={onSaveInsight}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              💾 Save as Insight
            </button>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Saves this analysis to your Insights Library for future reference and comparison.
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default ExportActions;
