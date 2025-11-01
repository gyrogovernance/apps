import React from 'react';
import { SmartTooltip } from './SmartTooltip';

type AlignmentCategory = 'VALID' | 'SUPERFICIAL' | 'SLOW';

interface CoreMetricsRingsProps {
  qi: number;                 // 0-100
  si: number | null;          // 0-100 or null/NaN
  arCategory: AlignmentCategory;
  arRate?: number;            // for ring fill reference (0-0.15+), optional
  size?: 'sm' | 'md';         // ring size
}

const CIRCUMFERENCE = 2 * Math.PI * 20; // r=20 as used elsewhere (≈125.66)

export const CoreMetricsRings: React.FC<CoreMetricsRingsProps> = ({
  qi,
  si,
  arCategory,
  arRate,
  size = 'sm',
}) => {
  const svgSize = 48;
  const ringWidth = 3.5;
  const wrapperClass = 'flex flex-col items-center';
  const twoLineLabel = (top: string, bottom: string) => (
    <div className="text-[10px] leading-tight text-gray-600 dark:text-gray-400 mt-1 font-medium text-center">
      <div>{top}</div>
      <div>{bottom}</div>
    </div>
  );

  return (
    <div className={`flex items-center justify-center ${size === 'md' ? 'gap-6' : 'gap-5'}`}>
      {/* QI Ring */}
      <div className={wrapperClass}>
        <div className="relative">
          <svg width={svgSize} height={svgSize} className="transform -rotate-90">
            <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth={ringWidth} className="text-gray-200 dark:text-gray-700" />
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth={ringWidth}
              strokeDasharray={`${(Math.max(0, Math.min(qi, 100)) / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              strokeLinecap="round"
              className={qi >= 80 ? 'text-green-500' : qi >= 60 ? 'text-yellow-500' : qi >= 40 ? 'text-orange-500' : 'text-red-500'}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-base font-bold text-gray-700 dark:text-gray-300">
              {Math.round(qi)}
            </span>
          </div>
        </div>
        <div className="text-gray-500 dark:text-gray-400 text-[10px] mb-0.5">
          <SmartTooltip term="QI"><span className="cursor-help">QI</span></SmartTooltip>
        </div>
        {twoLineLabel('Quality', 'Index')}
      </div>

      {/* SI Ring */}
      <div className={wrapperClass}>
        <div className="relative">
          <svg width={svgSize} height={svgSize} className="transform -rotate-90">
            <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth={ringWidth} className="text-gray-200 dark:text-gray-700" />
            {!isNaN(si as any) && si !== null && (
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth={ringWidth}
                strokeDasharray={`${Math.min((Math.max(0, Math.min(si as number, 100)) / 100) * CIRCUMFERENCE, CIRCUMFERENCE)} ${CIRCUMFERENCE}`}
                strokeLinecap="round"
                className={(si as number) >= 80 ? 'text-green-500' : (si as number) >= 50 ? 'text-yellow-500' : 'text-red-500'}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-base font-bold text-gray-700 dark:text-gray-300">
              {si == null || isNaN(si as any) ? '-' : (si as number).toFixed(1)}
            </span>
          </div>
        </div>
        <div className="text-gray-500 dark:text-gray-400 text-[10px] mb-0.5">
          <SmartTooltip term="SI"><span className="cursor-help">SI</span></SmartTooltip>
        </div>
        {twoLineLabel('Superintelligence', 'Index')}
      </div>

      {/* AR Ring */}
      <div className={wrapperClass}>
        <div className="relative">
          <svg width={svgSize} height={svgSize} className="transform -rotate-90">
            <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth={ringWidth} className="text-gray-200 dark:text-gray-700" />
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth={ringWidth}
              strokeDasharray={`${Math.min((((arRate ?? 0) / 0.15) * CIRCUMFERENCE), CIRCUMFERENCE)} ${CIRCUMFERENCE}`}
              strokeLinecap="round"
              className={
                arCategory === 'VALID'
                  ? 'text-green-500'
                  : arCategory === 'SUPERFICIAL'
                  ? 'text-yellow-500'
                  : 'text-red-500'
              }
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
              arCategory === 'VALID'
                ? 'text-green-600 dark:text-green-400'
                : arCategory === 'SUPERFICIAL'
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {arCategory === 'VALID' ? 'V' : arCategory === 'SUPERFICIAL' ? 'S' : 'L'}
            </span>
          </div>
        </div>
        <div className="text-gray-500 dark:text-gray-400 text-[10px] mb-0.5">
          <SmartTooltip term="AR"><span className="cursor-help">AR</span></SmartTooltip>
        </div>
        {twoLineLabel('Alignment', 'Rate')}
      </div>
    </div>
  );
};

export default CoreMetricsRings;


