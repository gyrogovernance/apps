import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  variant?: 'neutral' | 'glassBlue' | 'glassPurple' | 'glassGreen';
  density?: 'default' | 'dense';
  borderGradient?: 'blue' | 'purple' | 'green' | 'pink';
}

/**
 * Reusable glass morphism card component
 * Automatically adjusts for light/dark mode:
 * - Light mode: lighter background, subtle borders
 * - Dark mode: darker background with better contrast for white text
 */
const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  onClick,
  hover = false,
  variant = 'neutral',
  density = 'default',
  borderGradient
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'glassBlue':
        return 'bg-blue-50/40 dark:bg-blue-900/20';
      case 'glassPurple':
        return 'bg-purple-50/40 dark:bg-purple-900/20';
      case 'glassGreen':
        return 'bg-green-50/40 dark:bg-green-900/20';
      default:
        return 'bg-white/30 dark:bg-white/5';
    }
  };

  const getDensityStyles = () => {
    return density === 'dense' ? 'p-3' : 'p-4';
  };

  const getBorderGradientStyles = () => {
    if (!borderGradient) return '';
    const gradients = {
      blue: 'border-blue-200 dark:border-blue-800',
      purple: 'border-purple-200 dark:border-purple-800',
      green: 'border-green-200 dark:border-green-800',
      pink: 'border-pink-200 dark:border-pink-800',
    };
    return gradients[borderGradient];
  };
  return (
    <div
      onClick={onClick}
      className={`
        relative
        ${getVariantStyles()}
        ${hover ? 'hover:bg-white/40 dark:hover:bg-white/8 cursor-pointer' : ''}
        border-2 ${getBorderGradientStyles() || 'border-white/60 dark:border-white/25'}
        rounded-2xl
        transition-all duration-300
        ${getDensityStyles()}
        ${className}
      `}
      style={{
        boxShadow: `
          0 12px 24px rgba(0, 0, 0, 0.15),
          inset 0 8px 16px -4px rgba(255, 255, 255, 0.6),
          inset 0 -6px 12px -3px rgba(0, 0, 0, 0.15),
          inset 0 0 0 1px rgba(255, 255, 255, 0.4)
        `
      }}
    >
      {children}
    </div>
  );
};

export default GlassCard;

