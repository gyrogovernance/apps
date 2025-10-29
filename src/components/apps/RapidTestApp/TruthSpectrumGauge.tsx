// Behavioral Balance Gauge - SVG half-circle component showing SI visually
// Shows Superintelligence Index (SI) status based on thresholds
// SI >= 80: High (Green), SI >= 50: Moderate (Yellow), SI < 50: Review (Red), N/A: Gray

import React from 'react';
import GlassCard from '../../shared/GlassCard';

interface StructuralIntegrityGaugeProps {
  si: number | null; // Superintelligence Index, can be NaN
  size?: 'lg' | 'sm';
}

const StructuralIntegrityGauge: React.FC<StructuralIntegrityGaugeProps> = ({ si, size = 'lg' }) => {
  const isSmall = size === 'sm';
  const wrapperClass = isSmall ? 'w-32 h-32' : 'w-64 h-64';
  const innerClass = isSmall ? 'w-28 h-28' : 'w-48 h-48';
  const textClass = isSmall ? 'text-base' : 'text-lg';
  const subTextClass = isSmall ? 'text-xs' : 'text-xs';
  
  // Determine status and config based on SI value
  const getStatus = (): { status: string; config: { startColor: string; endColor: string; fillPercentage: number } } => {
    if (si === null || isNaN(si)) {
      return {
        status: 'N/A',
        config: {
          startColor: '#d1d5db', // Light gray
          endColor: '#6b7280',   // Dark gray
          fillPercentage: 0.1,    // 10% filled
        }
      };
    }
    
    if (si >= 80) {
      return {
        status: 'High',
        config: {
          startColor: '#dcfce7', // Very light green
          endColor: '#15803d',   // Dark green
          fillPercentage: 0.25,  // 25% filled for High (good)
        }
      };
    }
    
    if (si >= 50) {
      return {
        status: 'Mod',
        config: {
          startColor: '#fef3c7', // Very light yellow
          endColor: '#c2410c',   // Dark orange
          fillPercentage: 0.65,  // 65% filled for Moderate
        }
      };
    }
    
    // SI < 50
    return {
      status: 'Review',
      config: {
        startColor: '#fef2f2', // Very light red
        endColor: '#991b1b',   // Very dark red
        fillPercentage: 0.92,  // 92% filled for Review (needs attention)
      }
    };
  };

  const { status, config } = getStatus();
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (config.fillPercentage * circumference);
  const gradientId = `si-gradient-${status}`;
  
  return (
    <div className="flex justify-center">
      <GlassCard className={`${wrapperClass} rounded-full p-0 flex items-center justify-center`} variant="glassBlue" borderGradient="blue">
        <div className={`${innerClass} relative`}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Define gradient */}
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={config.startColor} stopOpacity="1" />
                <stop offset="20%" stopColor={config.startColor} stopOpacity="0.9" />
                <stop offset="50%" stopColor={config.endColor} stopOpacity="0.7" />
                <stop offset="80%" stopColor={config.endColor} stopOpacity="0.9" />
                <stop offset="100%" stopColor={config.endColor} stopOpacity="1" />
              </linearGradient>
            </defs>
            
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
              className="dark:stroke-gray-600"
            />
            {/* Progress arc with gradient and rounded ends */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 50 50)"
              style={{
                filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.15)) drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
              }}
            />
            {/* SI Value/Status Text */}
            <text
              x="50"
              y="50"
              textAnchor="middle"
              className={`${textClass} font-bold fill-gray-900 dark:fill-white`}
            >
              {si === null || isNaN(si) ? 'N/A' : si.toFixed(1)}
            </text>
            <text
              x="50"
              y="65"
              textAnchor="middle"
              className={`${subTextClass} font-medium fill-gray-500 dark:fill-gray-400`}
            >
              SI
            </text>
          </svg>
        </div>
      </GlassCard>
    </div>
  );
};

// Keep the old name for backwards compatibility but re-export as the new name
export default StructuralIntegrityGauge;
