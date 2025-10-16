import React from 'react';

interface Stage {
  id: string;
  icon: string;
  label: string;
  status: 'complete' | 'active' | 'pending';
}

interface JourneyMapProps {
  stages: Stage[];
  compact?: boolean;
}

export const JourneyMap: React.FC<JourneyMapProps> = ({ stages, compact = false }) => {
  return (
    <div className={`flex items-center ${compact ? 'gap-1' : 'gap-3'} overflow-x-auto pb-2`}>
      {stages.map((stage, index) => (
        <React.Fragment key={stage.id}>
          {/* Stage Icon */}
          <div className="flex flex-col items-center min-w-fit">
            <div className={`
              ${compact ? 'w-8 h-8 text-base' : 'w-12 h-12 text-xl'}
              rounded-full flex items-center justify-center font-semibold transition-all
              ${stage.status === 'complete' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-2 border-green-500' : ''}
              ${stage.status === 'active' ? 'bg-blue-600 text-white scale-110 shadow-lg ring-4 ring-blue-200 dark:ring-blue-800' : ''}
              ${stage.status === 'pending' ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 border-2 border-gray-300 dark:border-gray-600' : ''}
            `}>
              {stage.status === 'complete' ? '✓' : stage.icon}
            </div>
            {!compact && (
              <span className={`
                text-xs mt-1.5 font-medium max-w-[60px] text-center
                ${stage.status === 'active' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-400'}
              `}>
                {stage.label}
              </span>
            )}
          </div>
          
          {/* Connector */}
          {index < stages.length - 1 && (
            <div className={`
              ${compact ? 'w-4 h-0.5' : 'w-8 h-1'}
              ${stages[index + 1].status !== 'pending' ? 'bg-gradient-to-r from-blue-600 to-green-500' : 'bg-gray-300 dark:bg-gray-600'}
              transition-all rounded-full
            `} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

