import React from 'react';

interface AppCardProps {
  icon: string;
  title: string;
  description: string;
  badge?: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

const AppCard: React.FC<AppCardProps> = ({ 
  icon, 
  title, 
  description, 
  badge, 
  onClick, 
  disabled = false,
  className = ""
}) => (
  <div className={`flex flex-col items-center ${className}`} style={{width: '120px'}}>
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative bg-white/15 dark:bg-white/10 
                 hover:scale-105 hover:-translate-y-1 hover:bg-white/25 dark:hover:bg-white/8
                 transition-all duration-300 disabled:opacity-50 
                 disabled:cursor-not-allowed group flex items-center justify-center
                 border-2 border-white/60 dark:border-white/40"
      style={{
        width: '120px',
        height: '120px',
        borderRadius: '32px',
        // Sharp inner highlights - adjusted for both light and dark
        boxShadow: `
          0 12px 24px rgba(0, 0, 0, 0.2),
          inset 0 8px 16px -4px rgba(255, 255, 255, 0.7),
          inset 0 -6px 12px -3px rgba(0, 0, 0, 0.2),
          inset 0 0 0 1px rgba(255, 255, 255, 0.5)
        `,
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `
          0 16px 40px rgba(0, 0, 0, 0.28),
          inset 0 8px 16px -4px rgba(255, 255, 255, 0.9),
          inset 0 -8px 16px -4px rgba(0, 0, 0, 0.3),
          inset 0 0 0 1px rgba(255, 255, 255, 0.5)
        `;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `
          0 12px 28px rgba(0, 0, 0, 0.18),
          inset 0 8px 16px -4px rgba(255, 255, 255, 0.8),
          inset 0 -8px 16px -4px rgba(0, 0, 0, 0.25),
          inset 0 0 0 1px rgba(255, 255, 255, 0.4)
        `;
      }}
    >
      <div className="text-6xl transition-transform group-hover:scale-110 duration-300 flex items-center justify-center">{icon}</div>
      {badge && (
        <span className="absolute top-3 right-3 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
          {badge}
        </span>
      )}
    </button>
    <h3 className="mt-2 text-base font-semibold text-gray-900 dark:text-white text-center">
      {title}
    </h3>
    {description && (
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 text-center">{description}</p>
    )}
  </div>
);

export default AppCard;

