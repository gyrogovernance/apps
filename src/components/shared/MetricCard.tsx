import React from 'react';
import { MetricDefinition } from '../../lib/metric-definitions';

interface MetricCardProps {
  label: string;
  value: string | number;
  valueColor?: string;
  definition: MetricDefinition;
  compact?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  label, 
  value, 
  valueColor = 'text-gray-900 dark:text-gray-100',
  definition,
  compact = false
}) => {
  return (
    <div className={`${compact ? 'p-3' : 'p-4'} bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-0.5 capitalize">
            {label}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {definition.shortDesc}
          </div>
        </div>
        <div className={`text-2xl font-bold ml-3 ${valueColor}`}>
          {typeof value === 'number' ? value.toFixed(1) : value}
        </div>
      </div>
      
      <details className="mt-2">
        <summary className="cursor-pointer text-xs text-blue-600 dark:text-blue-400 hover:underline">
          Learn more
        </summary>
        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line">
          {definition.fullDesc}
          {definition.formula && (
            <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600 font-mono text-xs">
              <strong>Formula:</strong> {definition.formula}
            </div>
          )}
          {definition.range && (
            <div className="mt-1 text-gray-600 dark:text-gray-400">
              <strong>Range:</strong> {definition.range}
            </div>
          )}
        </div>
      </details>
    </div>
  );
};

interface MetricSectionHeaderProps {
  title: string;
  definition: MetricDefinition;
  emoji?: string;
}

export const MetricSectionHeader: React.FC<MetricSectionHeaderProps> = ({ 
  title, 
  definition,
  emoji
}) => {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        {emoji && <span className="text-lg">{emoji}</span>}
        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h4>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        {definition.shortDesc}
      </p>
      <details className="text-xs">
        <summary className="cursor-pointer text-blue-600 dark:text-blue-400 hover:underline mb-1">
          About {title}
        </summary>
        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded text-gray-700 dark:text-gray-300 whitespace-pre-line">
          {definition.fullDesc}
        </div>
      </details>
    </div>
  );
};

