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
  <button
    onClick={onClick}
    disabled={disabled}
    className={`relative p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 
               hover:border-blue-500 hover:shadow-lg transition-all duration-200 disabled:opacity-50 
               disabled:cursor-not-allowed text-left w-full group ${className}`}
  >
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
      {title}
    </h3>
    <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    {badge && (
      <span className="absolute top-4 right-4 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
        {badge}
      </span>
    )}
  </button>
);

export default AppCard;

