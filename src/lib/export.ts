// Export utilities for generating JSON, Markdown, and ZIP files

import { GovernanceInsight } from '../types';

/**
 * Generate JSON export
 */
export function exportAsJSON(insight: GovernanceInsight): string {
  return JSON.stringify(insight, null, 2);
}

/**
 * Generate Markdown export
 */
export function exportAsMarkdown(insight: GovernanceInsight): string {
  const md = `# ${insight.challenge.title}

**Generated**: ${new Date(insight.process.created_at).toLocaleString()}  
**Quality Index**: ${insight.quality.quality_index.toFixed(1)}% (${insight.quality.alignment_rate_category})  
**Superintelligence Index**: ${isNaN(insight.quality.superintelligence_index) ? 'N/A' : insight.quality.superintelligence_index.toFixed(2)} ${isNaN(insight.quality.si_deviation) ? '' : `(${insight.quality.si_deviation.toFixed(2)}× deviation)`}

## Challenge

**Type**: ${insight.challenge.type}  
**Domain**: ${insight.challenge.domain.join(', ')}

${insight.challenge.description}

## Insights

${insight.insights.combined_markdown}

### Summary

${insight.insights.summary}

### Participation

${insight.insights.participation}

### Preparation

${insight.insights.preparation}

### Provision

${insight.insights.provision}

## Quality Validation

### Structure Scores
- **Traceability**: ${insight.quality.structure_scores.traceability.toFixed(1)}/10
- **Variety**: ${insight.quality.structure_scores.variety.toFixed(1)}/10
- **Accountability**: ${insight.quality.structure_scores.accountability.toFixed(1)}/10
- **Integrity**: ${insight.quality.structure_scores.integrity.toFixed(1)}/10

**Average**: ${((insight.quality.structure_scores.traceability + insight.quality.structure_scores.variety + insight.quality.structure_scores.accountability + insight.quality.structure_scores.integrity) / 4).toFixed(1)}/10

### Behavior Scores
- **Truthfulness**: ${insight.quality.behavior_scores.truthfulness.toFixed(1)}/10
- **Completeness**: ${insight.quality.behavior_scores.completeness.toFixed(1)}/10
- **Groundedness**: ${insight.quality.behavior_scores.groundedness.toFixed(1)}/10
- **Literacy**: ${insight.quality.behavior_scores.literacy.toFixed(1)}/10
- **Comparison**: ${typeof insight.quality.behavior_scores.comparison === 'number' ? insight.quality.behavior_scores.comparison.toFixed(1) : 'N/A'}/10
- **Preference**: ${typeof insight.quality.behavior_scores.preference === 'number' ? insight.quality.behavior_scores.preference.toFixed(1) : 'N/A'}/10

### Specialization Scores
${Object.entries(insight.quality.specialization_scores).map(([key, value]) => `- **${key}**: ${value.toFixed(1)}/10`).join('\n')}

### Pathologies Detected

${insight.quality.pathologies.detected.length > 0 
  ? insight.quality.pathologies.detected.map(p => `- ${p}`).join('\n')
  : '_None detected_'}

**Frequency**: ${insight.quality.pathologies.frequency.toFixed(2)} (across epochs)

### Alignment Rate

**Rate**: ${insight.quality.alignment_rate.toFixed(4)}/min  
**Category**: ${insight.quality.alignment_rate_category}

## Process Metadata

- **Platform**: ${insight.process.platform}
- **Models Used**:
  - Synthesis Epoch 1: ${insight.process.models_used.synthesis_epoch1}
  - Synthesis Epoch 2: ${insight.process.models_used.synthesis_epoch2}
  - Analyst 1: ${insight.process.models_used.analyst1}
  - Analyst 2: ${insight.process.models_used.analyst2}
- **Duration**:
  - Epoch 1: ${insight.process.durations.epoch1_minutes} minutes
  - Epoch 2: ${insight.process.durations.epoch2_minutes} minutes
- **Schema Version**: ${insight.process.schema_version}

## Contribution

- **License**: ${insight.contribution.license}
- **Contributor**: ${insight.contribution.contributor}
- **Public**: ${insight.contribution.public ? 'Yes' : 'No'}

---

_Generated with AI-Empowered Governance Apps_
`;
  
  return md;
}

/**
 * Download a file to the user's computer
 */
export function downloadFile(filename: string, content: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate filename based on challenge title and timestamp
 */
export function generateFilename(title: string, extension: string): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .slice(0, 50);
  return `${cleanTitle}_${timestamp}.${extension}`;
}

/**
 * Generate GitHub contribution URL
 */
export function generateGitHubContributionURL(insight: GovernanceInsight): string {
  const domain = insight.challenge.domain[0]?.toLowerCase().replace(/\s+/g, '-') || 'custom';
  const timestamp = Date.now();
  const filename = `insight_${timestamp}.json`;
  const jsonContent = encodeURIComponent(exportAsJSON(insight));
  
  const baseURL = 'https://github.com/gyrogovernance/apps/new/main/insights';
  return `${baseURL}/${domain}?filename=${filename}&value=${jsonContent}`;
}

/**
 * Generate GitHub issue URL for contribution
 */
export function generateGitHubIssueURL(insight: GovernanceInsight): string {
  const title = encodeURIComponent(`[Contribution] ${insight.challenge.title}`);
  const body = encodeURIComponent(`# New Governance Insight

**Title**: ${insight.challenge.title}
**Type**: ${insight.challenge.type}
**Domain**: ${insight.challenge.domain.join(', ')}
**Quality Index**: ${insight.quality.quality_index.toFixed(1)}%

## JSON Data

\`\`\`json
${exportAsJSON(insight)}
\`\`\`

## Markdown Report

${exportAsMarkdown(insight)}
`);
  
  return `https://github.com/gyrogovernance/apps/issues/new?title=${title}&body=${body}`;
}

