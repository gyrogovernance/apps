// Truth Spectrum Gauge - SVG half-circle component showing DRS visually
// 0° (left) = Green = Low risk, 90° (top) = Yellow = Moderate, 180° (right) = Red = High risk

import React from 'react';
import GlassCard from '../../shared/GlassCard';

interface TruthSpectrumGaugeProps {
  drs: {
    score: number;
    category: 'LOW' | 'MODERATE' | 'HIGH';
    factors: Record<string, number>;
  };
  size?: 'lg' | 'sm';
}

const TruthSpectrumGauge: React.FC<TruthSpectrumGaugeProps> = ({ drs, size = 'lg' }) => {
  const isSmall = size === 'sm';
  const wrapperClass = isSmall ? 'w-32 h-32' : 'w-64 h-64';
  const innerClass = isSmall ? 'w-28 h-28' : 'w-48 h-48';
  const textClass = isSmall ? 'text-base' : 'text-lg';
  const subTextClass = isSmall ? 'text-xs' : 'text-xs';
  // Get colors and fill percentage based on risk category
  const getGaugeConfig = (category: string) => {
    switch (category) {
      case 'LOW': 
        return { 
          startColor: '#dcfce7', // Very light green (almost white)
          endColor: '#15803d',   // Dark green
          fillPercentage: 0.25, // 25% filled for LOW
        };
      case 'MODERATE': 
        return { 
          startColor: '#fef3c7', // Very light yellow (almost white)
          endColor: '#c2410c',   // Dark orange
          fillPercentage: 0.65, // 65% filled for MODERATE
        };
      case 'HIGH': 
        return { 
          startColor: '#fef2f2', // Very light red (almost white)
          endColor: '#991b1b',   // Very dark red
          fillPercentage: 0.92, // 92% filled for HIGH (leaves more gap for rounded end)
        };
      default: 
        return { 
          startColor: '#d1d5db', // Light gray
          endColor: '#6b7280',   // Dark gray
          fillPercentage: 0.1,
        };
    }
  };

  const config = getGaugeConfig(drs.category);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (config.fillPercentage * circumference);
  
  return (
    <div className="flex justify-center">
      <GlassCard className={`${wrapperClass} rounded-full p-0 flex items-center justify-center`} variant="glassBlue" borderGradient="blue">
        <div className={`${innerClass} relative`}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Define gradient - dramatic transition from very light to very dark */}
            <defs>
              <linearGradient id={`gradient-${drs.category}`} x1="0%" y1="0%" x2="100%" y2="100%">
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
              stroke={`url(#gradient-${drs.category})`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 50 50)"
              style={{
                filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.15)) drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
              }}
            />
            {/* Risk Level Text */}
            <text
              x="50"
              y="50"
              textAnchor="middle"
              className={`${textClass} font-bold fill-gray-900 dark:fill-white`}
            >
              {drs.category}
            </text>
            <text
              x="50"
              y="65"
              textAnchor="middle"
              className={`${subTextClass} font-medium fill-gray-500 dark:fill-gray-400`}
            >
              RISK
            </text>
          </svg>
        </div>
      </GlassCard>
    </div>
  );
};

export default TruthSpectrumGauge;
